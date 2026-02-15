import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { Progress } from '@/components/ui/progress';
import { getXPForNextLevel, getLevelMilestone } from '@/types/habit';

interface XPDisplayProps {
  compact?: boolean;
  className?: string;
}

export function XPDisplay({ compact = false, className }: XPDisplayProps) {
  const { profile, isGhostMode, settings } = useHabitContext();
  
  // Don't show XP in ghost mode or if disabled in settings
  if (isGhostMode || !settings.showXP) return null;
  
  const { current, required, progress } = getXPForNextLevel(profile.xp);
  const milestone = getLevelMilestone(profile.level);
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-lg">{milestone.icon}</span>
        <div className="flex flex-col">
          <span className="text-xs font-medium">Lv.{profile.level}</span>
          <Progress value={progress} className="h-1 w-16" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{milestone.icon}</span>
          <div>
            <p className="font-semibold">Level {profile.level}</p>
            <p className="text-sm text-muted-foreground">{milestone.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{profile.xp} XP</p>
          <p className="text-xs text-muted-foreground">Total earned</p>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{current} / {required} XP</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        {profile.level < 10 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {required - current} XP to Level {profile.level + 1}
          </p>
        )}
      </div>
    </div>
  );
}
