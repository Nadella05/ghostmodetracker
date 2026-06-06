import { useMemo } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Flame, Beef, Droplets, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { useCalorieTracker } from '@/hooks/useCalorieTracker';
import { RingStat } from '@/components/ui/stat/RingStat';
import { AnimatedCounter } from '@/components/ui/stat/AnimatedCounter';
import { WeeklySnapshot } from '@/components/WeeklySnapshot';
import { QuickInsights } from '@/components/QuickInsights';

export function DashboardOverview() {
  const {
    getTodaysHabits, isHabitCompletedForDate, isHabitScheduledForDate,
    getActiveHabits, waterTracker, isGhostMode,
  } = useHabitContext();
  const { getDailyTotal, getDailyMacros, calorieGoal } = useCalorieTracker();

  const today = new Date();
  const todaysHabits = getTodaysHabits();
  const totalH = todaysHabits.length;
  const doneH = todaysHabits.filter(h => isHabitCompletedForDate(h, today)).length;

  const cal = getDailyTotal();
  const macros = getDailyMacros();
  const water = waterTracker.todayIntake;
  const waterGoal = waterTracker.dailyGoal;

  // Consistency = avg habit completion over last 7 days
  const consistency = useMemo(() => {
    const active = getActiveHabits();
    let sum = 0, n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const sched = active.filter(h => isHabitScheduledForDate(h, d));
      if (sched.length === 0) continue;
      const done = sched.filter(h => isHabitCompletedForDate(h, d)).length;
      sum += (done / sched.length) * 100; n++;
    }
    return n > 0 ? Math.round(sum / n) : 0;
  }, [getActiveHabits, isHabitCompletedForDate, isHabitScheduledForDate]);

  const proteinTarget = 120; // visual default; real targets shown on Calories tab

  const tiles = [
    { key: 'habits', label: 'Habits',  icon: CheckCircle, value: doneH, total: totalH, ring: totalH ? doneH / totalH : 0, tint: 'stroke-primary', unit: `/ ${totalH}`, delta: 0 },
    { key: 'cal',    label: 'Calories', icon: Flame,      value: cal,   total: calorieGoal, ring: Math.min(1, cal / calorieGoal), tint: 'stroke-orange-500', unit: 'kcal', delta: 0 },
    { key: 'prot',   label: 'Protein',  icon: Beef,       value: Math.round(macros.protein), total: proteinTarget, ring: Math.min(1, macros.protein / proteinTarget), tint: 'stroke-rose-500', unit: 'g', delta: 0 },
    { key: 'water',  label: 'Water',    icon: Droplets,   value: water, total: waterGoal, ring: Math.min(1, water / waterGoal), tint: 'stroke-sky-500', unit: 'ml', delta: 0 },
    { key: 'cons',   label: 'Consistency', icon: Target,  value: consistency, total: 100, ring: consistency / 100, tint: 'stroke-emerald-500', unit: '%', delta: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{format(today, 'EEEE, MMMM d')}</p>
        <h2 className="text-2xl font-bold">Today's Summary</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tiles.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.key} className={cn(
              'group relative rounded-2xl border bg-card p-4 overflow-hidden transition hover:shadow-elevated',
              !isGhostMode && 'hover:-translate-y-0.5',
            )}>
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <RingStat value={t.ring} size={56} stroke={6} ringClassName={cn(!isGhostMode && t.tint, isGhostMode && 'stroke-foreground')}>
                  <span className="text-[10px] font-bold tabular-nums">{Math.round(t.ring * 100)}%</span>
                </RingStat>
                <div className="min-w-0">
                  <div className="text-xl font-bold tabular-nums leading-none">
                    <AnimatedCounter value={t.value} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.unit}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekly Snapshot</h3>
        <WeeklySnapshot />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Insights</h3>
        <QuickInsights />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</h3>
        <RecentActivity />
      </section>
    </div>
  );
}
