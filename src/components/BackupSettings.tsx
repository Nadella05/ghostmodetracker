import { useRef } from 'react';
import { FolderOpen, FolderSync, Download, Trash2, RefreshCw, Upload, AlertCircle, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBackupSystem } from '@/hooks/useBackupSystem';
import { useToast } from '@/hooks/use-toast';
import type { BackupFrequency } from '@/lib/backupStorage';
import { format } from 'date-fns';

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function BackupSettings() {
  const {
    supported, folderName, settings, setSettings, history, lastBackup, error,
    selectFolder, clearFolder, runBackup, restoreFromFile, restoreFromHistory, deleteBackup,
  } = useBackupSystem();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const handleBackupNow = async () => {
    const ok = await runBackup(true);
    toast({
      title: ok ? 'Backup saved' : 'No backup created',
      description: ok ? 'Latest data written to the folder.' : (error ?? 'Data unchanged since last backup.'),
      variant: ok ? 'default' : 'destructive',
    });
  };

  const handlePickFile = () => fileInput.current?.click();

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = await restoreFromFile(f);
    if (!ok) toast({ title: 'Restore failed', description: 'Invalid backup file.', variant: 'destructive' });
  };

  if (!supported) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">Folder backups not supported</p>
            <p className="text-sm text-muted-foreground">
              This browser doesn't support the File System Access API. Use Chrome, Edge or Brave for automatic folder backups.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handlePickFile}>
              <Upload className="h-4 w-4 mr-2" /> Restore from file
            </Button>
            <input ref={fileInput} type="file" accept="application/json" className="hidden" onChange={handleRestoreFile} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="flex items-start gap-3">
          <HardDrive className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Backup folder</p>
            <p className="text-sm text-muted-foreground truncate">
              {folderName ?? 'No folder selected'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={selectFolder}>
              <FolderOpen className="h-4 w-4 mr-2" />
              {folderName ? 'Change' : 'Select'}
            </Button>
            {folderName && (
              <Button size="sm" variant="ghost" onClick={clearFolder}>Clear</Button>
            )}
          </div>
        </div>

        {folderName && (
          <>
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="font-medium">Automatic backups</p>
                <p className="text-sm text-muted-foreground">
                  Run backups on a schedule while the app is open.
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Frequency</p>
              <Select
                value={settings.frequency}
                onValueChange={(v) => setSettings({ ...settings, frequency: v as BackupFrequency })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual only</SelectItem>
                  <SelectItem value="six-hours">Every 6 hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Keep latest</p>
              <Select
                value={String(settings.maxBackups)}
                onValueChange={(v) => setSettings({ ...settings, maxBackups: Number(v) })}
              >
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 backups</SelectItem>
                  <SelectItem value="30">30 backups</SelectItem>
                  <SelectItem value="100">100 backups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button size="sm" onClick={handleBackupNow}>
                <FolderSync className="h-4 w-4 mr-2" /> Backup now
              </Button>
              <Button size="sm" variant="outline" onClick={handlePickFile}>
                <Upload className="h-4 w-4 mr-2" /> Restore from file
              </Button>
              <input ref={fileInput} type="file" accept="application/json" className="hidden" onChange={handleRestoreFile} />
            </div>

            {lastBackup && (
              <p className="text-xs text-muted-foreground">
                Last backup: {format(new Date(lastBackup.at), 'PPp')} — {lastBackup.name}
              </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </>
        )}
      </div>

      {folderName && history.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <p className="font-medium">Backup history</p>
            <span className="text-xs text-muted-foreground">{history.length} files</span>
          </div>
          <ul className="divide-y max-h-72 overflow-auto">
            {history.map((it) => (
              <li key={it.name} className="flex items-center gap-3 p-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono text-xs">{it.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(it.lastModified), 'PPp')} · {fmtBytes(it.size)}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => restoreFromHistory(it.name)} title="Restore">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteBackup(it.name)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
