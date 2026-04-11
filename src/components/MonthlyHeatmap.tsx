import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isFuture, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { Button } from '@/components/ui/button';

export function MonthlyHeatmap() {
  const { getActiveHabits, isHabitCompletedForDate, isHabitScheduledForDate, isGhostMode } = useHabitContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const activeHabits = getActiveHabits();

  const { days, dayScores } = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const dayScores: Record<string, number> = {};
    for (const day of days) {
      if (isFuture(day) && !isToday(day)) {
        dayScores[format(day, 'yyyy-MM-dd')] = -1; // future
        continue;
      }
      const scheduled = activeHabits.filter(h => isHabitScheduledForDate(h, day));
      if (scheduled.length === 0) {
        dayScores[format(day, 'yyyy-MM-dd')] = -1;
        continue;
      }
      const completed = scheduled.filter(h => isHabitCompletedForDate(h, day)).length;
      dayScores[format(day, 'yyyy-MM-dd')] = Math.round((completed / scheduled.length) * 100);
    }

    return { days, dayScores };
  }, [currentMonth, activeHabits, isHabitCompletedForDate, isHabitScheduledForDate]);

  // Pad start of month
  const firstDayOfWeek = getDay(days[0]); // 0=Sun
  const paddingDays = firstDayOfWeek;

  const getIntensityClass = (score: number) => {
    if (score === -1) return 'bg-secondary/30';
    if (score === 0) return 'bg-secondary';
    if (score < 34) return isGhostMode ? 'bg-muted-foreground/20' : 'bg-primary/20';
    if (score < 67) return isGhostMode ? 'bg-muted-foreground/40' : 'bg-primary/40';
    if (score < 100) return isGhostMode ? 'bg-muted-foreground/70' : 'bg-primary/70';
    return isGhostMode ? 'bg-muted-foreground' : 'bg-primary';
  };

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Activity Heatmap
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-24 text-center">{format(currentMonth, 'MMM yyyy')}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdays.map((d, i) => (
            <div key={i} className="text-[10px] text-muted-foreground text-center">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const score = dayScores[key] ?? -1;
            return (
              <div
                key={key}
                className={cn(
                  "aspect-square rounded-sm transition-colors",
                  getIntensityClass(score)
                )}
                title={score >= 0 ? `${format(day, 'MMM d')}: ${score}%` : format(day, 'MMM d')}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3">
          <span className="text-[10px] text-muted-foreground mr-1">Less</span>
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className={cn("w-3 h-3 rounded-sm", isGhostMode ? "bg-muted-foreground/20" : "bg-primary/20")} />
          <div className={cn("w-3 h-3 rounded-sm", isGhostMode ? "bg-muted-foreground/40" : "bg-primary/40")} />
          <div className={cn("w-3 h-3 rounded-sm", isGhostMode ? "bg-muted-foreground/70" : "bg-primary/70")} />
          <div className={cn("w-3 h-3 rounded-sm", isGhostMode ? "bg-muted-foreground" : "bg-primary")} />
          <span className="text-[10px] text-muted-foreground ml-1">More</span>
        </div>
      </div>
    </div>
  );
}
