import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { useCalorieTracker } from '@/hooks/useCalorieTracker';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { CalendarCheck, Flame, Zap, Trophy } from 'lucide-react';

export function AdvancedStats() {
  const { getActiveHabits, isHabitCompletedForDate, isHabitScheduledForDate, isGhostMode } = useHabitContext();
  const { getWeeklyCalories, calorieGoal, getEntriesForDate } = useCalorieTracker();

  const activeHabits = getActiveHabits();

  const weeklyCalories = getWeeklyCalories();

  const { consistencyScore, avgCalories, bestDay, worstDay, perfectDays, daysActive } = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: now });

    let totalScheduled = 0;
    let totalCompleted = 0;
    let perfectDays = 0;
    let daysActive = 0;

    // Daily calorie totals for the last 7 days
    let bestDay = { date: '', total: 0 };
    let worstDay = { date: '', total: Infinity };
    let calorieSum = 0;
    let calorieDaysCount = 0;

    for (const day of days) {
      const scheduled = activeHabits.filter(h => isHabitScheduledForDate(h, day));
      const completed = scheduled.filter(h => isHabitCompletedForDate(h, day));

      totalScheduled += scheduled.length;
      totalCompleted += completed.length;

      if (scheduled.length > 0 && completed.length === scheduled.length) {
        perfectDays++;
      }
      if (completed.length > 0) {
        daysActive++;
      }

      // Calorie stats
      const dateStr = format(day, 'yyyy-MM-dd');
      const entries = getEntriesForDate(dateStr);
      const dayTotal = entries.reduce((s, e) => s + e.total, 0);
      if (dayTotal > 0) {
        calorieSum += dayTotal;
        calorieDaysCount++;
        if (dayTotal > bestDay.total) {
          bestDay = { date: format(day, 'EEE, MMM d'), total: dayTotal };
        }
        if (dayTotal < worstDay.total) {
          worstDay = { date: format(day, 'EEE, MMM d'), total: dayTotal };
        }
      }
    }

    const consistencyScore = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    const avgCalories = calorieDaysCount > 0 ? Math.round(calorieSum / calorieDaysCount) : 0;

    if (worstDay.total === Infinity) worstDay = { date: '-', total: 0 };

    return { consistencyScore, avgCalories, bestDay, worstDay, perfectDays, daysActive };
  }, [activeHabits, isHabitCompletedForDate, isHabitScheduledForDate, getEntriesForDate]);

  return (
    <div className="space-y-4">
      {/* Consistency Score - Hero metric */}
      <div className={cn(
        "rounded-xl border p-5 text-center",
        !isGhostMode && "border-primary/30 bg-primary/5"
      )}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className={cn("h-5 w-5", isGhostMode ? "text-muted-foreground" : "text-primary")} />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Consistency Score
          </h3>
        </div>
        <p className={cn(
          "text-5xl font-mono font-bold",
          !isGhostMode && consistencyScore >= 80 && "text-success",
          !isGhostMode && consistencyScore < 50 && "text-destructive"
        )}>
          {consistencyScore}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          completed / scheduled this month
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MiniStat icon={<CalendarCheck className="h-4 w-4" />} label="Perfect Days" value={String(perfectDays)} />
        <MiniStat icon={<Trophy className="h-4 w-4" />} label="Days Active" value={String(daysActive)} />
        <MiniStat icon={<Flame className="h-4 w-4" />} label="Avg Calories" value={avgCalories > 0 ? `${avgCalories}` : '-'} />
        <MiniStat icon={<Flame className="h-4 w-4" />} label="Goal" value={`${calorieGoal}`} />
      </div>

      {/* Weekly Calorie Chart */}
      {weeklyCalories.some(d => d.total > 0) && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Weekly Calories
          </h3>
          <div className="rounded-xl border bg-card p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyCalories}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => [`${value} kcal`, 'Calories']}
                />
                <ReferenceLine y={calorieGoal} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <Bar
                  dataKey="total"
                  fill={isGhostMode ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              Dashed line = {calorieGoal} kcal goal
            </p>
          </div>
        </div>
      )}

      {/* Best / Worst Day */}
      {(bestDay.total > 0 || worstDay.total > 0) && !isGhostMode && (
        <div className="grid grid-cols-2 gap-3">
          {bestDay.total > 0 && (
            <div className="rounded-xl border bg-card p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Highest Cal Day</p>
              <p className="text-sm font-medium">{bestDay.date}</p>
              <p className="text-xs text-muted-foreground">{bestDay.total} kcal</p>
            </div>
          )}
          {worstDay.total > 0 && (
            <div className="rounded-xl border bg-card p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Lowest Cal Day</p>
              <p className="text-sm font-medium">{worstDay.date}</p>
              <p className="text-xs text-muted-foreground">{worstDay.total} kcal</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold font-mono leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
