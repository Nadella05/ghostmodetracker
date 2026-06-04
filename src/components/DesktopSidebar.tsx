import {
  Ghost, LayoutDashboard, CheckCircle, Droplets, Flame, BarChart3,
  Settings, Plus, Trophy, Calendar as CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';

type Tab = 'dashboard' | 'today' | 'water' | 'calories' | 'calendar' | 'analytics' | 'achievements' | 'settings';

interface DesktopSidebarProps {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onAddHabit: () => void;
}

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'today',        label: 'Habits',       icon: <CheckCircle className="h-5 w-5" /> },
  { id: 'calories',     label: 'Calories',     icon: <Flame className="h-5 w-5" /> },
  { id: 'water',        label: 'Hydration',    icon: <Droplets className="h-5 w-5" /> },
  { id: 'calendar',     label: 'Calendar',     icon: <CalendarIcon className="h-5 w-5" /> },
  { id: 'analytics',    label: 'Analytics',    icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'achievements', label: 'Achievements', icon: <Trophy className="h-5 w-5" /> },
  { id: 'settings',     label: 'Settings',     icon: <Settings className="h-5 w-5" /> },
];

export function DesktopSidebar({ activeTab, onTabChange, onAddHabit }: DesktopSidebarProps) {
  const { profile, isGhostMode, xpSystem, settings } = useHabitContext();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r bg-card/40 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-5 py-5 border-b">
        <div className={cn(
          'h-10 w-10 rounded-2xl flex items-center justify-center shadow-inner',
          isGhostMode ? 'bg-foreground/10' : 'bg-gradient-to-br from-primary/20 to-accent/20',
        )}>
          <Ghost className={cn('h-5 w-5', isGhostMode ? 'text-foreground' : 'text-primary')} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold leading-tight truncate">Ghost Tracker</p>
          <p className="text-xs text-muted-foreground truncate">Hi, {profile.name}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === item.id
                ? isGhostMode
                  ? 'bg-foreground/10 text-foreground'
                  : 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t space-y-2">
        {!isGhostMode && settings.showXP && (
          <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Lvl {xpSystem.currentLevel}</span>
            <span className="text-xs text-muted-foreground ml-auto">{xpSystem.currentXP} XP</span>
          </div>
        )}
        <button
          onClick={onAddHabit}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition',
            isGhostMode
              ? 'bg-foreground text-background hover:opacity-90'
              : 'bg-primary text-primary-foreground hover:opacity-90 shadow shadow-primary/20',
          )}
        >
          <Plus className="h-4 w-4" /> New Habit
        </button>
      </div>
    </aside>
  );
}
