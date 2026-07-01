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

  const moduleTints: Record<string, string> = {
    habits: 'stroke-[hsl(var(--habits))]',
    cal:    'stroke-[hsl(var(--calories))]',
    prot:   'stroke-[hsl(var(--protein))]',
    water:  'stroke-[hsl(var(--hydration))]',
    cons:   'stroke-[hsl(var(--analytics))]',
  };
  const moduleBgs: Record<string, string> = {
    habits: 'before:bg-[var(--gradient-habits)]',
    cal:    'before:bg-[var(--gradient-calories)]',
    prot:   'before:bg-[var(--gradient-protein)]',
    water:  'before:bg-[var(--gradient-hydration)]',
    cons:   'before:bg-[var(--gradient-analytics)]',
  };

  return (
    <div className="space-y-6 stagger">
      {/* Hero: Discipline command card */}
      <div className={cn(
        'relative overflow-hidden rounded-3xl border p-6 sm:p-8 animate-spring-in',
        !isGhostMode ? 'text-white shadow-elevated animate-gradient-drift' : 'bg-card',
      )}
        style={!isGhostMode ? { backgroundImage: 'var(--gradient-hero)' } : undefined}
      >

        {!isGhostMode && (
          <>
            <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/20 blur-3xl" />
          </>
        )}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className={cn('text-xs uppercase tracking-[0.2em]', !isGhostMode ? 'text-white/80' : 'text-muted-foreground')}>
              {format(today, 'EEEE, MMMM d')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
              {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; })()}
            </h2>
            <p className={cn('mt-2 text-sm', !isGhostMode ? 'text-white/85' : 'text-muted-foreground')}>
              Discipline Score · Stay the course today.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              {consistency >= 80 && <span className="px-2 py-1 rounded-full bg-white/15 backdrop-blur">🔥 Excellent</span>}
              {consistency >= 50 && consistency < 80 && <span className="px-2 py-1 rounded-full bg-white/15 backdrop-blur">📈 Improving</span>}
              {consistency < 50 && <span className="px-2 py-1 rounded-full bg-white/15 backdrop-blur">⚠ Needs attention</span>}
            </div>
          </div>
          <RingStat
            value={consistency / 100}
            size={140}
            stroke={12}
            trackClassName={!isGhostMode ? 'stroke-white/20' : 'stroke-muted'}
            ringClassName={!isGhostMode ? 'stroke-white' : 'stroke-foreground'}
          >
            <div className="text-center">
              <div className="text-3xl font-extrabold tabular-nums leading-none">
                <AnimatedCounter value={consistency} />%
              </div>
              <p className={cn('text-[10px] uppercase tracking-wider mt-1', !isGhostMode ? 'text-white/80' : 'text-muted-foreground')}>
                Discipline
              </p>
            </div>
          </RingStat>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tiles.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.key} className={cn(
              'group relative isolate rounded-2xl border bg-card/80 backdrop-blur p-4 overflow-hidden transition',
              'hover:shadow-elevated',
              !isGhostMode && 'hover:-translate-y-0.5',
              !isGhostMode && 'before:absolute before:inset-0 before:-z-10 before:opacity-[0.08] before:transition-opacity hover:before:opacity-[0.18]',
              !isGhostMode && moduleBgs[t.key],
            )}>
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn('h-4 w-4', isGhostMode ? 'text-muted-foreground' : 'text-foreground/70')} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <RingStat value={t.ring} size={56} stroke={6} ringClassName={cn(!isGhostMode && moduleTints[t.key], isGhostMode && 'stroke-foreground')}>
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
    </div>
  );
}

