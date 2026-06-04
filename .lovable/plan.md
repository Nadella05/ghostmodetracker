# Premium Desktop Layout + Visual Analytics Redesign

Frontend / presentation only. No business logic, no data model, no hook signature changes. All colors via semantic tokens in `index.css` + `tailwind.config.ts`.

## 1. Desktop shell (Dashboard.tsx)

Three-column layout on `xl+`:

```text
[ Sidebar 240px ][ Main (fluid) ][ Insights Panel 360px ]
```

- Left sidebar (`DesktopSidebar.tsx`) — add logo block, user chip (name + level/XP or Ghost glyph), nav items: Dashboard, Habits, Calories, Hydration, Analytics, Achievements, Settings. Keep existing collapse behavior.
- New `dashboard` tab becomes the default landing tab on desktop (mobile keeps current `today` default).
- Center column widens to `max-w-4xl` on desktop; mobile layout untouched.
- Right panel (`DesktopRightPanel.tsx`) becomes **tab-aware** and switches contents based on `activeTab` (passed via prop).

## 2. New Dashboard tab

New component `DashboardOverview.tsx` rendered when `activeTab === 'dashboard'`:

- **Today's Summary** — 5 stat tiles (Habits x/y, Calories kcal, Protein g, Water ml, Consistency %) with ring/arc visuals and trend arrows.
- **Recent Activity** — merged feed from latest habit completions, calorie entries, water logs (read-only, derived from existing hooks).
- **Weekly Snapshot** — three mini sparkline cards (habits, calories, hydration) using existing `recharts`.
- **Quick Insights** — text cards generated from existing `nutritionInsights` + streak data + hydration trend.

## 3. Tab-aware right panel

`DesktopRightPanel` switches contents:

- **dashboard** — Monthly heatmap (consistency) + top streaks.
- **today / habits** — DailySummary + streak leaderboard + consistency ring.
- **calories** — `MacroDashboard` (rings), `WeightProjection`, nutrition insights, weekly nutrition chart (recharts line: protein/calories/carbs).
- **water** — Weekly avg, monthly avg, best day, consistency tiles + 7-day bar chart + monthly hydration heatmap + hydration achievement badge cards.
- **analytics** — compact link to full analytics view.
- **settings / achievements** — hide panel.

Move the analytics blocks currently inline in `CalorieChat.tsx` and `WaterTracker.tsx` into the right panel on `xl+`, keep them inline on smaller screens (conditional render via Tailwind `xl:hidden` / `hidden xl:block`).

## 4. Immersive water + overflow

Extend `LiquidContainer.tsx`:

- Accept `percentage` > 100 without clamping for visual state (logic unchanged).
- When `percentage > 100`: render an `.water-overflow` layer at the top edge with spilling droplets + splash ring + subtle wave amplitude boost. New CSS keyframes: `water-spill`, `water-splash`, `droplet-fall-overflow`.
- Surface waves get gentle amplitude scaling near 100%.
- Ghost mode unaffected (stays monochrome bar).

## 5. GitHub-style heatmap

Rewrite `MonthlyHeatmap.tsx` visuals (data source unchanged):

- 5 intensity levels (0–4) mapped to semantic tokens.
- New per-context palettes via CSS vars: `--heat-habits`, `--heat-calories`, `--heat-hydration`, `--heat-consistency` (purple / orange / blue / green scales), each with 5 steps in HSL.
- Add `variant` prop: `habits | calories | hydration | consistency`.
- Hover tooltip (Radix Tooltip) showing date + per-context metric.
- Reuse in dashboard + hydration right panel.

## 6. Achievements gallery

`AchievementsView.tsx`: convert list to responsive grid (2/3/4 cols). Each card: icon tile, title, description, unlock date, locked state with lock icon + grayscale. Rare tier gets `animate-pulse-glow` ring (new keyframe).

## 7. Stats polish

New small components in `src/components/ui/stat/`:
- `AnimatedCounter.tsx` (requestAnimationFrame tween, respects `prefers-reduced-motion`).
- `TrendArrow.tsx` (up/down/flat with % and color).
- `RingStat.tsx` (SVG ring + center value).

Use across DashboardOverview, MacroDashboard, right-panel tiles.

## 8. Global visual quality

`index.css`:
- New gradient tokens: `--gradient-glass`, `--gradient-hero`, `--gradient-heat-*`.
- Glass utility `.glass-panel` (backdrop-blur + translucent border + soft shadow).
- New shadow token `--shadow-elevated`.
- New keyframes: `water-spill`, `water-splash`, `pulse-glow`, `count-up`.
- Reserve `prefers-reduced-motion` guards.

`tailwind.config.ts`:
- Map new keyframes/animations.
- Extend `boxShadow` with `elevated`, `glass`.

## Files

**New**
- `src/components/DashboardOverview.tsx`
- `src/components/RightPanelHabits.tsx`
- `src/components/RightPanelCalories.tsx`
- `src/components/RightPanelHydration.tsx`
- `src/components/RecentActivity.tsx`
- `src/components/WeeklySnapshot.tsx`
- `src/components/QuickInsights.tsx`
- `src/components/HydrationHeatmap.tsx`
- `src/components/ui/stat/AnimatedCounter.tsx`
- `src/components/ui/stat/TrendArrow.tsx`
- `src/components/ui/stat/RingStat.tsx`

**Edited (presentation only)**
- `src/components/Dashboard.tsx` — add dashboard tab, widen center, pass activeTab to right panel.
- `src/components/DesktopSidebar.tsx` — logo, user chip, Dashboard + Achievements entries.
- `src/components/DesktopRightPanel.tsx` — tab-aware switch.
- `src/components/MonthlyHeatmap.tsx` — variants, tooltips, intensity scale.
- `src/components/AchievementsView.tsx` — gallery grid.
- `src/components/LiquidContainer.tsx` — overflow visuals.
- `src/components/WaterTracker.tsx` — move analytics to xl right panel, keep on mobile.
- `src/components/CalorieChat.tsx` — same xl/mobile split for macro/projection blocks.
- `src/index.css` + `tailwind.config.ts` — tokens, gradients, keyframes.

## Out of scope

No backend, no hook signature changes, no new data persisted, no new libraries (uses existing recharts, radix, lucide).
