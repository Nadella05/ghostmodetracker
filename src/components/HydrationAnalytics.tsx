import { useMemo } from 'react';
import { format } from 'date-fns';
import { TrendingUp, Trophy, Calendar, Target } from 'lucide-react';
import { useHabitContext } from '@/contexts/HabitContext';

export function HydrationAnalytics() {
  const { waterTracker, isGhostMode } = useHabitContext();

  const stats = useMemo(() => {
    const days30: { date: Date; intake: number; met: boolean }[] = [];
    const goal = waterTracker.dailyGoal;
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const intake = waterTracker.getIntakeForDate?.(d) ?? 0;
      days30.push({ date: d, intake, met: intake >= goal });
    }
    const week = days30.slice(-7);
    const month = days30;

    const weekAvg = week.reduce((s, d) => s + d.intake, 0) / 7;
    const monthAvg = month.reduce((s, d) => s + d.intake, 0) / 30;
    const best = month.reduce((b, d) => (d.intake > b.intake ? d : b), month[0]);
    const consistency = Math.round((month.filter(d => d.met).length / 30) * 100);

    return { week, weekAvg, monthAvg, best, consistency };
  }, [waterTracker]);

  // Hydration achievements (derived inline; no XP integration)
  const totalDaysMet = stats.week.filter(d => d.met).length;
  const achievements = [
    { id: 'first1L',     icon: '💧', label: 'First 1L Day',           done: stats.month?.some(d => d.intake >= 1000) ?? false },
    { id: 'week7',       icon: '🌊', label: '7 Days Hydrated',        done: totalDaysMet >= 7 },
    { id: 'perfectWeek', icon: '🚰', label: 'Perfect Hydration Week', done: totalDaysMet === 7 && stats.week.length === 7 },
    { id: 'master30',    icon: '🏆', label: '30-Day Hydration Master', done: stats.consistency >= 100 },
  ];

  if (isGhostMode) {
    return (
      <div className="space-y-2 border rounded-lg p-3 font-mono text-sm">
        <div>weekly avg: {Math.round(stats.weekAvg)} ml</div>
        <div>monthly avg: {Math.round(stats.monthAvg)} ml</div>
        <div>consistency: {stats.consistency}%</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Weekly avg"  value={`${Math.round(stats.weekAvg)} ml`} />
        <StatCard icon={<Calendar className="h-4 w-4" />}   label="Monthly avg" value={`${Math.round(stats.monthAvg)} ml`} />
        <StatCard icon={<Trophy className="h-4 w-4" />}     label="Best day"    value={`${stats.best?.intake ?? 0} ml`} />
        <StatCard icon={<Target className="h-4 w-4" />}     label="Consistency" value={`${stats.consistency}%`} />
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Achievements</h4>
        <div className="grid grid-cols-2 gap-2">
          {achievements.map(a => (
            <div
              key={a.id}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-sm transition ${
                a.done ? 'bg-primary/5 border-primary/30' : 'opacity-50'
              }`}
            >
              <span className="text-lg">{a.icon}</span>
              <span className="text-xs font-medium leading-tight">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Last 7 days</h4>
        <div className="flex items-end gap-1 h-20">
          {stats.week.map((d, i) => {
            const pct = Math.min(100, (d.intake / waterTracker.dailyGoal) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all ${d.met ? 'bg-primary' : 'bg-muted'}`}
                  style={{ height: `${Math.max(4, (pct / 100) * 64)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{format(d.date, 'EEEEE')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card/60 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}<span className="text-[10px] uppercase tracking-wider">{label}</span></div>
      <div className="text-lg font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
