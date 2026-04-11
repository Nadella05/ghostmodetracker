import { format } from 'date-fns';
import { CheckCircle, Flame, Droplets, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { useCalorieTracker } from '@/hooks/useCalorieTracker';
import { Progress } from '@/components/ui/progress';

export function DailySummary() {
  const { getTodaysHabits, isHabitCompletedForDate, isGhostMode, waterTracker } = useHabitContext();
  const { getDailyTotal, calorieGoal } = useCalorieTracker();

  const todaysHabits = getTodaysHabits();
  const today = new Date();
  const completedCount = todaysHabits.filter(h => isHabitCompletedForDate(h, today)).length;
  const totalHabits = todaysHabits.length;
  const habitPercent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  const caloriesConsumed = getDailyTotal();
  const caloriePercent = Math.min(Math.round((caloriesConsumed / calorieGoal) * 100), 100);
  const calorieRemaining = Math.max(calorieGoal - caloriesConsumed, 0);

  const waterProgress = waterTracker.getProgress();

  if (isGhostMode) {
    return (
      <div className="rounded-xl border bg-card p-4 mb-4">
        <div className="grid grid-cols-3 gap-3 text-center font-mono">
          <div>
            <p className="text-xl font-bold">{completedCount}/{totalHabits}</p>
            <p className="text-[10px] text-muted-foreground">habits</p>
          </div>
          <div>
            <p className="text-xl font-bold">{caloriesConsumed}</p>
            <p className="text-[10px] text-muted-foreground">kcal</p>
          </div>
          <div>
            <p className="text-xl font-bold">{waterProgress.intake}</p>
            <p className="text-[10px] text-muted-foreground">ml water</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 mb-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Today's Progress</h3>
      </div>

      {/* Habits */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <CheckCircle className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Habits</span>
            <span className="text-muted-foreground">{completedCount}/{totalHabits}</span>
          </div>
          <Progress value={habitPercent} className="h-1.5" />
        </div>
      </div>

      {/* Calories */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Flame className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Calories</span>
            <span className="text-muted-foreground">{caloriesConsumed}/{calorieGoal} kcal</span>
          </div>
          <Progress value={caloriePercent} className="h-1.5" />
        </div>
      </div>

      {/* Water */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <Droplets className="h-4 w-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Water</span>
            <span className="text-muted-foreground">{waterProgress.intake}/{waterProgress.goal} ml</span>
          </div>
          <Progress value={waterProgress.percentage} className="h-1.5" />
        </div>
      </div>

      {/* Remaining calories */}
      {calorieRemaining > 0 && (
        <p className="text-xs text-muted-foreground text-center pt-1">
          {calorieRemaining} kcal remaining today
        </p>
      )}
    </div>
  );
}
