// Nutrition targets derived from a user's health profile.
// Mifflin-St Jeor BMR → TDEE → calorie target → macro split.

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very';
export type WeightGoal = 'lose' | 'maintain' | 'gain';

export interface HealthProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  weightGoal: WeightGoal;
}

export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  weightKg: 70,
  heightCm: 170,
  age: 28,
  gender: 'male',
  activityLevel: 'light',
  weightGoal: 'maintain',
};

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  very:      1.725,
};

const GOAL_DELTA: Record<WeightGoal, number> = {
  lose:     -500,
  maintain:  0,
  gain:      300,
};

const PROTEIN_PER_KG: Record<WeightGoal, number> = {
  lose:     1.8,
  maintain: 1.4,
  gain:     2.0,
};

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  bmr: number;
  tdee: number;
}

export function computeTargets(p: HealthProfile): NutritionTargets {
  // Mifflin-St Jeor
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  const bmr = Math.round(p.gender === 'female' ? base - 161 : base + 5);
  const tdee = Math.round(bmr * ACTIVITY_MULT[p.activityLevel]);
  const calories = Math.max(1200, tdee + GOAL_DELTA[p.weightGoal]);

  const protein = Math.round(p.weightKg * PROTEIN_PER_KG[p.weightGoal]);
  const fat = Math.round((calories * 0.28) / 9);
  // Carbs take the remainder
  const proteinKcal = protein * 4;
  const fatKcal = fat * 9;
  const carbs = Math.max(0, Math.round((calories - proteinKcal - fatKcal) / 4));
  const fiber = Math.round((calories / 1000) * 14);

  return { calories, protein, carbs, fat, fiber, bmr, tdee };
}

// Estimate weight delta from a single day's calorie balance.
// 1 kg fat ≈ 7700 kcal.
export function projectWeight(
  currentKg: number,
  todayIntake: number,
  tdee: number
): { today: number; thirtyDay: number; deltaToday: number } {
  const deficit = tdee - todayIntake; // positive = losing
  const deltaKgToday = deficit / 7700;
  return {
    today: round1(currentKg - deltaKgToday),
    thirtyDay: round1(currentKg - deltaKgToday * 30),
    deltaToday: round2(deltaKgToday),
  };
}

function round1(n: number): number { return Math.round(n * 10) / 10; }
function round2(n: number): number { return Math.round(n * 100) / 100; }

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little exercise)',
  light:     'Lightly active (1-3 days/wk)',
  moderate:  'Moderately active (3-5 days/wk)',
  very:      'Very active (6-7 days/wk)',
};

export const GOAL_LABELS: Record<WeightGoal, string> = {
  lose:     'Lose weight',
  maintain: 'Maintain weight',
  gain:     'Gain weight',
};
