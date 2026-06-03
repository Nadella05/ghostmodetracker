## Scope

Major upgrade to Calories and Hydration modules. Two big systems landed together with shared design language.

---

## A. Nutrition Intelligence

### A1. Expand food database
Update `src/data/foodDatabase.ts` so each entry carries macros per unit:
`{ calories, protein, carbs, fat, fiber, sugar, sodium }`. Keep existing lookup API; add a `getMacros(name, qty, grams?)` helper.

### A2. Parser → macros
Update `src/lib/calorieParser.ts` so `ParsedFoodItem` includes all 7 macros (calories + 6 nutrients). Weight-based items scale per 100g; unit-based items scale by qty.

### A3. Calorie store → nutrition store
Update `src/hooks/useCalorieTracker.ts`:
- `CalorieEntry` carries `macros: { calories, protein, carbs, fat, fiber, sugar, sodium }`
- New selectors: `getDailyMacros(date?)`, `getMacroGoals()`
- Persist new goals: `proteinGoal`, `carbGoal`, `fatGoal`, `fiberGoal` (auto-derived but overridable)

### A4. User profile (weight + goal)
Extend `src/hooks/useUserProfile.ts` and `src/types/habit.ts`:
- `weightKg`, `heightCm`, `age`, `gender`, `activityLevel`, `weightGoal` ('lose'|'maintain'|'gain')
- Onboarding (`src/components/Onboarding.tsx`) gains a 3rd step collecting weight/age/gender/activity/goal (skippable with sensible defaults).
- Settings exposes the same fields for later edits.

### A5. Smart targets
New `src/lib/nutritionTargets.ts`:
- Mifflin-St Jeor BMR → TDEE via activity multiplier
- Calorie target: TDEE − 500 / TDEE / TDEE + 300
- Protein: weight × {1.8 / 1.4 / 2.0}
- Carbs/fat/fiber derived from calorie target (40/30/30 default, fiber 14g per 1000 kcal)

### A6. Nutrition dashboard
Rewrite hero in `src/components/CalorieChat.tsx`:
- Top hero card keeps calorie ring
- New macro grid: Calories, Protein, Carbs, Fat, Fiber — each as a glass card with mini progress ring and current/target
- Insights strip below (auto-generated from `nutritionInsights.ts`): low protein, high sugar, low fiber, deficit/surplus

### A7. Weight projection
New `src/components/WeightProjection.tsx`:
- Reads today's net calorie delta vs TDEE
- Projected today = current − (deficit / 7700) ; 30-day = current − (avg deficit × 30 / 7700)
- Shown in Calories tab + desktop right panel

### A8. Ghost mode nutrition
In Ghost Mode the macro grid renders as a plain monochrome table (numbers only, no rings, no insights, no projection card).

---

## B. Immersive Hydration

### B1. Liquid container shell
Rewrite `src/components/WaterTracker.tsx` so the tab body becomes the container:
- Absolute-positioned SVG/CSS layer fills from bottom by `percentage`
- Two stacked SVG wave paths animated with `transform: translateX` (CSS keyframes, GPU only)
- Floating bubbles: 6 absolutely-positioned divs with staggered `animation: rise` keyframes
- All wrapped in a `<div className="relative overflow-hidden">` so animation never escapes the tab

### B2. Pour animation
On add-water:
- Spawn a falling droplet column from top (CSS keyframe `pour`, 1.2s)
- Trigger a one-shot ripple ring at the surface (scale + fade)
- Animate `percentage` change with `transition: height 800ms cubic-bezier(.4,0,.2,1)`

### B3. Hydration dashboard overlay
Glass card pinned above the water:
- Current / Goal / Remaining / % Hydration
- Quick-add chips: +250 / +500 / +750 / custom
- Reset button

### B4. Hydration analytics
New `src/components/HydrationAnalytics.tsx`:
- 7-day bar chart (recharts already in project)
- Weekly avg, monthly avg, best day, consistency score (% of days hitting goal in last 30)
- Mounted at bottom of Water tab

### B5. Hydration achievements
Extend `src/data/achievements.ts` with: First 1L Day, 7 Days Hydrated, Perfect Hydration Week, 30-Day Hydration Master. Wire into existing achievement check loop.

### B6. Ghost mode hydration
Ghost Mode disables waves, bubbles, ripple, pour droplet. Container becomes a static monochrome progress bar with numeric readout only (matches existing Ghost Mode rules).

### B7. Performance guardrails
- All animations CSS-only (no JS rAF loops)
- `will-change: transform` on wave/bubble elements
- `prefers-reduced-motion` short-circuits waves & bubbles
- Bubble count capped at 6; pour droplet pool reuses one DOM node

---

## Files

**New**
- `src/lib/nutritionTargets.ts`
- `src/lib/nutritionInsights.ts`
- `src/components/MacroDashboard.tsx`
- `src/components/WeightProjection.tsx`
- `src/components/HydrationAnalytics.tsx`
- `src/components/LiquidContainer.tsx` (waves + bubbles + pour SVG layer)

**Edited**
- `src/data/foodDatabase.ts` (add macros)
- `src/lib/calorieParser.ts` (carry macros)
- `src/hooks/useCalorieTracker.ts` (macros + goals)
- `src/hooks/useUserProfile.ts` + `src/types/habit.ts` (weight/age/gender/activity/goal)
- `src/components/Onboarding.tsx` (extra step)
- `src/components/SettingsView.tsx` (edit profile fields)
- `src/components/CalorieChat.tsx` (macro dashboard, projection, insights, ghost variant)
- `src/components/WaterTracker.tsx` (liquid container, dashboard overlay, analytics, ghost variant)
- `src/components/DesktopRightPanel.tsx` (show macro mini-grid + projection)
- `src/data/achievements.ts` (hydration achievements)
- `src/index.css` (wave/bubble/pour/ripple keyframes + glass utilities)

---

## Out of scope
- No backend / Lovable Cloud (frontend-only, matches prior security choice)
- No habit-tab redesign (already done last pass)
- No new charts library
