import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/lib/nutritionDb';

export function useNutritionDb() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return state;
}
