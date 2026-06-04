import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getAchievementCategory, AchievementCategory } from '@/data/achievements';
import { Lock, CheckCircle2, Sparkles } from 'lucide-react';

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
  const pct = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="space-y-5">
      {/* Hero progress */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-accent/10 p-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Achievement Gallery</p>
            <h2 className="text-2xl font-bold mt-1">{unlockedCount} <span className="text-muted-foreground text-base font-medium">/ {ACHIEVEMENTS.length} unlocked</span></h2>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{pct}%</div>
            <p className="text-[10px] text-muted-foreground">complete</p>
          </div>
        </div>
        <div className="relative mt-4 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ACHIEVEMENT_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary',
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{filteredUnlocked}/{filtered.length} in this category</p>

      {/* Grid gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(a => {
          const isUnlocked = unlockedIds.includes(a.id);
          const rare = a.xpReward >= 500;
          return (
            <div
              key={a.id}
              className={cn(
                'group relative rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all',
                isUnlocked
                  ? 'bg-gradient-to-br from-primary/10 via-card to-accent/5 border-primary/30 hover:-translate-y-0.5 hover:shadow-elevated'
                  : 'bg-card/60 opacity-70',
                isUnlocked && rare && 'animate-pulse-glow ring-1 ring-primary/40',
              )}
            >
              {isUnlocked && rare && (
                <Sparkles className="absolute top-2 right-2 h-3.5 w-3.5 text-primary" />
              )}
              <div className={cn(
                'h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110',
                isUnlocked ? 'bg-primary/15' : 'bg-muted grayscale',
              )}>
                {isUnlocked ? a.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
              </div>
              <p className={cn('font-semibold text-sm leading-tight line-clamp-2', !isUnlocked && 'text-muted-foreground')}>
                {a.name}
              </p>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{a.description}</p>
              <div className="flex items-center gap-1 mt-auto">
                {isUnlocked && <CheckCircle2 className="h-3 w-3 text-primary" />}
                <span className={cn('text-[10px] font-bold', isUnlocked ? 'text-primary' : 'text-muted-foreground')}>
                  +{a.xpReward} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
