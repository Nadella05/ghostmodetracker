import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  percentage: number;       // 0-100
  pourTrigger?: number;     // increment any time water is added
  ghost?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Liquid-filled container. The element itself becomes the "tank":
 * - Animated SVG waves rise to `percentage` from the bottom
 * - Floating bubbles drift upward
 * - On `pourTrigger` change, a droplet column falls from the top and ripples on impact
 *
 * In ghost mode this degrades to a static monochrome bar.
 */
export function LiquidContainer({ percentage, pourTrigger = 0, ghost, className, children }: Props) {
  const [pour, setPour] = useState(0);

  useEffect(() => {
    if (!pourTrigger) return;
    setPour(p => p + 1);
    const t = setTimeout(() => setPour(p => p), 1400);
    return () => clearTimeout(t);
  }, [pourTrigger]);

  const fillHeight = Math.max(0, Math.min(100, percentage));

  if (ghost) {
    return (
      <div className={cn('relative overflow-hidden rounded-3xl border bg-card', className)}>
        <div
          className="absolute inset-x-0 bottom-0 bg-muted-foreground/30 transition-[height] duration-700"
          style={{ height: `${fillHeight}%` }}
        />
        <div className="relative h-full">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-3xl border bg-gradient-to-b from-sky-50/40 to-card dark:from-sky-950/20', className)}>
      {/* Liquid layer */}
      <div
        className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out"
        style={{ height: `${fillHeight}%` }}
      >
        {/* Bulk water */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/70 via-sky-500/80 to-blue-600/90" />

        {/* Wave layer 1 */}
        <svg
          className="absolute -top-3 left-0 w-[200%] h-6 animate-water-wave"
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 12 Q150 0 300 12 T600 12 T900 12 T1200 12 V24 H0 Z"
            className="fill-sky-400/80"
          />
        </svg>
        {/* Wave layer 2 (offset) */}
        <svg
          className="absolute -top-2 left-0 w-[200%] h-5 animate-water-wave-slow opacity-70"
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 14 Q150 24 300 14 T600 14 T900 14 T1200 14 V0 H0 Z"
            className="fill-sky-300/80"
          />
        </svg>

        {/* Bubbles */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            className="water-bubble"
            style={{
              left: `${10 + i * 14}%`,
              animationDelay: `${i * 0.9}s`,
              width: `${6 + (i % 3) * 3}px`,
              height: `${6 + (i % 3) * 3}px`,
            }}
          />
        ))}

        {/* Ripple at the surface, retriggered on pour */}
        {pour > 0 && (
          <span
            key={pour}
            className="water-ripple"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Pour droplet column */}
      {pour > 0 && (
        <span
          key={`drop-${pour}`}
          className="water-pour"
          style={{ height: `${100 - fillHeight}%` }}
          aria-hidden="true"
        />
      )}

      {/* Content overlay */}
      <div className="relative h-full">{children}</div>
    </div>
  );
}
