import { useState, useEffect, useCallback } from 'react';
import { AppSettings, AppMode } from '@/types/habit';
import { AppSettingsSchema, safeParseJSONWithDefaults } from '@/lib/validation';

const STORAGE_KEY = 'habit-tracker-settings';

const defaultSettings: AppSettings = {
  mode: 'normal',
  showXP: true,
  showNotifications: false,
  notificationPermission: 'default',
  darkMode: false,
  themePreset: 'cosmic',
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
    setSettings({ ...defaultSettings, ...validated });
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage and apply mode/theme classes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      const root = document.documentElement;

      // Ghost mode toggles its own class (monochrome overrides)
      root.classList.toggle('ghost-mode', settings.mode === 'ghost');

      // Dark mode independent — ghost mode is always dark
      const isDark = settings.mode === 'ghost' || !!settings.darkMode;
      root.classList.toggle('dark', isDark);

      // Theme preset attribute (ignored in ghost mode by CSS)
      root.setAttribute('data-theme', settings.themePreset || 'cosmic');
    }
  }, [settings, isLoaded]);

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const setThemePreset = useCallback((preset: AppSettings['themePreset']) => {
    setSettings(prev => ({ ...prev, themePreset: preset }));
  }, []);

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
    toggleDarkMode,
    setThemePreset,
    isGhostMode,
  };
}
