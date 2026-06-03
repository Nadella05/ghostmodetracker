import { cn } from '@/lib/utils';
import { Flame, Beef, Wheat, Droplet, Sprout } from 'lucide-react';
import { Macros } from '@/lib/macroEstimator';
import { NutritionTargets } from '@/lib/nutritionTargets';

interface Props {
  totals: Macros & { calories: number };
  targets: NutritionTargets;
  ghost?: boolean;
}

interface CardSpec {
  key: keyof (Macros & { calories: number });
  label: string;
  unit: string;
  icon: typeof Flame;
  color: string;
  ring: string;
}

const CARDS: CardSpec[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: Flame,  color: 'text-orange-500', ring: 'stroke-orange-500' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    icon: Beef,   color: 'text-rose-500',   ring: 'stroke-rose-500' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    icon: Wheat,  color: 'text-amber-500',  ring: 'stroke-amber-500' },
  { key: 'fat',      label: 'Fat',      unit: 'g',    icon: Droplet,color: 'text-yellow-500', ring: 'stroke-yellow-500' },
  { key: 'fiber',    label: 'Fiber',    unit: 'g',    icon: Sprout, color: 'text-emerald-500',ring: 'stroke-emerald-500' },
];

export function MacroDashboard({ totals, targets, ghost }: Props) {
  if (ghost) {
    return (
      <div className="grid grid-cols-4 gap-2 font-mono text-sm border rounded-lg p-3">
        {(['calories', 'protein', 'carbs', 'fat'] as const).map(k => (
          <div key={k} className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="font-bold">{Math.round(totals[k])}</div>
            <div className="text-[10px] text-muted-foreground">/ {targets[k as keyof NutritionTargets] ?? '-'}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {CARDS.map(card => {
        const value = Math.round((totals[card.key] as number) || 0);
        const target = (targets[card.key as keyof NutritionTargets] as number) || 1;
        const pct = Math.min(100, (value / target) * 100);
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Icon className={cn('h-4 w-4', card.color)} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {card.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tabular-nums leading-none">{value}</span>
              <span className="text-[10px] text-muted-foreground">/ {target}{card.unit}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full transition-all', card.color.replace('text-', 'bg-'))}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
