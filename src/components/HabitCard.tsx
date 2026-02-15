import { useState } from 'react';
import { 
  Check, 
  Flame, 
  MoreVertical, 
  Archive,
  Edit,
  Snowflake
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit, CATEGORY_LABELS, WEEKDAYS } from '@/types/habit';
import { useHabitContext } from '@/contexts/HabitContext';
import { AnimatedCategoryIcon } from '@/components/AnimatedCategoryIcon';
import { FreezeStreakModal } from '@/components/FreezeStreakModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface HabitCardProps {
  habit: Habit;
  date?: Date;
  onEdit?: (habit: Habit) => void;
}

export function HabitCard({ habit, date = new Date(), onEdit }: HabitCardProps) {
  const { 
    toggleHabitForDate, 
    isHabitCompletedForDate, 
    isHabitFrozenForDate,
    canFreezeHabit,
    getStreakForHabit,
    archiveHabit,
    isGhostMode,
    xpSystem,
    habits,
    getHabitStats,
    profile
  } = useHabitContext();
  const { toast } = useToast();
  
  const [showStreak, setShowStreak] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const isCompleted = isHabitCompletedForDate(habit, date);
  const isFrozen = isHabitFrozenForDate(habit, date);
  const streak = getStreakForHabit(habit);

  const computeXPStats = () => {
    const activeHabits = habits.filter(h => !h.archived);
    const allStats = activeHabits.map(h => getHabitStats(h));
    const totalCompletions = activeHabits.reduce((sum, h) => sum + h.completedDates.length, 0);
    const longestStreak = Math.max(0, ...allStats.map(s => s.longestStreak));
    const currentStreak = Math.max(0, ...allStats.map(s => s.currentStreak));
    const allDates = new Set<string>();
    activeHabits.forEach(h => h.completedDates.forEach(d => allDates.add(d)));
    const perfectDays = allDates.size;
    return {
      totalCompletions,
      totalHabits: activeHabits.length,
      longestStreak,
      currentStreak,
      daysActive: allDates.size,
      perfectDays,
      level: profile.level,
    };
  };

  const handleToggle = () => {
    if (isFrozen) return; // Can't toggle a frozen day
    const wasCompleted = isCompleted;
    toggleHabitForDate(habit.id, date);
    
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday && !isGhostMode) {
      if (!wasCompleted) {
        const result = xpSystem.awardCompletionXP(habit.id);
        if (result.awarded) {
          toast({
            title: `+${xpSystem.xpPerCompletion} XP`,
            description: result.leveledUp ? '🎉 Level up!' : habit.name,
            duration: 2000,
          });
          setTimeout(() => {
            const stats = computeXPStats();
            const newAchievements = xpSystem.forceAchievementCheck(stats);
            newAchievements.forEach(achievement => {
              toast({
                title: `🏆 Achievement Unlocked!`,
                description: `${achievement.icon} ${achievement.name} (+${achievement.xpReward} XP)`,
                duration: 4000,
              });
            });
          }, 500);
        }
      } else {
        xpSystem.removeCompletionXP(habit.id);
      }
    }
  };

  const handleLongPress = () => {
    if (isGhostMode) {
      setShowStreak(true);
      setTimeout(() => setShowStreak(false), 2000);
    }
  };

  const getFrequencyLabel = () => {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'weekly' && habit.customDays && habit.customDays.length > 0) {
      const dayLabels = habit.customDays.map(d => WEEKDAYS.find(w => w.value === d)?.label || '').join(', ');
      return dayLabels;
    }
    return 'Weekly';
  };

  const freezeReason = isFrozen && habit.freezes ? habit.freezes[new Intl.DateTimeFormat('en-CA').format(date)]?.reason : null;

  return (
    <>
      <div 
        className={cn(
          "group relative flex items-center gap-4 rounded-xl border p-4 transition-all shadow-sm",
          isFrozen
            ? "border-sky-300/30 bg-sky-50/5"
            : isCompleted 
              ? "border-success/30 bg-success/5" 
              : "border-border bg-card hover:border-primary/20 hover:shadow-md",
          !isGhostMode && isCompleted && "animate-scale-in"
        )}
      >
        {/* Checkbox / Frozen indicator */}
        <button
          onClick={handleToggle}
          onContextMenu={(e) => { e.preventDefault(); handleLongPress(); }}
          disabled={isFrozen}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            isFrozen
              ? "border-sky-300/50 bg-sky-100/10 cursor-default"
              : isCompleted
                ? "border-success bg-success text-success-foreground"
                : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5",
            !isGhostMode && isCompleted && "habit-check-animation"
          )}
        >
          {isFrozen ? (
            <Snowflake className="h-5 w-5 text-sky-400" />
          ) : isCompleted ? (
            <Check className="h-5 w-5" strokeWidth={3} />
          ) : null}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {!isGhostMode && (
              <AnimatedCategoryIcon category={habit.category} size={18} />
            )}
            <h3 className={cn(
              "font-medium truncate",
              isCompleted && "text-muted-foreground line-through",
              isFrozen && "text-muted-foreground"
            )}>
              {habit.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {isFrozen 
              ? `🧊 Frozen — ${freezeReason || 'No reason'}`
              : `${CATEGORY_LABELS[habit.category]} • ${getFrequencyLabel()}`
            }
          </p>
        </div>

        {/* Streak */}
        {!isGhostMode && streak > 0 && !isFrozen && (
          <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium streak-fire">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-primary">{streak}</span>
          </div>
        )}

        {isGhostMode && showStreak && streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-mono">
            <span>{streak}d</span>
          </div>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary rounded-lg">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isCompleted && !isFrozen && canFreezeHabit(habit, date) && (
              <DropdownMenuItem onClick={() => setFreezeOpen(true)}>
                <Snowflake className="h-4 w-4 mr-2 text-sky-400" />
                Freeze Streak
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit?.(habit)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => archiveHabit(habit.id)}
              className="text-muted-foreground"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <FreezeStreakModal
        open={freezeOpen}
        onOpenChange={setFreezeOpen}
        habit={habit}
        date={date}
      />
    </>
  );
}
