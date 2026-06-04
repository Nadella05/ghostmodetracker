import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  /** 0..N; values >100 trigger overflow visuals */
  percentage: number;
  pourTrigger?: number;
  ghost?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Liquid-filled container that becomes a "tank":
 * - Animated SVG waves rise from the bottom
 * - Floating bubbles drift upward
 * - On `pourTrigger` change, a droplet falls and ripples
 * - Above 100%, water spills over the top edge
 */
export function LiquidContainer({ percentage, pourTrigger = 0, ghost, className, children }: Props) {
  const [pour, setPour] = useState(0);

  useEffect(() => {
    if (!pourTrigger) return;
    setPour(p => p + 1);
  }, [pourTrigger]);

  const fillHeight = Math.max(0, Math.min(100, percentage));
  const overflow = percentage > 100;

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
    <div className={cn(
      'relative overflow-hidden rounded-3xl border bg-gradient-to-b from-sky-50/40 to-card dark:from-sky-950/20',
      overflow && 'shadow-elevated ring-1 ring-sky-400/40',
      className,
    )}>
      {/* Liquid layer */}
      <div
        className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out"
        style={{ height: `${fillHeight}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/70 via-sky-500/80 to-blue-600/90" />

        <svg
          className="absolute -top-3 left-0 w-[200%] h-6 animate-water-wave"
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 12 Q150 0 300 12 T600 12 T900 12 T1200 12 V24 H0 Z" className="fill-sky-400/80" />
        </svg>
        <svg
          className="absolute -top-2 left-0 w-[200%] h-5 animate-water-wave-slow opacity-70"
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 14 Q150 24 300 14 T600 14 T900 14 T1200 14 V0 H0 Z" className="fill-sky-300/80" />
        </svg>

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

        {pour > 0 && (
          <span key={pour} className="water-ripple" aria-hidden="true" />
        )}
      </div>

      {/* Overflow visuals on the rim */}
      {overflow && (
        <>
          <span className="water-splash" aria-hidden="true" />
          {[15, 35, 55, 75].map((left, i) => (
            <span
              key={`spill-${i}`}
              className="water-spill-drop"
              style={{ left: `${left}%`, animationDelay: `${i * 0.35}s` }}
              aria-hidden="true"
            />
          ))}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" aria-hidden="true" />
        </>
      )}

      {/* Pour column */}
      {pour > 0 && (
        <span
          key={`drop-${pour}`}
          className="water-pour"
          style={{ height: `${100 - fillHeight}%` }}
          aria-hidden="true"
        />
      )}

      <div className="relative h-full">{children}</div>
    </div>
  );
}
