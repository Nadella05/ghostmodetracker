import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { CATEGORY_LABELS, HabitCategory, WEEKDAYS } from '@/types/habit';
import { AchievementsView } from '@/components/AchievementsView';
import { MonthlyHeatmap } from '@/components/MonthlyHeatmap';
import { AdvancedStats } from '@/components/AdvancedStats';
import { XPDisplay } from '@/components/XPDisplay';
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Award
} from 'lucide-react';

export function AnalyticsView() {
  const { habits, getHabitStats, isGhostMode, getActiveHabits } = useHabitContext();
  
  const activeHabits = getActiveHabits();

  if (activeHabits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No habits to analyze yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Add some habits to see your stats!</p>
      </div>
    );
  }

  // Calculate overall stats
  const allStats = activeHabits.map(h => ({ habit: h, stats: getHabitStats(h) }));
  
  const overallDiscipline = Math.round(
    allStats.reduce((sum, { stats }) => sum + stats.disciplineScore, 0) / allStats.length
  );
  
  const overallWeekly = Math.round(
    allStats.reduce((sum, { stats }) => sum + stats.weeklyCompletion, 0) / allStats.length
  );
  
  const overallMonthly = Math.round(
    allStats.reduce((sum, { stats }) => sum + stats.monthlyCompletion, 0) / allStats.length
  );

  // Best and weakest habits
  const sortedByDiscipline = [...allStats].sort((a, b) => b.stats.disciplineScore - a.stats.disciplineScore);
  const bestHabit = sortedByDiscipline[0];
  const weakestHabit = sortedByDiscipline[sortedByDiscipline.length - 1];

  // Category performance
  const categoryPerformance = (Object.keys(CATEGORY_LABELS) as HabitCategory[])
    .map(category => {
      const categoryHabits = allStats.filter(({ habit }) => habit.category === category);
      if (categoryHabits.length === 0) return null;
      const avgScore = Math.round(
        categoryHabits.reduce((sum, { stats }) => sum + stats.disciplineScore, 0) / categoryHabits.length
      );
      return { category, avgScore, count: categoryHabits.length };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.avgScore || 0) - (a?.avgScore || 0));

  const getFrequencyLabel = (habit: typeof allStats[0]['habit']) => {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'weekly' && habit.customDays && habit.customDays.length > 0) {
      return habit.customDays.map(d => WEEKDAYS.find(w => w.value === d)?.short || '').join('');
    }
    return 'Weekly';
  };

  return (
    <div className="space-y-6">
      {/* XP Display */}
      <XPDisplay />

      {/* Monthly Heatmap */}
      <MonthlyHeatmap />

      {/* Advanced Stats & Calorie Charts */}
      <AdvancedStats />
      
      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard 
          label={isGhostMode ? "Discipline" : "Weekly"} 
          value={isGhostMode ? overallDiscipline : overallWeekly}
          suffix="%"
          isGhostMode={isGhostMode}
        />
        <StatCard 
          label="Monthly" 
          value={overallMonthly}
          suffix="%"
          isGhostMode={isGhostMode}
        />
        <StatCard 
          label="Discipline" 
          value={overallDiscipline}
          suffix="%"
          isGhostMode={isGhostMode}
          highlight
        />
      </div>

      {/* Best / Weakest */}
      {!isGhostMode && allStats.length > 1 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Strongest</p>
            </div>
            <p className="font-medium truncate">{bestHabit.habit.name}</p>
            <p className="text-sm text-success">{bestHabit.stats.disciplineScore}%</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Needs Work</p>
            </div>
            <p className="font-medium truncate">{weakestHabit.habit.name}</p>
            <p className="text-sm text-muted-foreground">{weakestHabit.stats.disciplineScore}%</p>
          </div>
        </div>
      )}

      {/* Per-Habit Stats */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          {isGhostMode ? 'Discipline by Habit' : 'Habit Performance'}
        </h3>
        {allStats.map(({ habit, stats }) => (
          <div key={habit.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{habit.name}</p>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[habit.category]} • {getFrequencyLabel(habit)}
                </p>
              </div>
              <div className="text-right pl-4">
                <p className={cn(
                  "text-lg font-mono font-semibold discipline-score",
                  !isGhostMode && stats.disciplineScore >= 80 && "text-success",
                  !isGhostMode && stats.disciplineScore < 50 && "text-destructive"
                )}>
                  {stats.disciplineScore}%
                </p>
                {!isGhostMode && stats.currentStreak > 0 && (
                  <p className="text-xs text-muted-foreground">
                    🔥 {stats.currentStreak} day streak
                  </p>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  isGhostMode ? "bg-muted-foreground" : "bg-primary"
                )}
                style={{ width: `${stats.disciplineScore}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Category Performance */}
      {categoryPerformance.length > 1 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            By Category
          </h3>
          <div className="rounded-xl border bg-card divide-y">
            {categoryPerformance.map((cat) => cat && (
              <div key={cat.category} className="flex items-center justify-between p-3">
                <span className="text-sm">{CATEGORY_LABELS[cat.category]}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        isGhostMode ? "bg-muted-foreground" : "bg-primary"
                      )}
                      style={{ width: `${cat.avgScore}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm w-10 text-right">{cat.avgScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Achievements */}
      <AchievementsView />
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  suffix = '', 
  isGhostMode,
  highlight 
}: { 
  label: string; 
  value: number; 
  suffix?: string;
  isGhostMode: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4 text-center",
      highlight && !isGhostMode && "border-primary/30 bg-primary/5"
    )}>
      <p className="text-2xl font-mono font-bold discipline-score">
        {value}{suffix}
      </p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
