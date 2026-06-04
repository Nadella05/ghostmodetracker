import { HydrationAnalytics } from '@/components/HydrationAnalytics';
import { HydrationHeatmap } from '@/components/HydrationHeatmap';

export function RightPanelHydration() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Hydration Analytics</h3>
        <HydrationAnalytics />
      </div>
      <div>
        <HydrationHeatmap />
      </div>
    </div>
  );
}
