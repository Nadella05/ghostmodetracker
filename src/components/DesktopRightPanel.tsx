import { DailySummary } from '@/components/DailySummary';
import { MonthlyHeatmap } from '@/components/MonthlyHeatmap';
import { useHabitContext } from '@/contexts/HabitContext';

export function DesktopRightPanel() {
  const { getTodaysHabits } = useHabitContext();
  const hasHabits = getTodaysHabits().length > 0;

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l bg-card/30 h-screen sticky top-0 overflow-y-auto">
      <div className="p-5 space-y-5">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Today
          </h3>
          {hasHabits ? <DailySummary /> : (
            <p className="text-sm text-muted-foreground">Add a habit to see today's summary.</p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Consistency
          </h3>
          <MonthlyHeatmap />
        </div>
      </div>
    </aside>
  );
}
