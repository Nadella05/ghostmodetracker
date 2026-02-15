import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { ACHIEVEMENTS } from '@/types/habit';
import { Lock, CheckCircle2 } from 'lucide-react';

export function AchievementsView() {
  const { profile, isGhostMode } = useHabitContext();
  const unlockedIds = profile.unlockedAchievements || [];
  
  if (isGhostMode) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Achievements are hidden in Ghost Mode
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Achievements
        </h3>
        <span className="text-sm text-muted-foreground">
          {unlockedIds.length}/{ACHIEVEMENTS.length} unlocked
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          
          return (
            <div
              key={achievement.id}
              className={cn(
                "rounded-xl border p-4 transition-all",
                isUnlocked 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-card opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                  isUnlocked ? "bg-primary/10" : "bg-muted"
                )}>
                  {isUnlocked ? achievement.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-medium",
                      !isUnlocked && "text-muted-foreground"
                    )}>
                      {achievement.name}
                    </p>
                    {isUnlocked && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
                
                <div className={cn(
                  "text-sm font-medium",
                  isUnlocked ? "text-primary" : "text-muted-foreground"
                )}>
                  +{achievement.xpReward} XP
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
