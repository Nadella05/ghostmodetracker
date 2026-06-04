import { useMemo } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Flame, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { useCalorieTracker } from '@/hooks/useCalorieTracker';

type Item = { id: string; ts: number; icon: React.ReactNode; title: string; sub: string; tint: string };

export function RecentActivity() {
  const { habits, waterTracker } = useHabitContext();
  const { getEntriesForDate } = useCalorieTracker();

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    // Latest habit completions
    for (const h of habits) {
      const last = h.completedDates?.[h.completedDates.length - 1];
      if (last) {
        out.push({
          id: 'h-' + h.id,
          ts: new Date(last).getTime(),
          icon: <CheckCircle className="h-4 w-4" />,
          title: h.name,
          sub: `Habit · ${format(new Date(last), 'MMM d')}`,
          tint: 'text-primary bg-primary/10',
        });
      }
    }
    // Latest calorie entries (today)
    const today = format(new Date(), 'yyyy-MM-dd');
    const calEntries = getEntriesForDate(today);
    for (const e of calEntries.slice(-4)) {
      out.push({
        id: 'c-' + e.id,
        ts: new Date(e.timestamp).getTime(),
        icon: <Flame className="h-4 w-4" />,
        title: e.input,
        sub: `${e.total} kcal · ${format(new Date(e.timestamp), 'p')}`,
        tint: 'text-orange-500 bg-orange-500/10',
      });
    }
    // Water today
    if (waterTracker.todayIntake > 0) {
      out.push({
        id: 'w-today',
        ts: Date.now(),
        icon: <Droplets className="h-4 w-4" />,
        title: `Hydrated ${waterTracker.todayIntake} ml`,
        sub: `Water · today`,
        tint: 'text-sky-500 bg-sky-500/10',
      });
    }
    return out.sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [habits, waterTracker.todayIntake, getEntriesForDate]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No recent activity yet — log a habit, meal, or water to get started.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card divide-y">
      {items.map(i => (
        <div key={i.id} className="flex items-center gap-3 p-3">
          <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', i.tint)}>
            {i.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{i.title}</p>
            <p className="text-[11px] text-muted-foreground">{i.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
