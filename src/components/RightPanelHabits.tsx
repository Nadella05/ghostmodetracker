import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useHabitContext } from '@/contexts/HabitContext';
import { DailySummary } from '@/components/DailySummary';
import { MonthlyHeatmap } from '@/components/MonthlyHeatmap';

export function RightPanelHabits() {
  const { habits, getStreakForHabit, getActiveHabits } = useHabitContext();

  const topStreaks = useMemo(() => {
    return getActiveHabits()
      .map(h => ({ h, s: getStreakForHabit(h) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 5);
  }, [getActiveHabits, getStreakForHabit]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Today</h3>
        {habits.length > 0 ? <DailySummary /> : (
          <p className="text-sm text-muted-foreground">Add a habit to see today's summary.</p>
        )}
      </div>

      {topStreaks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Top Streaks</h3>
          <div className="space-y-2">
            {topStreaks.map(({ h, s }) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <div className="h-8 w-8 rounded-lg bg-streak/10 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-streak" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{h.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s} day streak</p>
                </div>
                <span className="text-sm font-bold tabular-nums">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <MonthlyHeatmap variant="consistency" title="Consistency" />
      </div>
    </div>
  );
}
