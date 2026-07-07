# Custom Nutrition Database & Intelligent Calculator

Upgrade the Calories module into a MyFitnessPal-style nutrition system with a user-owned food database, live proportional calculation, and rich logging UX. Existing chat/NLP logging keeps working — this is an additional professional path on top.

## What you'll get

1. A **Nutrition Master Database** stored locally (per user) — add, edit, delete, archive, search foods.
2. A polished **Add / Edit Food** form with reference quantity + full macro breakdown.
3. A **Food Search + Quick Log** panel: type → suggestions → set quantity → nutrition preview updates live → save.
4. **Favourites** and **Recent Foods** rows for one-tap logging.
5. **Import / Export** the whole nutrition DB as JSON.
6. Full validation (no negatives, no duplicate names, required fields).
7. Existing chat logging, macros dashboard, weight projection, and history remain untouched.

## Data model (new)

```ts
type RefUnit = 'g' | 'ml' | 'piece' | 'cup' | 'glass' | 'bowl' | 'plate' | 'slice' | 'serving';

interface CustomFood {
  id: string;
  name: string;
  category: string;         // free-form + preset list
  brand?: string;
  referenceQuantity: number;
  referenceUnit: RefUnit;
  nutrition: { calories, protein, carbs, fat, fiber, sugar, sodium };
  notes?: string;
  favourite?: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}
```

Stored in localStorage under `habit-tracker-nutrition-db` with a Zod schema (matches project's validation pattern in `src/lib/validation.ts`). Existing logged entries are **not** migrated — old data stays as-is; the new engine is used for new logs.

## Calculation engine

```
multiplier = userQuantity / referenceQuantity
result[nutrient] = reference[nutrient] * multiplier   // rounded
```

Live-recomputes on every quantity keystroke. Saved log entries snapshot the computed values so editing the master food later doesn't retroactively change history (with a "Recalculate" action on the entry to opt in).

## UX flow

```
Calories tab
 ├── Hero (unchanged): today's kcal + progress
 ├── NEW: [🔍 Search foods…] input
 │        ↓ dropdown: Favourites • Recents • Matches
 │        ↓ select → quantity + unit → live nutrition preview → [Log]
 ├── NEW: "Manage Foods" button → opens Nutrition Database dialog
 │        • list with search, filter by category, favourite toggle
 │        • Add Food / Edit Food / Delete / Archive
 │        • Import / Export JSON
 └── Chat + history (unchanged)
```

## Files

**New**
- `src/types/nutrition.ts` — `CustomFood`, `RefUnit`, category presets
- `src/lib/nutritionDb.ts` — CRUD + search + favourites + recents + import/export, event-based subscribe (mirrors `useCalorieTracker` store pattern)
- `src/hooks/useNutritionDb.ts` — React hook via `useSyncExternalStore`
- `src/components/nutrition/FoodSearchBar.tsx` — search input + suggestions dropdown
- `src/components/nutrition/FoodQuickLog.tsx` — quantity + live nutrition preview + log button
- `src/components/nutrition/FoodFormDialog.tsx` — add/edit modal with Zod validation
- `src/components/nutrition/NutritionDatabaseDialog.tsx` — full CRUD list + import/export
- Zod schemas added to `src/lib/validation.ts`

**Edited**
- `src/components/CalorieChat.tsx` — mount `FoodSearchBar` above the chat and a "Manage foods" button in the header; wire selection → `FoodQuickLog` → `addCustomCalorie` (extended to accept a full macro payload)
- `src/hooks/useCalorieTracker.ts` — extend `addCustomCalorie` (or add `addFoodEntry`) so it can accept precomputed macros instead of estimating; existing chat path stays on the estimator

## Out of scope (kept future-ready per your spec)
Barcode scan, AI recognition, online sync, recipe/meal builder — data model already supports these (brand, category, notes fields, stable id) but no UI in this pass.

## Validation
Duplicate name check (case-insensitive, non-archived), positive numbers only, required: name + refQty + refUnit + calories. Unit enum enforced. XSS-safe strings (reuses `safeString` pattern from `validation.ts`).

Shall I build this?
