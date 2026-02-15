import { useState } from 'react';
import { 
  Ghost, 
  Sun, 
  Download, 
  Upload, 
  Bell, 
  BellOff, 
  Sparkles, 
  Skull,
  Archive,
  Palette,
  User,
  Trophy,
  LogOut,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { ThemeColorPicker } from '@/components/ThemeColorPicker';
import { ArchivedHabitsView } from '@/components/ArchivedHabitsView';
import { AchievementsView } from '@/components/AchievementsView';
import { XPDisplay } from '@/components/XPDisplay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type SettingsSubView = 'main' | 'archived' | 'achievements';

export function SettingsView() {
  const { 
    settings, 
    updateSettings, 
    toggleMode, 
    isGhostMode,
    exportData,
    exportDataCSV,
    importData,
    profile,
    updateProfile,
    setThemeColor,
    logout,
  } = useHabitContext();
  const { toast } = useToast();
  const { requestPermission, permission, isSupported } = useNotifications();
  const [subView, setSubView] = useState<SettingsSubView>('main');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  const handleExportJSON = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Your habits have been exported as JSON.",
    });
  };

  const handleExportCSV = () => {
    const data = exportDataCSV();
    if (!data) {
      toast({
        title: "No data to export",
        description: "Add some habits first.",
        variant: "destructive",
      });
      return;
    }
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Your habits have been exported as CSV.",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            if (importData(result)) {
              toast({
                title: "Import successful",
                description: "Your habits have been restored.",
              });
            } else {
              toast({
                title: "Import failed",
                description: "Invalid backup file format.",
                variant: "destructive",
              });
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    const granted = await requestPermission();
    if (granted) {
      updateSettings({ showNotifications: true, notificationPermission: 'granted' });
      toast({
        title: "Notifications enabled",
        description: "You'll receive habit reminders.",
      });
    } else {
      updateSettings({ notificationPermission: 'denied' });
      toast({
        title: "Permission denied",
        description: "Enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleSaveName = () => {
    updateProfile({ name: tempName.trim() });
    setEditingName(false);
    toast({
      title: "Name updated",
      description: "Your display name has been changed.",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "All data has been cleared.",
    });
  };

  if (subView === 'archived') {
    return <ArchivedHabitsView onBack={() => setSubView('main')} />;
  }

  if (subView === 'achievements') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSubView('main')} className="mb-2">
          ← Back to Settings
        </Button>
        <AchievementsView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Display (Normal Mode only) */}
      {!isGhostMode && settings.showXP && <XPDisplay />}

      {/* User Profile */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Profile
        </h3>
        
        <div className="rounded-xl border bg-card p-4 space-y-4">
          {/* Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-8 w-40"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveName}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{profile.name}</p>
                    <button 
                      onClick={() => { setTempName(profile.name); setEditingName(true); }}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit name
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Theme Color */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-3 mb-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Accent Color</span>
            </div>
            <ThemeColorPicker 
              value={profile.themeColor} 
              onChange={setThemeColor}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Achievements (Normal Mode only) */}
      {!isGhostMode && (
        <div className="rounded-xl border bg-card">
          <button
            onClick={() => setSubView('achievements')}
            className="flex items-center justify-between w-full p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-medium">Achievements</span>
                <p className="text-sm text-muted-foreground">
                  {profile.unlockedAchievements?.length || 0} unlocked
                </p>
              </div>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
        </div>
      )}

      {/* XP Toggle (Normal Mode only) */}
      {!isGhostMode && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-medium">Show XP & Level</span>
                <p className="text-sm text-muted-foreground">
                  Display leveling progress
                </p>
              </div>
            </div>
            <Switch
              checked={settings.showXP}
              onCheckedChange={(checked) => updateSettings({ showXP: checked })}
            />
          </div>
        </div>
      )}

      {/* Mode Switch */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isGhostMode ? (
              <Ghost className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <div>
              <p className="font-medium">
                {isGhostMode ? 'Ghost Mode' : 'Normal Mode'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isGhostMode 
                  ? 'Discipline-focused. No distractions.' 
                  : 'Motivation-friendly with streaks'}
              </p>
            </div>
          </div>
          <Button 
            variant={isGhostMode ? "secondary" : "default"}
            size="sm"
            onClick={toggleMode}
          >
            {isGhostMode ? 'Exit' : 'Enter Ghost Mode'}
          </Button>
        </div>
      </div>

      {/* Mode Description */}
      <div className={cn(
        "rounded-xl border p-4",
        isGhostMode ? "bg-card border-border" : "bg-primary/5 border-primary/20"
      )}>
        <div className="flex items-start gap-3">
          {isGhostMode ? (
            <Skull className="h-5 w-5 mt-0.5 shrink-0" />
          ) : (
            <Sparkles className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
          )}
          <div className="space-y-2">
            <h3 className="font-medium">
              {isGhostMode ? 'Ghost Mode Active' : 'Normal Mode Active'}
            </h3>
            {isGhostMode ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• No animations or celebrations</li>
                <li>• Streaks hidden (long-press to reveal)</li>
                <li>• Focus on discipline score</li>
                <li>• Dark, minimal interface</li>
              </ul>
            ) : (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Visible streaks with fire indicator 🔥</li>
                <li>• XP system with levels & achievements</li>
                <li>• Weekly & monthly insights</li>
                <li>• Habit strength indicators</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Notifications
        </h3>
        
        <div className="rounded-xl border bg-card divide-y">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {settings.showNotifications ? (
                <Bell className="h-5 w-5 text-muted-foreground" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <span className="font-medium">Habit Reminders</span>
                <p className="text-sm text-muted-foreground">
                  {permission === 'granted' 
                    ? 'Notifications enabled' 
                    : 'Get reminded about your habits'}
                </p>
              </div>
            </div>
            {permission === 'granted' ? (
              <Switch
                checked={settings.showNotifications}
                onCheckedChange={(checked) => updateSettings({ showNotifications: checked })}
              />
            ) : (
              <Button size="sm" variant="outline" onClick={handleEnableNotifications}>
                Enable
              </Button>
            )}
          </div>
        </div>
        
        {isGhostMode && settings.showNotifications && (
          <p className="text-xs text-muted-foreground">
            In Ghost Mode, notifications are text-only and silent.
          </p>
        )}
      </div>

      {/* Archived Habits */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Habits
        </h3>
        
        <div className="rounded-xl border bg-card">
          <button
            onClick={() => setSubView('archived')}
            className="flex items-center justify-between w-full p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Archived Habits</span>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Data
        </h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" className="w-full" onClick={handleExportCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <Button variant="outline" className="w-full" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import Backup
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Your data is stored locally on this device.
        </p>
      </div>

      {/* Logout */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Account
        </h3>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout & Clear Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your habits, settings, and progress. 
                Export your data first if you want to keep a backup.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Yes, logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* About */}
      <div className="text-center pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Habit Tracker v1.0
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Built for discipline. Privacy-first.
        </p>
      </div>
    </div>
  );
}
