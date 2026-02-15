import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Snowflake } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { Button } from '@/components/ui/button';

export function CalendarView() {
  const { habits, isHabitCompletedForDate, isHabitFrozenForDate, isGhostMode, getActiveHabits } = useHabitContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const activeHabits = getActiveHabits();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getScheduledHabitsForDay = (day: Date) => {
    const dayOfWeek = getDay(day);
    return activeHabits.filter(h => {
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'weekly' && h.customDays && h.customDays.length > 0) {
        return h.customDays.includes(dayOfWeek);
      }
      if (h.frequency === 'weekly') return dayOfWeek === 0;
      return true;
    });
  };

  const getDayStatus = (day: Date) => {
    const scheduledHabits = getScheduledHabitsForDay(day);
    if (scheduledHabits.length === 0) return { completion: 0, hasFrozen: false };
    const completed = scheduledHabits.filter(h => isHabitCompletedForDate(h, day)).length;
    const frozen = scheduledHabits.filter(h => isHabitFrozenForDate(h, day)).length;
    return {
      completion: Math.round((completed / scheduledHabits.length) * 100),
      hasFrozen: frozen > 0,
    };
  };

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={previousMonth} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="py-2">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const { completion, hasFrozen } = getDayStatus(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isTodayDate = isToday(day);
          const hasScheduledHabits = getScheduledHabitsForDay(day).length > 0;
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative",
                !isCurrentMonth && "text-muted-foreground/40",
                isTodayDate && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              <span className={cn(
                "font-medium",
                isTodayDate && "text-primary"
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Completion indicator */}
              {hasScheduledHabits && isCurrentMonth && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {hasFrozen ? (
                    <Snowflake className="h-2.5 w-2.5 text-sky-400" />
                  ) : completion === 100 ? (
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isGhostMode ? "bg-muted-foreground" : "bg-success"
                    )} />
                  ) : completion > 0 ? (
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isGhostMode ? "bg-muted-foreground/50" : "bg-primary/50"
                    )} />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isGhostMode ? "bg-muted-foreground" : "bg-success"
          )} />
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isGhostMode ? "bg-muted-foreground/50" : "bg-primary/50"
          )} />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <Snowflake className="h-2.5 w-2.5 text-sky-400" />
          <span>Frozen</span>
        </div>
      </div>
    </div>
  );
}
