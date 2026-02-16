import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitStats, CATEGORY_LABELS, HabitFreeze, MAX_FREEZES_PER_MONTH, MAX_TIMES_PER_DAY } from '@/types/habit';
import { HabitsArraySchema, ImportDataSchema, safeParseJSON } from '@/lib/validation';
import { 
  format, 
  parseISO, 
  differenceInDays,
  startOfWeek,
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay
} from 'date-fns';

const STORAGE_KEY = 'habit-tracker-habits';

const generateId = () => crypto.randomUUID();

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load habits from localStorage with validation
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const validated = safeParseJSON(stored, HabitsArraySchema, []) as Habit[];
    setHabits(validated);
    setIsLoaded(true);
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdOn' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdOn: format(new Date(), 'yyyy-MM-dd'),
      completedDates: [],
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: true } : h));
  }, []);

  const toggleHabitForDate = useCallback((habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const timesPerDay = h.timesPerDay || 1;
      
      if (timesPerDay > 1) {
        // Count-based habit: increment progress
        const progress = { ...(h.progress || {}) };
        const current = progress[dateStr] || 0;
        
        if (current >= timesPerDay) {
          // Already complete — reset progress and remove from completedDates
          delete progress[dateStr];
          return {
            ...h,
            progress,
            completedDates: h.completedDates.filter(d => d !== dateStr),
          };
        }
        
        const newCount = current + 1;
        progress[dateStr] = newCount;
        
        // Mark completed only when fully done
        const isNowComplete = newCount >= timesPerDay;
        const wasComplete = h.completedDates.includes(dateStr);
        
        return {
          ...h,
          progress,
          completedDates: isNowComplete && !wasComplete
            ? [...h.completedDates, dateStr]
            : isNowComplete ? h.completedDates : h.completedDates.filter(d => d !== dateStr),
        };
      }
      
      // Standard single-tap habit
      const isCompleted = h.completedDates.includes(dateStr);
      return {
        ...h,
        completedDates: isCompleted
          ? h.completedDates.filter(d => d !== dateStr)
          : [...h.completedDates, dateStr],
      };
    }));
  }, []);

  const freezeHabitForDate = useCallback((habitId: string, date: Date, reason: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const freezes = { ...(h.freezes || {}) };
      freezes[dateStr] = { reason, createdAt: new Date().toISOString() };
      // Remove from completedDates if present
      return {
        ...h,
        freezes,
        completedDates: h.completedDates.filter(d => d !== dateStr),
      };
    }));
  }, []);

  const unFreezeHabitForDate = useCallback((habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const freezes = { ...(h.freezes || {}) };
      delete freezes[dateStr];
      return { ...h, freezes };
    }));
  }, []);

  const isHabitFrozenForDate = useCallback((habit: Habit, date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return !!(habit.freezes && habit.freezes[dateStr]);
  }, []);

  const getFreezesThisMonth = useCallback((habit: Habit, date: Date): number => {
    if (!habit.freezes) return 0;
    const monthStr = format(date, 'yyyy-MM');
    return Object.keys(habit.freezes).filter(d => d.startsWith(monthStr)).length;
  }, []);

  const canFreezeHabit = useCallback((habit: Habit, date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Already completed or frozen
    if (habit.completedDates.includes(dateStr)) return false;
    if (habit.freezes && habit.freezes[dateStr]) return false;
    // Max freezes per month
    if (getFreezesThisMonth(habit, date) >= MAX_FREEZES_PER_MONTH) return false;
    return true;
  }, [getFreezesThisMonth]);

  const isHabitCompletedForDate = useCallback((habit: Habit, date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const timesPerDay = habit.timesPerDay || 1;
    if (timesPerDay > 1) {
      return (habit.progress?.[dateStr] || 0) >= timesPerDay;
    }
    return habit.completedDates.includes(dateStr);
  }, []);

  const getProgressForDate = useCallback((habit: Habit, date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if ((habit.timesPerDay || 1) <= 1) {
      return habit.completedDates.includes(dateStr) ? 1 : 0;
    }
    return habit.progress?.[dateStr] || 0;
  }, []);

  const isHabitScheduledForDate = useCallback((habit: Habit, date: Date): boolean => {
    const dayOfWeek = getDay(date);
    
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekly' && habit.customDays && habit.customDays.length > 0) {
      return habit.customDays.includes(dayOfWeek);
    }
    if (habit.frequency === 'weekly') return dayOfWeek === 0; // Default Sunday
    if (habit.frequency === 'custom' && habit.customDays) {
      return habit.customDays.includes(dayOfWeek);
    }
    return true;
  }, []);

  const getStreakForHabit = useCallback((habit: Habit): number => {
    if (habit.completedDates.length === 0 && (!habit.freezes || Object.keys(habit.freezes).length === 0)) return 0;
    
    // Merge completed and frozen dates, sort descending
    const completedSet = new Set(habit.completedDates);
    const frozenSet = new Set(Object.keys(habit.freezes || {}));
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check if today is completed or frozen, if not start from yesterday
    const todayStr = format(currentDate, 'yyyy-MM-dd');
    if (!completedSet.has(todayStr) && !frozenSet.has(todayStr)) {
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Walk backwards counting streak
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (completedSet.has(dateStr)) {
        streak++; // Completed days increment streak
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (frozenSet.has(dateStr)) {
        // Frozen days preserve streak but don't increment
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break; // Missed day breaks streak
      }
    }
    
    return streak;
  }, []);

  const getHabitStats = useCallback((habit: Habit): HabitStats => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    
    const weekDays = eachDayOfInterval({ start: weekStart, end: now });
    const monthDays = eachDayOfInterval({ start: monthStart, end: now });
    
    // For weekly habits, only count scheduled days
    const scheduledWeekDays = weekDays.filter(d => isHabitScheduledForDate(habit, d));
    const scheduledMonthDays = monthDays.filter(d => isHabitScheduledForDate(habit, d));
    
    const weekCompleted = scheduledWeekDays.filter(d => isHabitCompletedForDate(habit, d)).length;
    const monthCompleted = scheduledMonthDays.filter(d => isHabitCompletedForDate(habit, d)).length;
    
    const createdDate = parseISO(habit.createdOn);
    const allDaysSinceCreated = eachDayOfInterval({ start: createdDate, end: now });
    const scheduledDaysSinceCreated = allDaysSinceCreated.filter(d => isHabitScheduledForDate(habit, d));
    const totalScheduledDays = Math.max(1, scheduledDaysSinceCreated.length);
    
    const currentStreak = getStreakForHabit(habit);
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...habit.completedDates]
      .map(d => parseISO(d))
      .sort((a, b) => a.getTime() - b.getTime());
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = differenceInDays(sortedDates[i], sortedDates[i - 1]);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    // Count frozen days
    const totalFrozen = habit.freezes ? Object.keys(habit.freezes).length : 0;
    
    // Discipline score: completed / (scheduled - frozen)
    const frozenScheduledDays = scheduledDaysSinceCreated.filter(d => 
      habit.freezes && habit.freezes[format(d, 'yyyy-MM-dd')]
    ).length;
    const effectiveScheduledDays = Math.max(1, totalScheduledDays - frozenScheduledDays);
    
    return {
      totalCompleted: habit.completedDates.length,
      currentStreak,
      longestStreak,
      weeklyCompletion: scheduledWeekDays.length > 0 
        ? Math.round((weekCompleted / scheduledWeekDays.length) * 100) 
        : 0,
      monthlyCompletion: scheduledMonthDays.length > 0 
        ? Math.round((monthCompleted / scheduledMonthDays.length) * 100) 
        : 0,
      disciplineScore: Math.round((habit.completedDates.length / effectiveScheduledDays) * 100),
      totalFrozen,
    };
  }, [isHabitCompletedForDate, isHabitScheduledForDate, getStreakForHabit]);

  const getTodaysHabits = useCallback(() => {
    const today = new Date();
    return habits.filter(h => {
      if (h.archived) return false;
      return isHabitScheduledForDate(h, today);
    });
  }, [habits, isHabitScheduledForDate]);

  const getActiveHabits = useCallback(() => {
    return habits.filter(h => !h.archived);
  }, [habits]);

  const exportData = useCallback(() => {
    return JSON.stringify({ habits, exportedAt: new Date().toISOString() }, null, 2);
  }, [habits]);

  const exportDataCSV = useCallback(() => {
    if (habits.length === 0) return '';
    
    // CSV headers
    const headers = ['Habit Name', 'Category', 'Frequency', 'Created On', 'Total Completions', 'Archived', 'Completion Dates'];
    
    // CSV rows
    const rows = habits.map(habit => {
      const categoryLabel = CATEGORY_LABELS[habit.category] || habit.category;
      const frequency = habit.frequency === 'custom' && habit.customDays 
        ? `Custom (${habit.customDays.join(',')})`
        : habit.frequency;
      
      return [
        `"${habit.name.replace(/"/g, '""')}"`,
        categoryLabel,
        frequency,
        habit.createdOn,
        habit.completedDates.length.toString(),
        habit.archived ? 'Yes' : 'No',
        `"${habit.completedDates.join(', ')}"`,
      ].join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }, [habits]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      const result = ImportDataSchema.safeParse(parsed);
      
      if (result.success) {
        setHabits(result.data.habits as Habit[]);
        return true;
      } else {
        if (import.meta.env.DEV) {
          console.error('Import validation failed:', result.error.issues);
        }
        return false;
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Import parse error:', e);
      }
      return false;
    }
  }, []);

  return {
    habits,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    toggleHabitForDate,
    isHabitCompletedForDate,
    getProgressForDate,
    isHabitFrozenForDate,
    freezeHabitForDate,
    unFreezeHabitForDate,
    canFreezeHabit,
    getFreezesThisMonth,
    getStreakForHabit,
    getHabitStats,
    getTodaysHabits,
    getActiveHabits,
    exportData,
    exportDataCSV,
    importData,
  };
}
