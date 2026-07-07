export type RefUnit =
  | 'g'
  | 'ml'
  | 'piece'
  | 'cup'
  | 'glass'
  | 'bowl'
  | 'plate'
  | 'slice'
  | 'serving';

export const REF_UNITS: RefUnit[] = [
  'g', 'ml', 'piece', 'cup', 'glass', 'bowl', 'plate', 'slice', 'serving',
];

export const UNIT_LABELS: Record<RefUnit, string> = {
  g: 'grams',
  ml: 'ml',
  piece: 'piece',
  cup: 'cup',
  glass: 'glass',
  bowl: 'bowl',
  plate: 'plate',
  slice: 'slice',
  serving: 'serving',
};

export const FOOD_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Protein',
  'Grains',
  'Snacks',
  'Fast Food',
  'Indian',
  'South Indian',
  'North Indian',
  'Beverages',
  'Desserts',
  'Custom',
] as const;

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export const ZERO_NUTRITION: NutritionValues = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

export interface CustomFood {
  id: string;
  name: string;
  category: string;
  brand?: string;
  referenceQuantity: number;
  referenceUnit: RefUnit;
  nutrition: NutritionValues;
  notes?: string;
  favourite?: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export function scaleNutrition(
  ref: NutritionValues,
  refQty: number,
  userQty: number,
): NutritionValues {
  if (!refQty || refQty <= 0) return { ...ZERO_NUTRITION };
  const m = userQty / refQty;
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return {
    calories: Math.round(ref.calories * m),
    protein: r1(ref.protein * m),
    carbs: r1(ref.carbs * m),
    fat: r1(ref.fat * m),
    fiber: r1(ref.fiber * m),
    sugar: r1(ref.sugar * m),
    sodium: Math.round(ref.sodium * m),
  };
}
