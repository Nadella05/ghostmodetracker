import { CustomFood, RefUnit, NutritionValues, ZERO_NUTRITION } from '@/types/nutrition';
import { CustomFoodSchema, CustomFoodsArraySchema } from '@/lib/validation';

const STORAGE_KEY = 'habit-tracker-nutrition-db';
const RECENT_LIMIT = 12;

interface DbState {
  foods: CustomFood[];
}

let state: DbState = { foods: [] };
let loaded = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach(l => l()); }

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function ensureLoaded() {
  if (loaded) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const result = CustomFoodsArraySchema.safeParse((parsed?.foods ?? [])) as { success: true; data: CustomFood[] } | { success: false };
      state = { foods: result.success ? result.data : [] };
    }
  } catch { /* ignore */ }
  loaded = true;
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const result = CustomFoodsArraySchema.safeParse((parsed?.foods ?? [])) as { success: true; data: CustomFood[] } | { success: false };
        if (result.success) { state = { foods: result.data }; emit(); }
      } catch { /* ignore */ }
    }
  });
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getSnapshot(): DbState {
  ensureLoaded();
  return state;
}

function nowIso() { return new Date().toISOString(); }
function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function normalizeName(s: string) { return s.trim().toLowerCase(); }

export function isDuplicateName(name: string, excludeId?: string): boolean {
  ensureLoaded();
  const n = normalizeName(name);
  return state.foods.some(f => !f.archived && f.id !== excludeId && normalizeName(f.name) === n);
}

export interface FoodInput {
  name: string;
  category: string;
  brand?: string;
  referenceQuantity: number;
  referenceUnit: RefUnit;
  nutrition: NutritionValues;
  notes?: string;
}

export function addFood(input: FoodInput): CustomFood {
  ensureLoaded();
  const food: CustomFood = {
    id: newId(),
    name: input.name.trim(),
    category: input.category.trim() || 'Custom',
    brand: input.brand?.trim() || undefined,
    referenceQuantity: input.referenceQuantity,
    referenceUnit: input.referenceUnit,
    nutrition: { ...ZERO_NUTRITION, ...input.nutrition },
    notes: input.notes?.trim() || undefined,
    favourite: false,
    archived: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  const parsed = CustomFoodSchema.safeParse(food);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid food');
  state = { foods: [...state.foods, parsed.data] };
  persist(); emit();
  return parsed.data;
}

export function updateFood(id: string, patch: Partial<FoodInput>): CustomFood | null {
  ensureLoaded();
  const idx = state.foods.findIndex(f => f.id === id);
  if (idx === -1) return null;
  const merged: CustomFood = {
    ...state.foods[idx],
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.category !== undefined ? { category: patch.category.trim() || 'Custom' } : {}),
    ...(patch.brand !== undefined ? { brand: patch.brand?.trim() || undefined } : {}),
    ...(patch.referenceQuantity !== undefined ? { referenceQuantity: patch.referenceQuantity } : {}),
    ...(patch.referenceUnit !== undefined ? { referenceUnit: patch.referenceUnit } : {}),
    ...(patch.nutrition !== undefined ? { nutrition: { ...ZERO_NUTRITION, ...patch.nutrition } } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes?.trim() || undefined } : {}),
    updatedAt: nowIso(),
  };
  const parsed = CustomFoodSchema.safeParse(merged);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid food');
  const next = [...state.foods];
  next[idx] = parsed.data;
  state = { foods: next };
  persist(); emit();
  return parsed.data;
}

export function deleteFood(id: string) {
  ensureLoaded();
  state = { foods: state.foods.filter(f => f.id !== id) };
  persist(); emit();
}

export function toggleArchive(id: string) {
  ensureLoaded();
  state = {
    foods: state.foods.map(f => f.id === id ? { ...f, archived: !f.archived, updatedAt: nowIso() } : f),
  };
  persist(); emit();
}

export function toggleFavourite(id: string) {
  ensureLoaded();
  state = {
    foods: state.foods.map(f => f.id === id ? { ...f, favourite: !f.favourite, updatedAt: nowIso() } : f),
  };
  persist(); emit();
}

export function markUsed(id: string) {
  ensureLoaded();
  state = {
    foods: state.foods.map(f => f.id === id ? { ...f, lastUsedAt: nowIso() } : f),
  };
  persist(); emit();
}

export function searchFoods(query: string): CustomFood[] {
  ensureLoaded();
  const q = query.trim().toLowerCase();
  const active = state.foods.filter(f => !f.archived);
  if (!q) return active;
  return active.filter(f =>
    f.name.toLowerCase().includes(q) ||
    (f.brand && f.brand.toLowerCase().includes(q)) ||
    f.category.toLowerCase().includes(q)
  );
}

export function getFavourites(): CustomFood[] {
  ensureLoaded();
  return state.foods.filter(f => !f.archived && f.favourite);
}

export function getRecents(): CustomFood[] {
  ensureLoaded();
  return state.foods
    .filter(f => !f.archived && f.lastUsedAt)
    .sort((a, b) => (b.lastUsedAt ?? '').localeCompare(a.lastUsedAt ?? ''))
    .slice(0, RECENT_LIMIT);
}

export function exportDb(): string {
  ensureLoaded();
  return JSON.stringify({ version: 1, exportedAt: nowIso(), foods: state.foods }, null, 2);
}

export function importDb(json: string, mode: 'merge' | 'replace' = 'merge'): { added: number; skipped: number } {
  ensureLoaded();
  const parsed = JSON.parse(json);
  const arr = CustomFoodsArraySchema.safeParse(parsed?.foods ?? parsed);
  if (!arr.success) throw new Error('Invalid nutrition database file');
  if (mode === 'replace') {
    state = { foods: arr.data };
    persist(); emit();
    return { added: arr.data.length, skipped: 0 };
  }
  const existingNames = new Set(state.foods.map(f => normalizeName(f.name)));
  let added = 0, skipped = 0;
  const merged = [...state.foods];
  for (const f of arr.data) {
    if (existingNames.has(normalizeName(f.name))) { skipped++; continue; }
    merged.push({ ...f, id: newId(), createdAt: nowIso(), updatedAt: nowIso() });
    existingNames.add(normalizeName(f.name));
    added++;
  }
  state = { foods: merged };
  persist(); emit();
  return { added, skipped };
}
