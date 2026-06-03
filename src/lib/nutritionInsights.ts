import { Macros } from './macroEstimator';
import { NutritionTargets } from './nutritionTargets';

export interface Insight {
  id: string;
  tone: 'good' | 'warn' | 'info';
  icon: string;
  text: string;
}

export function buildInsights(
  totals: Macros & { calories: number },
  targets: NutritionTargets
): Insight[] {
  const out: Insight[] = [];

  // Protein
  const pPct = targets.protein ? totals.protein / targets.protein : 0;
  if (pPct >= 1) out.push({ id: 'p-good', tone: 'good', icon: '💪', text: 'Protein goal achieved' });
  else if (pPct < 0.6 && totals.calories > targets.calories * 0.4) {
    out.push({ id: 'p-low', tone: 'warn', icon: '⚠', text: `Low protein — ${Math.round(targets.protein - totals.protein)}g to go` });
  }

  // Calories
  const cPct = targets.calories ? totals.calories / targets.calories : 0;
  if (cPct < 0.6) out.push({ id: 'c-def', tone: 'warn', icon: '⚠', text: 'Calorie deficit detected' });
  else if (cPct > 1.1) out.push({ id: 'c-over', tone: 'warn', icon: '⚠', text: `Over calorie target by ${Math.round(totals.calories - targets.calories)} kcal` });
  else if (cPct >= 0.9 && cPct <= 1.05) out.push({ id: 'c-good', tone: 'good', icon: '✅', text: 'Calorie balance on track' });

  // Sugar
  if (totals.sugar > 50) out.push({ id: 's-high', tone: 'warn', icon: '⚠', text: `High sugar intake (${Math.round(totals.sugar)}g)` });

  // Fiber
  if (targets.fiber && totals.fiber < targets.fiber * 0.6 && totals.calories > targets.calories * 0.5) {
    out.push({ id: 'f-low', tone: 'warn', icon: '🌾', text: `Fiber below target (${Math.round(totals.fiber)}/${targets.fiber}g)` });
  }

  // Sodium
  if (totals.sodium > 2300) out.push({ id: 'na-high', tone: 'warn', icon: '🧂', text: 'High sodium today' });

  return out;
}
