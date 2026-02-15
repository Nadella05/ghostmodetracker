import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  UserProfile, 
  UserXPStats, 
  ACHIEVEMENTS, 
  calculateLevel,
  Achievement
} from '@/types/habit';
import { XPLogSchema, safeParseJSONWithDefaults } from '@/lib/validation';

const XP_PER_COMPLETION = 10;
const XP_STORAGE_KEY = 'habit-tracker-xp-log';

interface XPLog {
  total: number;
  log: Record<string, string[]>; // { '2026-02-03': ['habitId1', 'habitId2'] }
  lastEvaluatedDate?: string;
}

const DEFAULT_XP_LOG: XPLog = {
  total: 0,
  log: {},
};

export function useXPSystem(
  profile: UserProfile,
  updateProfile: (updates: Partial<UserProfile>) => void,
  isGhostMode: boolean
) {
  const [xpLog, setXpLog] = useState<XPLog>(DEFAULT_XP_LOG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load XP log from localStorage with validation
  useEffect(() => {
    const stored = localStorage.getItem(XP_STORAGE_KEY);
    const validated = safeParseJSONWithDefaults(
      stored,
      XPLogSchema.partial(),
      DEFAULT_XP_LOG
    );
    setXpLog(validated);
    setIsLoaded(true);
  }, []);

  // Save XP log to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(xpLog));
    }
  }, [xpLog, isLoaded]);

  // Award XP for completing a habit (only once per habit per day)
  const awardCompletionXP = useCallback((habitId: string): { awarded: boolean; newXP?: number; leveledUp?: boolean } => {
    if (isGhostMode) return { awarded: false }; // No XP in ghost mode
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLog = xpLog.log[today] || [];
    
    // Check if XP already awarded for this habit today
    if (todayLog.includes(habitId)) {
      return { awarded: false };
    }
    
    // Award XP
    const newTotal = profile.xp + XP_PER_COMPLETION;
    const newLevel = calculateLevel(newTotal);
    const leveledUp = newLevel > profile.level;
    
    // Update XP log
    setXpLog(prev => ({
      ...prev,
      total: newTotal,
      log: {
        ...prev.log,
        [today]: [...todayLog, habitId],
      },
    }));
    
    // Update profile
    updateProfile({
      xp: newTotal,
      level: newLevel,
    });
    
    return { awarded: true, newXP: newTotal, leveledUp };
  }, [isGhostMode, xpLog.log, profile.xp, profile.level, updateProfile]);

  // Remove XP when uncompleting a habit (if it was awarded today)
  const removeCompletionXP = useCallback((habitId: string): boolean => {
    if (isGhostMode) return false;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLog = xpLog.log[today] || [];
    
    // Check if XP was awarded for this habit today
    if (!todayLog.includes(habitId)) {
      return false;
    }
    
    // Remove XP
    const newTotal = Math.max(0, profile.xp - XP_PER_COMPLETION);
    const newLevel = calculateLevel(newTotal);
    
    // Update XP log
    setXpLog(prev => ({
      ...prev,
      total: newTotal,
      log: {
        ...prev.log,
        [today]: todayLog.filter(id => id !== habitId),
      },
    }));
    
    // Update profile
    updateProfile({
      xp: newTotal,
      level: newLevel,
    });
    
    return true;
  }, [isGhostMode, xpLog.log, profile.xp, updateProfile]);

  // Check if XP was awarded for a habit today
  const wasXPAwardedToday = useCallback((habitId: string): boolean => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLog = xpLog.log[today] || [];
    return todayLog.includes(habitId);
  }, [xpLog.log]);

  // Check and unlock achievements (run once per day, not per render)
  const checkAndUnlockAchievements = useCallback((stats: UserXPStats): Achievement[] => {
    if (isGhostMode) return []; // Achievements tracked but not shown in ghost mode
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Only run achievement check once per day
    if (xpLog.lastEvaluatedDate === today) {
      return [];
    }
    
    const newlyUnlocked: Achievement[] = [];
    const alreadyUnlocked = profile.unlockedAchievements || [];
    
    for (const achievement of ACHIEVEMENTS) {
      if (!alreadyUnlocked.includes(achievement.id) && achievement.condition(stats)) {
        newlyUnlocked.push(achievement);
      }
    }
    
    if (newlyUnlocked.length > 0) {
      const totalXPReward = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
      const newUnlockedIds = [...alreadyUnlocked, ...newlyUnlocked.map(a => a.id)];
      const newXP = profile.xp + totalXPReward;
      const newLevel = calculateLevel(newXP);
      
      updateProfile({
        unlockedAchievements: newUnlockedIds,
        xp: newXP,
        level: newLevel,
      });
      
      // Update XP log total as well
      setXpLog(prev => ({
        ...prev,
        total: newXP,
      }));
    }
    
    // Mark today as evaluated
    setXpLog(prev => ({
      ...prev,
      lastEvaluatedDate: today,
    }));
    
    return newlyUnlocked;
  }, [profile.unlockedAchievements, profile.xp, updateProfile, isGhostMode, xpLog.lastEvaluatedDate]);

  // Force achievement check (for manual trigger)
  const forceAchievementCheck = useCallback((stats: UserXPStats): Achievement[] => {
    if (isGhostMode) return [];
    
    const newlyUnlocked: Achievement[] = [];
    const alreadyUnlocked = profile.unlockedAchievements || [];
    
    for (const achievement of ACHIEVEMENTS) {
      if (!alreadyUnlocked.includes(achievement.id) && achievement.condition(stats)) {
        newlyUnlocked.push(achievement);
      }
    }
    
    if (newlyUnlocked.length > 0) {
      const totalXPReward = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
      const newUnlockedIds = [...alreadyUnlocked, ...newlyUnlocked.map(a => a.id)];
      const newXP = profile.xp + totalXPReward;
      const newLevel = calculateLevel(newXP);
      
      updateProfile({
        unlockedAchievements: newUnlockedIds,
        xp: newXP,
        level: newLevel,
      });
      
      setXpLog(prev => ({
        ...prev,
        total: newXP,
      }));
    }
    
    return newlyUnlocked;
  }, [profile.unlockedAchievements, profile.xp, updateProfile, isGhostMode]);

  const getUnlockedAchievements = useCallback(() => {
    const unlockedIds = profile.unlockedAchievements || [];
    return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
  }, [profile.unlockedAchievements]);

  const getLockedAchievements = useCallback(() => {
    const unlockedIds = profile.unlockedAchievements || [];
    return ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));
  }, [profile.unlockedAchievements]);

  const getTodayXPLog = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return xpLog.log[today] || [];
  }, [xpLog.log]);

  return {
    isLoaded,
    awardCompletionXP,
    removeCompletionXP,
    wasXPAwardedToday,
    checkAndUnlockAchievements,
    forceAchievementCheck,
    getUnlockedAchievements,
    getLockedAchievements,
    getTodayXPLog,
    currentXP: profile.xp,
    currentLevel: profile.level,
    xpPerCompletion: XP_PER_COMPLETION,
  };
}
