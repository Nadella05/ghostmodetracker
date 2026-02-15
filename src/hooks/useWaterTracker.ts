import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { WaterDataSchema, safeParseJSONWithDefaults } from '@/lib/validation';

const STORAGE_KEY = 'habit-tracker-water';

interface WaterData {
  dailyGoal: number;
  intake: Record<string, number>; // { '2026-02-03': 1250 }
}

const DEFAULT_DATA: WaterData = {
  dailyGoal: 2000,
  intake: {},
};

export function useWaterTracker() {
  const [data, setData] = useState<WaterData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage with validation
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const validated = safeParseJSONWithDefaults(
      stored,
      WaterDataSchema.partial(),
      DEFAULT_DATA
    );
    setData(validated);
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const getTodayKey = useCallback(() => {
    return format(new Date(), 'yyyy-MM-dd');
  }, []);

  const getTodayIntake = useCallback(() => {
    const today = getTodayKey();
    return data.intake[today] || 0;
  }, [data.intake, getTodayKey]);

  const addWater = useCallback((amount: number) => {
    const today = getTodayKey();
    setData(prev => ({
      ...prev,
      intake: {
        ...prev.intake,
        [today]: (prev.intake[today] || 0) + amount,
      },
    }));
  }, [getTodayKey]);

  const setDailyGoal = useCallback((goal: number) => {
    setData(prev => ({
      ...prev,
      dailyGoal: goal,
    }));
  }, []);

  const resetToday = useCallback(() => {
    const today = getTodayKey();
    setData(prev => ({
      ...prev,
      intake: {
        ...prev.intake,
        [today]: 0,
      },
    }));
  }, [getTodayKey]);

  const getProgress = useCallback(() => {
    const intake = getTodayIntake();
    const percentage = Math.min(100, Math.round((intake / data.dailyGoal) * 100));
    return {
      intake,
      goal: data.dailyGoal,
      percentage,
      isGoalMet: intake >= data.dailyGoal,
    };
  }, [getTodayIntake, data.dailyGoal]);

  const getIntakeForDate = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return data.intake[dateKey] || 0;
  }, [data.intake]);

  const getWeeklyStats = useCallback(() => {
    const stats: { date: string; intake: number; goal: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      stats.push({
        date: format(date, 'EEE'),
        intake: data.intake[dateKey] || 0,
        goal: data.dailyGoal,
      });
    }
    return stats;
  }, [data.intake, data.dailyGoal]);

  return {
    isLoaded,
    dailyGoal: data.dailyGoal,
    todayIntake: getTodayIntake(),
    addWater,
    setDailyGoal,
    resetToday,
    getProgress,
    getIntakeForDate,
    getWeeklyStats,
  };
}
