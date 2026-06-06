export type HabitCategory = 
  | 'health'
  | 'study'
  | 'finance'
  | 'personal'
  | 'work'
  | 'fitness'
  | 'mindfulness'
  | 'social';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface HabitReminder {
  enabled: boolean;
  time: string; // HH:MM format
}

export type FreezeReason = 'Sick' | 'Travel' | 'Emergency' | 'Mental health' | 'Other';

export interface HabitFreeze {
  reason: FreezeReason | string;
  createdAt: string; // ISO datetime string
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  customDays?: number[]; // 0-6 for Sunday-Saturday
  createdOn: string; // ISO date string
  startDate?: string; // ISO date string - when the habit tracking begins
  completedDates: string[]; // Array of ISO date strings
  archived?: boolean;
  reminder?: HabitReminder;
  freezes?: Record<string, HabitFreeze>; // date string -> freeze data
  timesPerDay?: number; // count-based: required completions per day (default 1)
  progress?: Record<string, number>; // count-based: date string -> times completed
}

export const MAX_TIMES_PER_DAY = 10;

export const FREEZE_REASONS: FreezeReason[] = ['Sick', 'Travel', 'Emergency', 'Mental health', 'Other'];
export const MAX_FREEZES_PER_MONTH = 2;

export type AppMode = 'normal' | 'ghost';

export type ThemeColor = 
  | 'indigo'
  | 'violet'
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'slate';

export interface UserProfile {
  name: string;
  themeColor: ThemeColor;
  onboardingCompleted: boolean;
  xp: number;
  level: number;
  unlockedAchievements: string[];
  // Health profile (all optional — populated from Settings)
  weightKg?: number;
  heightCm?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very';
  weightGoal?: 'lose' | 'maintain' | 'gain';
}

export type ThemePreset = 'cosmic' | 'ocean' | 'sunset' | 'emerald' | 'neon';

export interface AppSettings {
  mode: AppMode;
  showXP: boolean;
  showNotifications: boolean;
  notificationPermission: 'default' | 'granted' | 'denied';
  darkMode?: boolean;
  themePreset?: ThemePreset;
}

export interface HabitStats {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  weeklyCompletion: number;
  monthlyCompletion: number;
  disciplineScore: number;
  totalFrozen: number;
}

// XP & Leveling System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (stats: UserXPStats) => boolean;
}

export interface UserXPStats {
  totalCompletions: number;
  totalHabits: number;
  longestStreak: number;
  currentStreak: number;
  daysActive: number;
  perfectDays: number;
  level: number;
}

