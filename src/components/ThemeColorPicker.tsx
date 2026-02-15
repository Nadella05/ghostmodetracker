import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeColor, THEME_COLORS } from '@/types/habit';

interface ThemeColorPickerProps {
  value: ThemeColor;
  onChange: (color: ThemeColor) => void;
  size?: 'sm' | 'md';
}

export function ThemeColorPicker({ value, onChange, size = 'md' }: ThemeColorPickerProps) {
  return (
    <div className={cn(
      "grid gap-2",
      size === 'sm' ? 'grid-cols-8' : 'grid-cols-4 gap-3'
    )}>
      {(Object.keys(THEME_COLORS) as ThemeColor[]).map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "relative rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
            size === 'sm' ? 'h-8 w-8 rounded-md' : 'aspect-square rounded-xl',
            value === color && "ring-2 ring-offset-2 ring-offset-background"
          )}
          style={{ 
            backgroundColor: THEME_COLORS[color].hex,
            '--tw-ring-color': THEME_COLORS[color].hex,
          } as React.CSSProperties}
          title={THEME_COLORS[color].label}
        >
          {value === color && (
            <Check className={cn(
              "absolute inset-0 m-auto text-white",
              size === 'sm' ? 'h-3 w-3' : 'h-5 w-5'
            )} />
          )}
          <span className="sr-only">{THEME_COLORS[color].label}</span>
        </button>
      ))}
    </div>
  );
}
