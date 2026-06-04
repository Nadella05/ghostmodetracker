import { DailySummary } from '@/components/DailySummary';
import { MonthlyHeatmap } from '@/components/MonthlyHeatmap';
import { RightPanelHabits } from '@/components/RightPanelHabits';
import { RightPanelCalories } from '@/components/RightPanelCalories';
import { RightPanelHydration } from '@/components/RightPanelHydration';
import { useHabitContext } from '@/contexts/HabitContext';

type Tab = 'dashboard' | 'today' | 'water' | 'calories' | 'calendar' | 'analytics' | 'achievements' | 'settings';

interface Props {
  activeTab: Tab;
}

export function DesktopRightPanel({ activeTab }: Props) {
  const { getTodaysHabits } = useHabitContext();

  // Hide for tabs that don't need an aside
  if (activeTab === 'settings' || activeTab === 'achievements' || activeTab === 'analytics') {
    return null;
  }

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l bg-card/30 h-screen sticky top-0 overflow-y-auto">
      <div className="p-5">
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Today</h3>
              {getTodaysHabits().length > 0 ? <DailySummary /> : (
                <p className="text-sm text-muted-foreground">Add a habit to see today's summary.</p>
              )}
            </div>
            <div>
              <MonthlyHeatmap variant="consistency" title="Consistency" />
            </div>
          </div>
        )}
        {(activeTab === 'today' || activeTab === 'calendar') && <RightPanelHabits />}
        {activeTab === 'calories' && <RightPanelCalories />}
        {activeTab === 'water' && <RightPanelHydration />}
      </div>
    </aside>
  );
}
