import { Ghost, CheckCircle, Droplets, Flame, BarChart3, Settings, Plus, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';

type Tab = 'today' | 'water' | 'calories' | 'calendar' | 'analytics' | 'settings';

interface DesktopSidebarProps {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onAddHabit: () => void;
}

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'today',     label: 'Dashboard', icon: <CheckCircle className="h-5 w-5" /> },
  { id: 'water',     label: 'Water',     icon: <Droplets className="h-5 w-5" /> },
  { id: 'calories',  label: 'Calories',  icon: <Flame className="h-5 w-5" /> },
  { id: 'calendar',  label: 'Calendar',  icon: <CalendarIcon className="h-5 w-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'settings',  label: 'Settings',  icon: <Settings className="h-5 w-5" /> },
];

export function DesktopSidebar({ activeTab, onTabChange, onAddHabit }: DesktopSidebarProps) {
  const { profile, isGhostMode, xpSystem, settings } = useHabitContext();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r bg-card/40 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b">
        <div className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center",
          isGhostMode ? "bg-foreground/10" : "bg-primary/10"
        )}>
          <Ghost className={cn("h-5 w-5", isGhostMode ? "text-foreground" : "text-primary")} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold leading-tight truncate">Ghost Tracker</p>
          <p className="text-xs text-muted-foreground truncate">Hi, {profile.name}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer / quick actions */}
      <div className="p-3 border-t space-y-2">
        {!isGhostMode && settings.showXP && (
          <div className="px-3 py-2 rounded-lg bg-secondary/40 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Lvl {xpSystem.currentLevel}</span>
            <span className="text-xs text-muted-foreground ml-auto">{xpSystem.currentXP} XP</span>
          </div>
        )}
        <button
          onClick={onAddHabit}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> New Habit
        </button>
      </div>
    </aside>
  );
}
