import React, { createContext, useContext, ReactNode } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWaterTracker } from '@/hooks/useWaterTracker';
import { useXPSystem } from '@/hooks/useXPSystem';
import { Habit, AppSettings, HabitStats, HabitCategory, HabitFrequency, UserProfile, ThemeColor, UserXPStats, Achievement, HabitFreeze } from '@/types/habit';

interface HabitContextType {
  // Habits
  habits: Habit[];
  isLoaded: boolean;
  addHabit: (habit: Omit<Habit, 'id' | 'createdOn' | 'completedDates'>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  toggleHabitForDate: (habitId: string, date: Date) => void;
  isHabitCompletedForDate: (habit: Habit, date: Date) => boolean;
  isHabitFrozenForDate: (habit: Habit, date: Date) => boolean;
  freezeHabitForDate: (habitId: string, date: Date, reason: string) => void;
  unFreezeHabitForDate: (habitId: string, date: Date) => void;
  canFreezeHabit: (habit: Habit, date: Date) => boolean;
  getFreezesThisMonth: (habit: Habit, date: Date) => number;
  getStreakForHabit: (habit: Habit) => number;
  getHabitStats: (habit: Habit) => HabitStats;
  getTodaysHabits: () => Habit[];
  getActiveHabits: () => Habit[];
  exportData: () => string;
  exportDataCSV: () => string;
  importData: (jsonString: string) => boolean;
  
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleMode: () => void;
  isGhostMode: boolean;

  // User Profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setThemeColor: (color: ThemeColor) => void;
  completeOnboarding: (name: string, themeColor: ThemeColor) => void;
  logout: () => void;
  needsOnboarding: boolean;

  // Water Tracker
  waterTracker: {
    dailyGoal: number;
    todayIntake: number;
    addWater: (amount: number) => void;
    setDailyGoal: (goal: number) => void;
    resetToday: () => void;
    getProgress: () => { intake: number; goal: number; percentage: number; isGoalMet: boolean };
    getWeeklyStats: () => { date: string; intake: number; goal: number }[];
  };

  // XP System
  xpSystem: {
    awardCompletionXP: (habitId: string) => { awarded: boolean; newXP?: number; leveledUp?: boolean };
    removeCompletionXP: (habitId: string) => boolean;
    wasXPAwardedToday: (habitId: string) => boolean;
    checkAndUnlockAchievements: (stats: UserXPStats) => Achievement[];
    forceAchievementCheck: (stats: UserXPStats) => Achievement[];
    getUnlockedAchievements: () => Achievement[];
    getLockedAchievements: () => Achievement[];
    currentXP: number;
    currentLevel: number;
    xpPerCompletion: number;
  };
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: ReactNode }) {
  const habitsData = useHabits();
  const settingsData = useAppSettings();
  const profileData = useUserProfile();
  const waterTrackerData = useWaterTracker();
  const xpSystemData = useXPSystem(
    profileData.profile,
    profileData.updateProfile,
    settingsData.isGhostMode
  );

  const value: HabitContextType = {
    ...habitsData,
    ...settingsData,
    ...profileData,
    waterTracker: {
      dailyGoal: waterTrackerData.dailyGoal,
      todayIntake: waterTrackerData.todayIntake,
      addWater: waterTrackerData.addWater,
      setDailyGoal: waterTrackerData.setDailyGoal,
      resetToday: waterTrackerData.resetToday,
      getProgress: waterTrackerData.getProgress,
      getWeeklyStats: waterTrackerData.getWeeklyStats,
    },
    xpSystem: {
      awardCompletionXP: xpSystemData.awardCompletionXP,
      removeCompletionXP: xpSystemData.removeCompletionXP,
      wasXPAwardedToday: xpSystemData.wasXPAwardedToday,
      checkAndUnlockAchievements: xpSystemData.checkAndUnlockAchievements,
      forceAchievementCheck: xpSystemData.forceAchievementCheck,
      getUnlockedAchievements: xpSystemData.getUnlockedAchievements,
      getLockedAchievements: xpSystemData.getLockedAchievements,
      currentXP: xpSystemData.currentXP,
      currentLevel: xpSystemData.currentLevel,
      xpPerCompletion: xpSystemData.xpPerCompletion,
    },
  };

  if (!habitsData.isLoaded || !settingsData.isLoaded || !profileData.isLoaded || !waterTrackerData.isLoaded || !xpSystemData.isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabitContext() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabitContext must be used within a HabitProvider');
  }
  return context;
}
