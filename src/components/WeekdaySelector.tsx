import { cn } from '@/lib/utils';
import { WEEKDAYS } from '@/types/habit';

interface WeekdaySelectorProps {
  value: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
}

export function WeekdaySelector({ value, onChange, disabled }: WeekdaySelectorProps) {
  const toggleDay = (day: number) => {
    if (disabled) return;
    
    if (value.includes(day)) {
      // Don't allow deselecting if only one day is selected
      if (value.length > 1) {
        onChange(value.filter(d => d !== day));
      }
    } else {
      onChange([...value, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="flex gap-1.5">
      {WEEKDAYS.map((day) => (
        <button
          key={day.value}
          type="button"
          onClick={() => toggleDay(day.value)}
          disabled={disabled}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
            value.includes(day.value)
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title={day.label}
        >
          {day.short}
        </button>
      ))}
    </div>
  );
}
