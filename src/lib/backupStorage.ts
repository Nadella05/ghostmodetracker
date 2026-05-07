// Tiny IndexedDB wrapper for storing the folder handle + backup settings.
const DB_NAME = 'ghost-tracker-backup';
const STORE = 'kv';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbDel(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const FOLDER_HANDLE_KEY = 'backup-folder-handle';
export const BACKUP_SETTINGS_KEY = 'backup-settings';
export const LAST_BACKUP_KEY = 'last-backup-meta';

export type BackupFrequency = 'manual' | 'six-hours' | 'daily' | 'weekly';

export interface BackupSettings {
  enabled: boolean;
  frequency: BackupFrequency;
  maxBackups: number;
}

export const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  enabled: false,
  frequency: 'daily',
  maxBackups: 30,
};

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// Aggregate the entire localStorage payload used by the app.
const APP_KEYS = [
  'habit-tracker-habits',
  'habit-tracker-settings',
  'habit-tracker-profile',
  'habit-tracker-water',
  'habit-tracker-xp',
  'habit-tracker-calories',
  'ghost_tracker_data_v1',
];

export interface FullBackup {
  version: number;
  createdAt: string;
  data: Record<string, unknown>;
}

export function buildFullBackup(): FullBackup {
  const data: Record<string, unknown> = {};
  // include known + any other habit-tracker-* / ghost_tracker_* keys
  const keys = new Set<string>(APP_KEYS);
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith('habit-tracker-') || k.startsWith('ghost_tracker_')) keys.add(k);
  }
  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (raw === null) continue;
    try { data[k] = JSON.parse(raw); } catch { data[k] = raw; }
  }
  return { version: 1, createdAt: new Date().toISOString(), data };
}

export function restoreFullBackup(backup: FullBackup): void {
  if (!backup || backup.version !== 1 || !backup.data) {
    throw new Error('Invalid backup file');
  }
  for (const [k, v] of Object.entries(backup.data)) {
    const value = typeof v === 'string' ? v : JSON.stringify(v);
    localStorage.setItem(k, value);
  }
}

export function backupFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `ghost-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}-${pad(date.getHours())}-${pad(date.getMinutes())}.json`;
}

export function frequencyToMs(f: BackupFrequency): number {
  switch (f) {
    case 'six-hours': return 6 * 60 * 60 * 1000;
    case 'daily':     return 24 * 60 * 60 * 1000;
    case 'weekly':    return 7 * 24 * 60 * 60 * 1000;
    default:          return Infinity;
  }
}
