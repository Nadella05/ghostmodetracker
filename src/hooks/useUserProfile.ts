import { useState, useEffect, useCallback } from 'react';
import { UserProfile, ThemeColor, THEME_COLORS } from '@/types/habit';
import { UserProfileSchema, safeParseJSONWithDefaults } from '@/lib/validation';

const STORAGE_KEY = 'habit-tracker-user';

const defaultProfile: UserProfile = {
  name: '',
  themeColor: 'indigo',
  onboardingCompleted: false,
  xp: 0,
  level: 1,
  unlockedAchievements: [],
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load profile from localStorage with validation
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const validated = safeParseJSONWithDefaults(
      stored,
      UserProfileSchema.partial(),
      defaultProfile
    );
    setProfile(validated);
    setIsLoaded(true);
  }, []);

  // Save profile to localStorage and apply theme
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      applyThemeColor(profile.themeColor);
    }
  }, [profile, isLoaded]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const completeOnboarding = useCallback((name: string, themeColor: ThemeColor) => {
    setProfile(prev => ({
      ...prev,
      name,
      themeColor,
      onboardingCompleted: true,
    }));
  }, []);

  const setThemeColor = useCallback((color: ThemeColor) => {
    setProfile(prev => ({ ...prev, themeColor: color }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('habit-tracker-habits');
    localStorage.removeItem('habit-tracker-settings');
    setProfile(defaultProfile);
  }, []);

  return {
    profile,
    isLoaded,
    updateProfile,
    completeOnboarding,
    setThemeColor,
    logout,
    needsOnboarding: !profile.onboardingCompleted,
  };
}

function applyThemeColor(color: ThemeColor) {
  const themeData = THEME_COLORS[color];
  if (themeData) {
    document.documentElement.style.setProperty('--primary', themeData.hsl);
    document.documentElement.style.setProperty('--ring', themeData.hsl);
  }
}
