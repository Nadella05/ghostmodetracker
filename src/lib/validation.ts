import { z } from 'zod';

// Sanitization: reject strings containing potentially dangerous patterns
const dangerousPatterns = /<script|javascript:|on\w+\s*=|<iframe|<object|<embed|<form|data:\s*text\/html/i;

const safeString = (maxLen: number) =>
  z.string().max(maxLen).refine(
    (val) => !dangerousPatterns.test(val),
    { message: 'Input contains disallowed content' }
  );

// Habit validation schema
const HabitCategorySchema = z.enum([
  'health', 'study', 'finance', 'personal', 'work', 'fitness', 'mindfulness', 'social'
]);

const HabitFrequencySchema = z.enum(['daily', 'weekly', 'custom']);

const HabitReminderSchema = z.object({
  enabled: z.boolean(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
}).optional();

const HabitFreezeSchema = z.object({
  reason: safeString(200),
  createdAt: z.string().max(50),
});

export const HabitSchema = z.object({
  id: z.string().max(100),
  name: safeString(200),
  category: HabitCategorySchema,
  frequency: HabitFrequencySchema,
  customDays: z.array(z.number().min(0).max(6)).optional(),
  createdOn: z.string().max(20),
  startDate: z.string().max(20).optional(),
  completedDates: z.array(z.string().max(20)),
  archived: z.boolean().optional(),
  reminder: HabitReminderSchema,
  freezes: z.record(z.string().max(20), HabitFreezeSchema).optional(),
  timesPerDay: z.number().min(1).max(10).optional(),
  progress: z.record(z.string().max(20), z.number().min(0).max(10)).optional(),
});

export const HabitsArraySchema = z.array(HabitSchema);

// User profile validation schema
const ThemeColorSchema = z.enum([
  'indigo', 'violet', 'blue', 'cyan', 'emerald', 'amber', 'rose', 'slate'
]);

export const UserProfileSchema = z.object({
  name: safeString(100),
  themeColor: ThemeColorSchema,
  onboardingCompleted: z.boolean(),
  xp: z.number().min(0).max(1000000),
  level: z.number().min(1).max(100),
  unlockedAchievements: z.array(z.string().max(50)),
  weightKg: z.number().min(20).max(500).optional(),
  heightCm: z.number().min(80).max(260).optional(),
  age: z.number().min(5).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very']).optional(),
  weightGoal: z.enum(['lose', 'maintain', 'gain']).optional(),
});

// App settings validation schema
const AppModeSchema = z.enum(['normal', 'ghost']);
const NotificationPermissionSchema = z.enum(['default', 'granted', 'denied']);

export const AppSettingsSchema = z.object({
  mode: AppModeSchema,
  showXP: z.boolean(),
  showNotifications: z.boolean(),
  notificationPermission: NotificationPermissionSchema,
});

// Water tracker validation schema
export const WaterDataSchema = z.object({
  dailyGoal: z.number().min(0).max(10000),
  intake: z.record(z.string(), z.number().min(0).max(50000)),
});

// XP log validation schema
export const XPLogSchema = z.object({
  total: z.number().min(0).max(1000000),
  log: z.record(z.string(), z.array(z.string().max(100))),
  lastEvaluatedDate: z.string().max(20).optional(),
});

// Import data validation schema
export const ImportDataSchema = z.object({
  habits: HabitsArraySchema,
  exportedAt: z.string().optional(),
});

// Helper function for safe JSON parsing with validation
export function safeParseJSON<T>(
  jsonString: string | null,
  schema: z.ZodSchema<T>,
  defaultValue: T
): T {
  if (!jsonString) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(jsonString);
    const result = schema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    } else {
      if (import.meta.env.DEV) {
        console.error('Validation failed:', result.error.issues);
      }
      return defaultValue;
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('JSON parse error:', e);
    }
    return defaultValue;
  }
}

// Helper for partial schema validation (merges with defaults)
export function safeParseJSONWithDefaults<T extends object>(
  jsonString: string | null,
  schema: z.ZodSchema<Partial<T>>,
  defaultValue: T
): T {
  if (!jsonString) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(jsonString);
    // Create a partial schema for loose validation
    const result = schema.safeParse(parsed);
    
    if (result.success) {
      return { ...defaultValue, ...result.data };
    } else {
      if (import.meta.env.DEV) {
        console.error('Validation failed:', result.error.issues);
      }
      return defaultValue;
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('JSON parse error:', e);
    }
    return defaultValue;
  }
}
