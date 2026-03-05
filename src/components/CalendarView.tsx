import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek, getDay, isFuture } from 'date-fns';
import { ChevronLeft, ChevronRight, Snowflake, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useHabitContext } from '@/contexts/HabitContext';
import { Button } from '@/components/ui/button';
import { HabitCard } from '@/components/HabitCard';

export function CalendarView() {
  const { habits, isHabitCompletedForDate, isHabitFrozenForDate, isGhostMode, getActiveHabits, isHabitScheduledForDate } = useHabitContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const activeHabits = getActiveHabits();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getScheduledHabitsForDay = (day: Date) => {
    return activeHabits.filter(h => isHabitScheduledForDate(h, day));
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
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day: Date) => {
    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
    if (!isCurrentMonth) return;
    if (isFuture(day) && !isToday(day)) return;
    
    if (selectedDate && day.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(day);
    }
  };

  // Get habits for selected date split into completed/incomplete/frozen
  const getSelectedDateHabits = () => {
    if (!selectedDate) return null;
    const scheduled = getScheduledHabitsForDay(selectedDate);
    const completed = scheduled.filter(h => isHabitCompletedForDate(h, selectedDate!));
    const frozen = scheduled.filter(h => isHabitFrozenForDate(h, selectedDate!) && !isHabitCompletedForDate(h, selectedDate!));
    const incomplete = scheduled.filter(h => !isHabitCompletedForDate(h, selectedDate!) && !isHabitFrozenForDate(h, selectedDate!));
    return { completed, incomplete, frozen };
  };

  const selectedHabits = getSelectedDateHabits();

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
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
          const isFutureDate = isFuture(day) && !isTodayDate;
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              disabled={!isCurrentMonth || isFutureDate}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative transition-all",
                !isCurrentMonth && "text-muted-foreground/40 cursor-default",
                isFutureDate && isCurrentMonth && "text-muted-foreground/40 cursor-default",
                isCurrentMonth && !isFutureDate && "cursor-pointer hover:bg-secondary/50",
                isTodayDate && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                isSelected && "bg-primary/15 ring-2 ring-primary",
              )}
            >
              <span className={cn(
                "font-medium",
                isTodayDate && "text-primary",
                isSelected && "text-primary font-bold"
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
            </button>
          );
        })}
      </div>

      {/* Selected Date Habits */}
      {selectedDate && selectedHabits && (
        <div className="space-y-4 pt-2 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedHabits.completed.length === 0 && selectedHabits.incomplete.length === 0 && selectedHabits.frozen.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No habits scheduled for this day</p>
          ) : (
            <>
              {/* Completed */}
              {selectedHabits.completed.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-success flex items-center gap-1.5">
                    ✔ Completed ({selectedHabits.completed.length})
                  </p>
                  {selectedHabits.completed.map(habit => (
                    <HabitCard key={habit.id} habit={habit} date={selectedDate} />
                  ))}
                </div>
              )}

              {/* Frozen */}
              {selectedHabits.frozen.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-sky-400 flex items-center gap-1.5">
                    <Snowflake className="h-3.5 w-3.5" /> Frozen ({selectedHabits.frozen.length})
                  </p>
                  {selectedHabits.frozen.map(habit => (
                    <HabitCard key={habit.id} habit={habit} date={selectedDate} />
                  ))}
                </div>
              )}

              {/* Not Completed */}
              {selectedHabits.incomplete.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    ○ Not Completed ({selectedHabits.incomplete.length})
                  </p>
                  {selectedHabits.incomplete.map(habit => (
                    <HabitCard key={habit.id} habit={habit} date={selectedDate} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Legend */}
      {!selectedDate && (
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
      )}
    </div>
  );
}
