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
  completedDates: string[]; // Array of ISO date strings
  archived?: boolean;
  reminder?: HabitReminder;
  freezes?: Record<string, HabitFreeze>; // date string -> freeze data
}

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
}

export interface AppSettings {
  mode: AppMode;
  showXP: boolean;
  showNotifications: boolean;
  notificationPermission: 'default' | 'granted' | 'denied';
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
];

// Achievements list
export const ACHIEVEMENTS: Achievement[] = [
  // Completion milestones
  {
    id: 'first_habit',
    name: 'First Step',
    description: 'Complete your first habit',
    icon: '🎯',
    xpReward: 10,
    condition: (stats) => stats.totalCompletions >= 1,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7 habits total',
    icon: '🗓️',
    xpReward: 25,
    condition: (stats) => stats.totalCompletions >= 7,
  },
  {
    id: 'half_century',
    name: 'Halfway There',
    description: 'Complete 50 habits',
    icon: '🌟',
    xpReward: 50,
    condition: (stats) => stats.totalCompletions >= 50,
  },
  {
    id: 'century',
    name: 'Century Club',
    description: 'Complete 100 habits',
    icon: '💯',
    xpReward: 100,
    condition: (stats) => stats.totalCompletions >= 100,
  },
  {
    id: 'double_century',
    name: 'Double Century',
    description: 'Complete 200 habits',
    icon: '🎖️',
    xpReward: 150,
    condition: (stats) => stats.totalCompletions >= 200,
  },
  {
    id: 'habit_machine',
    name: 'Habit Machine',
    description: 'Complete 500 habits',
    icon: '🤖',
    xpReward: 300,
    condition: (stats) => stats.totalCompletions >= 500,
  },
  {
    id: 'thousand_club',
    name: 'Thousand Club',
    description: 'Complete 1000 habits',
    icon: '🏅',
    xpReward: 500,
    condition: (stats) => stats.totalCompletions >= 1000,
  },

  // Streak achievements
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Reach a 3-day streak',
    icon: '🔥',
    xpReward: 15,
    condition: (stats) => stats.longestStreak >= 3,
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Reach a 7-day streak',
    icon: '🔥',
    xpReward: 50,
    condition: (stats) => stats.longestStreak >= 7,
  },
  {
    id: 'two_week_warrior',
    name: 'Two Week Warrior',
    description: 'Reach a 14-day streak',
    icon: '⚡',
    xpReward: 75,
    condition: (stats) => stats.longestStreak >= 14,
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Reach a 30-day streak',
    icon: '📅',
    xpReward: 150,
    condition: (stats) => stats.longestStreak >= 30,
  },
  {
    id: 'sixty_day_streak',
    name: 'Unstoppable',
    description: 'Reach a 60-day streak',
    icon: '💪',
    xpReward: 250,
    condition: (stats) => stats.longestStreak >= 60,
  },
  {
    id: 'ninety_day_streak',
    name: 'Habit Hero',
    description: 'Reach a 90-day streak',
    icon: '🦸',
    xpReward: 400,
    condition: (stats) => stats.longestStreak >= 90,
  },
  {
    id: 'year_streak',
    name: 'Year of Discipline',
    description: 'Reach a 365-day streak',
    icon: '🏆',
    xpReward: 1000,
    condition: (stats) => stats.longestStreak >= 365,
  },

  // Habit creation achievements
  {
    id: 'habit_collector',
    name: 'Habit Collector',
    description: 'Create 3 different habits',
    icon: '📦',
    xpReward: 20,
    condition: (stats) => stats.totalHabits >= 3,
  },
  {
    id: 'habit_enthusiast',
    name: 'Habit Enthusiast',
    description: 'Create 5 different habits',
    icon: '📚',
    xpReward: 35,
    condition: (stats) => stats.totalHabits >= 5,
  },
  {
    id: 'habit_architect',
    name: 'Habit Architect',
    description: 'Create 10 different habits',
    icon: '🏗️',
    xpReward: 75,
    condition: (stats) => stats.totalHabits >= 10,
  },
  {
    id: 'lifestyle_designer',
    name: 'Lifestyle Designer',
    description: 'Create 15 different habits',
    icon: '✨',
    xpReward: 100,
    condition: (stats) => stats.totalHabits >= 15,
  },

  // Perfect days achievements
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete all habits in a day',
    icon: '⭐',
    xpReward: 25,
    condition: (stats) => stats.perfectDays >= 1,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Have 7 perfect days',
    icon: '🌈',
    xpReward: 75,
    condition: (stats) => stats.perfectDays >= 7,
  },
  {
    id: 'perfect_month',
    name: 'Perfect Month',
    description: 'Have 30 perfect days',
    icon: '🌙',
    xpReward: 200,
    condition: (stats) => stats.perfectDays >= 30,
  },

  // Days active achievements
  {
    id: 'one_week_active',
    name: 'Getting Started',
    description: 'Be active for 7 days',
    icon: '🌱',
    xpReward: 30,
    condition: (stats) => stats.daysActive >= 7,
  },
  {
    id: 'one_month_active',
    name: 'Committed',
    description: 'Be active for 30 days',
    icon: '🌿',
    xpReward: 100,
    condition: (stats) => stats.daysActive >= 30,
  },
  {
    id: 'three_months_active',
    name: 'Dedicated User',
    description: 'Be active for 90 days',
    icon: '🌳',
    xpReward: 250,
    condition: (stats) => stats.daysActive >= 90,
  },
  {
    id: 'six_months_active',
    name: 'Habit Veteran',
    description: 'Be active for 180 days',
    icon: '🏔️',
    xpReward: 400,
    condition: (stats) => stats.daysActive >= 180,
  },
  {
    id: 'one_year_active',
    name: 'Year Strong',
    description: 'Be active for 365 days',
    icon: '🎂',
    xpReward: 750,
    condition: (stats) => stats.daysActive >= 365,
  },

  // Level achievements
  {
    id: 'level_3',
    name: 'Apprentice',
    description: 'Reach level 3',
    icon: '🌿',
    xpReward: 25,
    condition: (stats) => stats.level >= 3,
  },
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    xpReward: 50,
    condition: (stats) => stats.level >= 5,
  },
  {
    id: 'level_7',
    name: 'Champion',
    description: 'Reach level 7',
    icon: '🏆',
    xpReward: 100,
    condition: (stats) => stats.level >= 7,
  },
  {
    id: 'level_10',
    name: 'Legend Status',
    description: 'Reach level 10',
    icon: '👑',
    xpReward: 200,
    condition: (stats) => stats.level >= 10,
  },

  // Fun/special achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 habits before noon',
    icon: '🌅',
    xpReward: 40,
    condition: (stats) => stats.totalCompletions >= 10, // Simplified - would need time tracking
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Return after 7+ days and complete a habit',
    icon: '🔄',
    xpReward: 30,
    condition: (stats) => stats.totalCompletions >= 1, // Simplified
  },
];

// XP calculation helpers
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_MILESTONES.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_MILESTONES[i].xpRequired) {
      return LEVEL_MILESTONES[i].level;
    }
  }
  return 1;
}

export function getXPForNextLevel(currentXP: number): { current: number; required: number; progress: number } {
  const currentLevel = calculateLevel(currentXP);
  const currentMilestone = LEVEL_MILESTONES.find(m => m.level === currentLevel);
  const nextMilestone = LEVEL_MILESTONES.find(m => m.level === currentLevel + 1);
  
  if (!nextMilestone) {
    return { current: currentXP, required: currentXP, progress: 100 };
  }
  
  const xpInCurrentLevel = currentXP - (currentMilestone?.xpRequired || 0);
  const xpNeededForNext = nextMilestone.xpRequired - (currentMilestone?.xpRequired || 0);
  
  return {
    current: xpInCurrentLevel,
    required: xpNeededForNext,
    progress: Math.round((xpInCurrentLevel / xpNeededForNext) * 100),
  };
}

export function getLevelMilestone(level: number): LevelMilestone {
  return LEVEL_MILESTONES.find(m => m.level === level) || LEVEL_MILESTONES[0];
}
