import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HealthProfile, computeTargets, projectWeight } from '@/lib/nutritionTargets';

interface Props {
  profile: HealthProfile;
  todayIntake: number;
  ghost?: boolean;
}

export function WeightProjection({ profile, todayIntake, ghost }: Props) {
  const targets = computeTargets(profile);
  const proj = projectWeight(profile.weightKg, todayIntake, targets.tdee);
  const losing = proj.deltaToday > 0.001;
  const gaining = proj.deltaToday < -0.001;
  const Icon = losing ? TrendingDown : gaining ? TrendingUp : Minus;
  const trendLabel = losing ? 'losing' : gaining ? 'gaining' : 'maintaining';

  if (ghost) {
    return (
      <div className="border rounded-lg p-3 font-mono text-sm">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Weight</div>
        <div>now {profile.weightKg.toFixed(1)} kg → 30d {proj.thirtyDay.toFixed(1)} kg</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            <Icon className={cn(
              'h-3.5 w-3.5',
              losing && 'text-emerald-500',
              gaining && 'text-amber-500',
            )} />
            Weight projection
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{trendLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold leading-none tabular-nums">{profile.weightKg.toFixed(1)}</div>
          <div className="text-[10px] text-muted-foreground">current kg</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-background/60 border p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</div>
          <div className="text-lg font-semibold tabular-nums">{proj.today.toFixed(1)} kg</div>
        </div>
        <div className="rounded-xl bg-background/60 border p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">30-day</div>
          <div className="text-lg font-semibold tabular-nums">{proj.thirtyDay.toFixed(1)} kg</div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        Based on TDEE {targets.tdee} kcal vs intake {Math.round(todayIntake)} kcal.
      </p>
    </div>
  );
}
