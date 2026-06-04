import { useMemo } from 'react';
import { format } from 'date-fns';
import { MonthlyHeatmap } from '@/components/MonthlyHeatmap';
import { useHabitContext } from '@/contexts/HabitContext';

export function HydrationHeatmap() {
  const { waterTracker } = useHabitContext();

  const { data, tooltipFor } = useMemo(() => {
    const data: Record<string, number> = {};
    const ml: Record<string, number> = {};
    const goal = waterTracker.dailyGoal;
    for (let i = 60; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = format(d, 'yyyy-MM-dd');
      const intake = waterTracker.getIntakeForDate?.(d) ?? 0;
      ml[key] = intake;
      data[key] = goal > 0 ? Math.min(100, Math.round((intake / goal) * 100)) : 0;
    }
    return {
      data,
      tooltipFor: (k: string) => (ml[k] != null ? `${ml[k]} ml` : undefined),
    };
  }, [waterTracker]);

  return <MonthlyHeatmap variant="hydration" data={data} tooltipFor={tooltipFor} title="Hydration Heatmap" />;
}
