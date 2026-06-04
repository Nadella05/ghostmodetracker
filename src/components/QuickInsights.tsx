import { useMemo } from 'react';
import { Lightbulb, TrendingUp, Flame, Droplets } from 'lucide-react';
import { useHabitContext } from '@/contexts/HabitContext';
import { useCalorieTracker } from '@/hooks/useCalorieTracker';

export function QuickInsights() {
  const { getActiveHabits, getStreakForHabit, waterTracker } = useHabitContext();
  const { getDailyMacros, calorieGoal, getDailyTotal } = useCalorieTracker();

  const insights = useMemo(() => {
    const out: { id: string; icon: React.ReactNode; text: string }[] = [];

    const habits = getActiveHabits();
    const topStreak = habits.reduce((m, h) => Math.max(m, getStreakForHabit(h)), 0);
    if (topStreak >= 2) {
      out.push({ id: 's', icon: <TrendingUp className="h-4 w-4" />, text: `Top streak running for ${topStreak} day${topStreak > 1 ? 's' : ''}` });
    }

    // Protein this week vs last week (approx by today vs goal)
    const m = getDailyMacros();
    if (m.protein > 0) {
      out.push({ id: 'p', icon: <Flame className="h-4 w-4" />, text: `Protein today: ${Math.round(m.protein)}g` });
    }

    // Hydration streak
    let hydrStreak = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const intake = waterTracker.getIntakeForDate?.(d) ?? 0;
      if (intake >= waterTracker.dailyGoal) hydrStreak++; else break;
    }
    if (hydrStreak > 0) {
      out.push({ id: 'h', icon: <Droplets className="h-4 w-4" />, text: `Hydration streak: ${hydrStreak} day${hydrStreak > 1 ? 's' : ''}` });
    }

    const cal = getDailyTotal();
    if (cal > 0 && cal < calorieGoal) {
      const remaining = calorieGoal - cal;
      out.push({ id: 'c', icon: <Lightbulb className="h-4 w-4" />, text: `${remaining} kcal left to hit today's goal` });
    }
    return out;
  }, [getActiveHabits, getStreakForHabit, getDailyMacros, getDailyTotal, calorieGoal, waterTracker]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map(i => (
        <div key={i.id} className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-accent/5 transition">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {i.icon}
          </div>
          <p className="text-sm">{i.text}</p>
        </div>
      ))}
    </div>
  );
}
