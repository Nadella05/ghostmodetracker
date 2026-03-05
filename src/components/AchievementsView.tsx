import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getAchievementCategory, AchievementCategory } from '@/data/achievements';
import { Lock, CheckCircle2 } from 'lucide-react';

export function AchievementsView() {
  const { profile, isGhostMode } = useHabitContext();
  const unlockedIds = profile.unlockedAchievements || [];
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('all');
  
  if (isGhostMode) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Achievements are hidden in Ghost Mode
      </div>
    );
  }

  const filtered = activeCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => getAchievementCategory(a.id) === activeCategory);

  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).length;
  const filteredUnlocked = filtered.filter(a => unlockedIds.includes(a.id)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Achievements
        </h3>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ACHIEVEMENT_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {filteredUnlocked}/{filtered.length} in this category
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((achievement) => {
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
                  "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0",
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
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
                
                <div className={cn(
                  "text-sm font-medium shrink-0",
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
