import { useState, useEffect, useCallback } from 'react';
import { AppSettings, AppMode } from '@/types/habit';
import { AppSettingsSchema, safeParseJSONWithDefaults } from '@/lib/validation';

const STORAGE_KEY = 'habit-tracker-settings';

const defaultSettings: AppSettings = {
  mode: 'normal',
  showXP: true,
  showNotifications: false,
  notificationPermission: 'default',
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage with validation
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const validated = safeParseJSONWithDefaults(
      stored,
      AppSettingsSchema.partial(),
      defaultSettings
    );
    setSettings(validated);
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage and apply mode class
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      
      // Apply ghost mode class to document
      if (settings.mode === 'ghost') {
        document.documentElement.classList.add('ghost-mode');
      } else {
        document.documentElement.classList.remove('ghost-mode');
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleMode = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      mode: prev.mode === 'normal' ? 'ghost' : 'normal',
    }));
  }, []);

  const isGhostMode = settings.mode === 'ghost';

  return {
    settings,
    isLoaded,
    updateSettings,
    toggleMode,
    isGhostMode,
  };
}
