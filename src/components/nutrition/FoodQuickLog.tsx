import { useMemo, useState } from 'react';
import { CustomFood, UNIT_LABELS, scaleNutrition } from '@/types/nutrition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Check, Star } from 'lucide-react';
import { markUsed, toggleFavourite } from '@/lib/nutritionDb';
import { cn } from '@/lib/utils';

interface Props {
  food: CustomFood;
  onCancel: () => void;
  onLog: (payload: {
    name: string;
    quantity: number;
    unit: string;
    nutrition: ReturnType<typeof scaleNutrition>;
    foodId: string;
  }) => void;
}

export function FoodQuickLog({ food, onCancel, onLog }: Props) {
  const [qty, setQty] = useState<string>(String(food.referenceQuantity));
  const userQty = parseFloat(qty);
  const validQty = !isNaN(userQty) && userQty > 0;

  const scaled = useMemo(
    () => validQty
      ? scaleNutrition(food.nutrition, food.referenceQuantity, userQty)
      : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
    [food, userQty, validQty],
  );

  const handleLog = () => {
    if (!validQty) return;
    markUsed(food.id);
    onLog({
      name: `${food.name} (${userQty}${food.referenceUnit === 'g' || food.referenceUnit === 'ml' ? food.referenceUnit : ' ' + UNIT_LABELS[food.referenceUnit]})`,
      quantity: userQty,
      unit: food.referenceUnit,
      nutrition: scaled,
      foodId: food.id,
    });
  };

  return (
    <Card className="p-3 space-y-3 border-primary/40 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm truncate">{food.name}</p>
            <button
              onClick={() => toggleFavourite(food.id)}
              className="text-muted-foreground hover:text-amber-500 transition-colors"
              title="Toggle favourite"
            >
              <Star className={cn('h-3.5 w-3.5', food.favourite && 'fill-amber-400 text-amber-500')} />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {food.category}{food.brand ? ` · ${food.brand}` : ''} · Ref: {food.referenceQuantity} {UNIT_LABELS[food.referenceUnit]}
          </p>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          step="any"
          value={qty}
          onChange={e => setQty(e.target.value)}
          className="h-9"
          onKeyDown={e => e.key === 'Enter' && handleLog()}
          autoFocus
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">{UNIT_LABELS[food.referenceUnit]}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-center">
        <Metric label="kcal" value={scaled.calories} big />
        <Metric label="P" value={scaled.protein} suffix="g" />
        <Metric label="C" value={scaled.carbs} suffix="g" />
        <Metric label="F" value={scaled.fat} suffix="g" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] text-muted-foreground">
        <span>Fiber {scaled.fiber}g</span>
        <span>Sugar {scaled.sugar}g</span>
        <span>Na {scaled.sodium}mg</span>
      </div>

      <Button className="w-full h-9" onClick={handleLog} disabled={!validQty}>
        <Check className="h-4 w-4 mr-1.5" /> Log {scaled.calories} kcal
      </Button>
    </Card>
  );
}

function Metric({ label, value, suffix, big }: { label: string; value: number; suffix?: string; big?: boolean }) {
  return (
    <div className="rounded-md bg-muted/50 py-1.5">
      <p className={cn('font-bold tabular-nums', big ? 'text-lg leading-none' : 'text-sm leading-none')}>
        {value}{suffix ?? ''}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
