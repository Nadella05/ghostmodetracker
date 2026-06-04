import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isFuture, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type HeatVariant = 'habits' | 'calories' | 'hydration' | 'consistency';

interface Props {
  /** Custom data source: yyyy-MM-dd -> 0..100 score (or -1 for n/a). When omitted, derives from habits. */
  data?: Record<string, number>;
  variant?: HeatVariant;
  /** Optional tooltip detail renderer per date. */
  tooltipFor?: (dateKey: string) => string | undefined;
  title?: string;
}

export function MonthlyHeatmap({ data, variant = 'habits', tooltipFor, title = 'Activity Heatmap' }: Props) {
  const { getActiveHabits, isHabitCompletedForDate, isHabitScheduledForDate } = useHabitContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const activeHabits = getActiveHabits();

  const { days, dayScores } = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    if (data) {
      const scores: Record<string, number> = {};
      for (const day of days) {
        const key = format(day, 'yyyy-MM-dd');
        if (isFuture(day) && !isToday(day)) { scores[key] = -1; continue; }
        scores[key] = data[key] ?? -1;
      }
      return { days, dayScores: scores };
    }

    const dayScores: Record<string, number> = {};
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      if (isFuture(day) && !isToday(day)) { dayScores[key] = -1; continue; }
      const scheduled = activeHabits.filter(h => isHabitScheduledForDate(h, day));
      if (scheduled.length === 0) { dayScores[key] = -1; continue; }
      const completed = scheduled.filter(h => isHabitCompletedForDate(h, day)).length;
      dayScores[key] = Math.round((completed / scheduled.length) * 100);
    }
    return { days, dayScores };
  }, [currentMonth, activeHabits, isHabitCompletedForDate, isHabitScheduledForDate, data]);

  const firstDayOfWeek = getDay(days[0]);
  const paddingDays = firstDayOfWeek;

  const stepFor = (score: number): number => {
    if (score < 0) return -1;
    if (score === 0) return 0;
    if (score < 25) return 1;
    if (score < 50) return 2;
    if (score < 80) return 3;
    return 4;
  };

  const bgFor = (step: number) => {
    if (step < 0) return 'bg-secondary/20';
    return `bg-[hsl(var(--heat-${variant}-${step}))]`;
  };

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <TooltipProvider delayDuration={50}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            {title}
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
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekdays.map((d, i) => (
              <div key={i} className="text-[10px] text-muted-foreground text-center">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              const score = dayScores[key] ?? -1;
              const step = stepFor(score);
              const detail = tooltipFor?.(key);
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'aspect-square rounded-[5px] ring-1 ring-border/40 transition-all hover:scale-110 hover:ring-foreground/30',
                        bgFor(step),
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <div className="font-semibold">{format(day, 'EEE, MMM d')}</div>
                    {score >= 0 && <div className="text-muted-foreground">{score}%</div>}
                    {detail && <div className="text-muted-foreground">{detail}</div>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[10px] text-muted-foreground mr-1">Less</span>
            {[0, 1, 2, 3, 4].map(s => (
              <div key={s} className={cn('w-3 h-3 rounded-sm', bgFor(s))} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
