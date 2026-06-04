import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  delta: number; // percent change, e.g. 12 or -5
  className?: string;
  invertGood?: boolean; // when down is good (e.g. calories deficit)
}

export function TrendArrow({ delta, className, invertGood }: Props) {
  const flat = Math.abs(delta) < 0.5;
  const up = delta > 0;
  const good = invertGood ? !up : up;
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md',
        flat && 'bg-muted text-muted-foreground',
        !flat && good && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        !flat && !good && 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(delta).toFixed(0)}%
    </span>
  );
}
