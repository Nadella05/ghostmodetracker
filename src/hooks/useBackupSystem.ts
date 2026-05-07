import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BACKUP_SETTINGS_KEY,
  BackupSettings,
  DEFAULT_BACKUP_SETTINGS,
  FOLDER_HANDLE_KEY,
  LAST_BACKUP_KEY,
  backupFilename,
  buildFullBackup,
  frequencyToMs,
  idbDel,
  idbGet,
  idbSet,
  isFileSystemAccessSupported,
  restoreFullBackup,
} from '@/lib/backupStorage';

export interface BackupHistoryItem {
  name: string;
  size: number;
  lastModified: number;
}

interface LastBackupMeta {
  at: number;
  name: string;
  hash: string;
}

async function hashString(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// FileSystemDirectoryHandle is from File System Access API; type loosely.
type DirHandle = any;

async function verifyPermission(handle: DirHandle, write = true): Promise<boolean> {
  if (!handle) return false;
  const opts = { mode: write ? 'readwrite' : 'read' } as any;
  try {
    if ((await handle.queryPermission?.(opts)) === 'granted') return true;
    if ((await handle.requestPermission?.(opts)) === 'granted') return true;
  } catch { /* noop */ }
  return false;
}

export function useBackupSystem() {
  const supported = isFileSystemAccessSupported();
  const [folderName, setFolderName] = useState<string | null>(null);
  const [settings, setSettings] = useState<BackupSettings>(DEFAULT_BACKUP_SETTINGS);
  const [history, setHistory] = useState<BackupHistoryItem[]>([]);
  const [lastBackup, setLastBackup] = useState<LastBackupMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<DirHandle | null>(null);
  const runningRef = useRef(false);

  const loadHistory = useCallback(async () => {
    const handle = handleRef.current;
    if (!handle) { setHistory([]); return; }
    if (!(await verifyPermission(handle, false))) return;
    const items: BackupHistoryItem[] = [];
    try {
      for await (const [name, entry] of (handle as any).entries()) {
        if (entry.kind !== 'file') continue;
        if (!name.startsWith('ghost-backup-') || !name.endsWith('.json')) continue;
        const file = await entry.getFile();
        items.push({ name, size: file.size, lastModified: file.lastModified });
      }
    } catch (e) {
      // ignore
    }
    items.sort((a, b) => b.lastModified - a.lastModified);
    setHistory(items);
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      const handle = await idbGet<DirHandle>(FOLDER_HANDLE_KEY);
      if (handle) {
        handleRef.current = handle;
        setFolderName((handle as any).name ?? 'Selected folder');
      }
      const s = await idbGet<BackupSettings>(BACKUP_SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_BACKUP_SETTINGS, ...s });
      const last = await idbGet<LastBackupMeta>(LAST_BACKUP_KEY);
      if (last) setLastBackup(last);
      await loadHistory();
    })();
  }, [loadHistory]);

  const persistSettings = useCallback(async (next: BackupSettings) => {
    setSettings(next);
    await idbSet(BACKUP_SETTINGS_KEY, next);
  }, []);

  const selectFolder = useCallback(async () => {
    if (!supported) { setError('Folder backups require Chrome, Edge or Brave.'); return false; }
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      if (!(await verifyPermission(handle, true))) {
        setError('Write permission denied.'); return false;
      }
      handleRef.current = handle;
      setFolderName(handle.name);
      await idbSet(FOLDER_HANDLE_KEY, handle);
      setError(null);
      await loadHistory();
      return true;
    } catch (e) {
      // user cancelled — silent
      return false;
    }
  }, [supported, loadHistory]);

  const clearFolder = useCallback(async () => {
    handleRef.current = null;
    setFolderName(null);
    await idbDel(FOLDER_HANDLE_KEY);
    setHistory([]);
  }, []);

  const cleanupOldBackups = useCallback(async (handle: DirHandle, max: number) => {
    const items: { name: string; lastModified: number }[] = [];
    for await (const [name, entry] of (handle as any).entries()) {
      if (entry.kind !== 'file') continue;
      if (!name.startsWith('ghost-backup-') || !name.endsWith('.json')) continue;
      const file = await entry.getFile();
      items.push({ name, lastModified: file.lastModified });
    }
    items.sort((a, b) => b.lastModified - a.lastModified);
    const toDelete = items.slice(max);
    for (const it of toDelete) {
      try { await (handle as any).removeEntry(it.name); } catch { /* ignore */ }
    }
  }, []);

  const runBackup = useCallback(async (force = false): Promise<boolean> => {
    if (runningRef.current) return false;
    const handle = handleRef.current;
    if (!handle) { setError('Pick a backup folder first.'); return false; }
    if (!(await verifyPermission(handle, true))) {
      setError('Folder permission lost — please reselect.'); return false;
    }
    runningRef.current = true;
    try {
      const payload = buildFullBackup();
      const json = JSON.stringify(payload, null, 2);
      const hash = await hashString(json);
      if (!force && lastBackup && lastBackup.hash === hash) {
        return false; // no change
      }
      const name = backupFilename();
      const fileHandle = await (handle as any).getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      const meta: LastBackupMeta = { at: Date.now(), name, hash };
      setLastBackup(meta);
      await idbSet(LAST_BACKUP_KEY, meta);
      await cleanupOldBackups(handle, settings.maxBackups);
      await loadHistory();
      setError(null);
      return true;
    } catch (e) {
      setError('Automatic backup failed.');
      return false;
    } finally {
      runningRef.current = false;
    }
  }, [lastBackup, settings.maxBackups, cleanupOldBackups, loadHistory]);

  // Scheduler — checks every minute while app is open.
  useEffect(() => {
    if (!settings.enabled || settings.frequency === 'manual' || !folderName) return;
    const interval = frequencyToMs(settings.frequency);
    const tick = () => {
      const due = !lastBackup || Date.now() - lastBackup.at >= interval;
      if (due) runBackup(false);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [settings.enabled, settings.frequency, folderName, lastBackup, runBackup]);

  const restoreFromFile = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      restoreFullBackup(parsed);
      window.location.reload();
      return true;
    } catch {
      setError('Invalid backup file.');
      return false;
    }
  }, []);

  const restoreFromHistory = useCallback(async (name: string): Promise<boolean> => {
    const handle = handleRef.current;
    if (!handle) return false;
    if (!(await verifyPermission(handle, false))) return false;
    try {
      const fh = await (handle as any).getFileHandle(name);
      const file = await fh.getFile();
      return await restoreFromFile(file);
    } catch {
      setError('Could not read backup file.');
      return false;
    }
  }, [restoreFromFile]);

  const deleteBackup = useCallback(async (name: string) => {
    const handle = handleRef.current;
    if (!handle) return;
    if (!(await verifyPermission(handle, true))) return;
    try {
      await (handle as any).removeEntry(name);
      await loadHistory();
    } catch { /* ignore */ }
  }, [loadHistory]);

  return {
    supported,
    folderName,
    settings,
    setSettings: persistSettings,
    history,
    lastBackup,
    error,
    selectFolder,
    clearFolder,
    runBackup,
    restoreFromFile,
    restoreFromHistory,
    deleteBackup,
    refreshHistory: loadHistory,
  };
}
