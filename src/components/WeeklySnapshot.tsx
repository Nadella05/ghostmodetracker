import { useMemo } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Flame, Droplets } from 'lucide-react';
import { useHabitContext } from '@/contexts/HabitContext';
import { useCalorieTracker } from '@/hooks/useCalorieTracker';

interface MiniProps {
  label: string;
  icon: React.ReactNode;
  values: number[];
  unit: string;
  tint: string;
}

function Spark({ label, icon, values, unit, tint }: MiniProps) {
  const max = Math.max(1, ...values);
  const total = values.reduce((s, v) => s + v, 0);
  return (
    <div className="rounded-2xl border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span className={tint}>{icon}</span>
          <span>{label}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">7d</span>
      </div>
      <div className="flex items-end gap-1 h-14">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-stretch">
            <div className={`rounded-t-md ${tint.replace('text-', 'bg-')}/70`} style={{ height: `${(v / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-lg font-bold tabular-nums">{total}</p>
        <span className="text-[10px] text-muted-foreground">{unit} this week</span>
      </div>
    </div>
  );
}

export function WeeklySnapshot() {
  const { getActiveHabits, isHabitCompletedForDate, isHabitScheduledForDate, waterTracker } = useHabitContext();
  const { getDailyTotal } = useCalorieTracker();

  const data = useMemo(() => {
    const active = getActiveHabits();
    const habits: number[] = [];
    const cals: number[] = [];
    const water: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const sched = active.filter(h => isHabitScheduledForDate(h, d)).length;
      const done = active.filter(h => isHabitScheduledForDate(h, d) && isHabitCompletedForDate(h, d)).length;
      habits.push(sched > 0 ? Math.round((done / sched) * 100) : 0);
      cals.push(getDailyTotal(d));
      water.push(waterTracker.getIntakeForDate?.(d) ?? 0);
    }
    return { habits, cals, water };
  }, [getActiveHabits, isHabitCompletedForDate, isHabitScheduledForDate, getDailyTotal, waterTracker]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Spark label="Habits"    icon={<CheckCircle className="h-4 w-4" />} values={data.habits} unit="% avg" tint="text-primary" />
      <Spark label="Calories"  icon={<Flame className="h-4 w-4" />}       values={data.cals}   unit="kcal" tint="text-orange-500" />
      <Spark label="Hydration" icon={<Droplets className="h-4 w-4" />}    values={data.water}  unit="ml" tint="text-sky-500" />
    </div>
  );
}
