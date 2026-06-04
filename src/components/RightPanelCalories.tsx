import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { useCalorieTracker } from '@/hooks/useCalorieTracker';
import { MacroDashboard } from '@/components/MacroDashboard';
import { WeightProjection } from '@/components/WeightProjection';
import { computeTargets, DEFAULT_HEALTH_PROFILE, HealthProfile } from '@/lib/nutritionTargets';
import { buildInsights } from '@/lib/nutritionInsights';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function RightPanelCalories() {
  const { profile } = useHabitContext();
  const { getDailyTotal, getDailyMacros, calorieGoal } = useCalorieTracker();

  const dailyTotal = getDailyTotal();
  const macros = getDailyMacros();

  const healthProfile: HealthProfile = {
    weightKg: profile.weightKg ?? DEFAULT_HEALTH_PROFILE.weightKg,
    heightCm: profile.heightCm ?? DEFAULT_HEALTH_PROFILE.heightCm,
    age: profile.age ?? DEFAULT_HEALTH_PROFILE.age,
    gender: profile.gender ?? DEFAULT_HEALTH_PROFILE.gender,
    activityLevel: profile.activityLevel ?? DEFAULT_HEALTH_PROFILE.activityLevel,
    weightGoal: profile.weightGoal ?? DEFAULT_HEALTH_PROFILE.weightGoal,
  };

  const targets = useMemo(() => {
    const t = computeTargets(healthProfile);
    return { ...t, calories: calorieGoal || t.calories };
  }, [healthProfile.weightKg, healthProfile.heightCm, healthProfile.age, healthProfile.gender, healthProfile.activityLevel, healthProfile.weightGoal, calorieGoal]);

  const insights = useMemo(() => buildInsights(macros, targets), [macros, targets]);

  // Weekly trend data
  const weekly = useMemo(() => {
    const days: { day: string; calories: number; protein: number; carbs: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const m = getDailyMacros(d);
      days.push({
        day: ['S','M','T','W','T','F','S'][d.getDay()],
        calories: getDailyTotal(d),
        protein: Math.round(m.protein),
        carbs: Math.round(m.carbs),
      });
    }
    return days;
  }, [getDailyMacros, getDailyTotal]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Macros</h3>
        <MacroDashboard totals={macros} targets={targets} />
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Weight</h3>
        <WeightProjection profile={healthProfile} todayIntake={dailyTotal} />
      </div>

      {insights.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Insights</h3>
          <div className="flex flex-wrap gap-1.5">
            {insights.map(i => (
              <span
                key={i.id}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]',
                  i.tone === 'good' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                  i.tone === 'warn' && 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                  i.tone === 'info' && 'border-muted-foreground/20 bg-muted/50',
                )}
              >
                <span>{i.icon}</span>{i.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Weekly Trend</h3>
        <div className="rounded-2xl border bg-card p-3 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="calories" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="protein"  stroke="hsl(0 80% 60%)"     strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="carbs"    stroke="hsl(40 90% 55%)"    strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