export interface LevelMilestone {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

export const CATEGORY_LABELS: Record<HabitCategory, string> = {
  health: 'Health',
  study: 'Study',
  finance: 'Finance',
  personal: 'Personal',
  work: 'Work',
  fitness: 'Fitness',
  mindfulness: 'Mindfulness',
  social: 'Social',
};

export const CATEGORY_ICONS: Record<HabitCategory, string> = {
  health: '💊',
  study: '📚',
  finance: '💰',
  personal: '⭐',
  work: '💼',
  fitness: '🏋️',
  mindfulness: '🧘',
  social: '👥',
};

export const THEME_COLORS: Record<ThemeColor, { label: string; hsl: string; hex: string }> = {
  indigo: { label: 'Indigo', hsl: '250 84% 54%', hex: '#6366f1' },
  violet: { label: 'Violet', hsl: '262 83% 58%', hex: '#8b5cf6' },
  blue: { label: 'Blue', hsl: '217 91% 60%', hex: '#3b82f6' },
  cyan: { label: 'Cyan', hsl: '189 94% 43%', hex: '#06b6d4' },
  emerald: { label: 'Emerald', hsl: '160 84% 39%', hex: '#10b981' },
  amber: { label: 'Amber', hsl: '38 92% 50%', hex: '#f59e0b' },
  rose: { label: 'Rose', hsl: '347 77% 50%', hex: '#e11d48' },
  slate: { label: 'Slate', hsl: '215 16% 47%', hex: '#64748b' },
};

export const WEEKDAYS = [
  { value: 0, label: 'Sun', short: 'S' },
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
];

// Level milestones with titles and XP thresholds
export const LEVEL_MILESTONES: LevelMilestone[] = [
  { level: 1, title: 'Beginner', xpRequired: 0, icon: '🌱' },
  { level: 2, title: 'Starter', xpRequired: 50, icon: '🌿' },
  { level: 3, title: 'Apprentice', xpRequired: 150, icon: '🌳' },
  { level: 4, title: 'Consistent', xpRequired: 300, icon: '⭐' },
  { level: 5, title: 'Dedicated', xpRequired: 500, icon: '🌟' },
  { level: 6, title: 'Disciplined', xpRequired: 750, icon: '💪' },
  { level: 7, title: 'Warrior', xpRequired: 1100, icon: '⚔️' },
  { level: 8, title: 'Champion', xpRequired: 1500, icon: '🏆' },
  { level: 9, title: 'Master', xpRequired: 2000, icon: '👑' },
  { level: 10, title: 'Legend', xpRequired: 3000, icon: '🔥' },
  { level: 12, title: 'Ascended', xpRequired: 4500, icon: '🌠' },
  { level: 15, title: 'Transcendent', xpRequired: 7000, icon: '✨' },
  { level: 18, title: 'Mythical', xpRequired: 10000, icon: '🐉' },
  { level: 20, title: 'Legendary', xpRequired: 13000, icon: '⚜️' },
  { level: 25, title: 'Demigod', xpRequired: 20000, icon: '🏛️' },
  { level: 30, title: 'Olympian', xpRequired: 30000, icon: '🏔️' },
  { level: 35, title: 'Ethereal', xpRequired: 42000, icon: '💫' },
  { level: 40, title: 'Celestial', xpRequired: 56000, icon: '🌌' },
  { level: 45, title: 'Cosmic', xpRequired: 72000, icon: '🪐' },
  { level: 50, title: 'Galactic', xpRequired: 90000, icon: '🌀' },
  { level: 60, title: 'Astral', xpRequired: 130000, icon: '🌟' },
  { level: 75, title: 'Divine', xpRequired: 200000, icon: '💎' },
  { level: 90, title: 'Eternal', xpRequired: 300000, icon: '♾️' },
  { level: 100, title: 'Universal', xpRequired: 500000, icon: '🧬' },
];

// Achievements are now in src/data/achievements.ts

// Build a per-level XP requirement table by linearly interpolating between milestones.
// This ensures every integer level (including ones not explicitly listed as milestones)
// has a defined XP threshold so the level keeps progressing past 10, 12, 15, etc.
function buildLevelXPTable(): number[] {
  const maxLevel = LEVEL_MILESTONES[LEVEL_MILESTONES.length - 1].level;
  const table: number[] = new Array(maxLevel + 1).fill(0);
  for (let i = 0; i < LEVEL_MILESTONES.length - 1; i++) {
    const a = LEVEL_MILESTONES[i];
    const b = LEVEL_MILESTONES[i + 1];
    const span = b.level - a.level;
    const xpSpan = b.xpRequired - a.xpRequired;
    for (let l = a.level; l <= b.level; l++) {
      table[l] = Math.round(a.xpRequired + (xpSpan * (l - a.level)) / span);
    }
  }
  return table;
}

const LEVEL_XP_TABLE = buildLevelXPTable();
const MAX_DEFINED_LEVEL = LEVEL_XP_TABLE.length - 1;
// XP per level beyond the last milestone (keeps growth going indefinitely).
const XP_PER_LEVEL_BEYOND_MAX = 50000;

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= MAX_DEFINED_LEVEL) return LEVEL_XP_TABLE[level];
  return LEVEL_XP_TABLE[MAX_DEFINED_LEVEL] + (level - MAX_DEFINED_LEVEL) * XP_PER_LEVEL_BEYOND_MAX;
}

// XP calculation helpers
export function calculateLevel(xp: number): number {
  let level = 1;
  // Walk through defined levels
  for (let l = 1; l <= MAX_DEFINED_LEVEL; l++) {
    if (xp >= LEVEL_XP_TABLE[l]) level = l;
    else return level;
  }
  // Beyond the table, add levels at fixed XP increments
  const extraXP = xp - LEVEL_XP_TABLE[MAX_DEFINED_LEVEL];
  if (extraXP > 0) {
    level = MAX_DEFINED_LEVEL + Math.floor(extraXP / XP_PER_LEVEL_BEYOND_MAX);
  }
  return level;
}

export function getXPForNextLevel(currentXP: number): { current: number; required: number; progress: number } {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = xpRequiredForLevel(currentLevel);
  const nextLevelXP = xpRequiredForLevel(currentLevel + 1);

  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNext = Math.max(1, nextLevelXP - currentLevelXP);

  return {
    current: xpInCurrentLevel,
    required: xpNeededForNext,
    progress: Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)),
  };
}

export function getLevelMilestone(level: number): LevelMilestone {
  // Return the highest milestone at or below the given level so titles/icons
  // are still meaningful for in-between levels (e.g. level 13 uses level 12's title).
  let match = LEVEL_MILESTONES[0];
  for (const m of LEVEL_MILESTONES) {
    if (m.level <= level) match = m;
    else break;
  }
  return match;
}
