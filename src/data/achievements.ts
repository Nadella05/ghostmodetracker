import { Achievement } from '@/types/habit';

export const ACHIEVEMENTS: Achievement[] = [
  // ═══════════════════════════════════════════════
  // COMPLETION MILESTONES (25 achievements)
  // ═══════════════════════════════════════════════
  { id: 'first_habit', name: 'First Step', description: 'Complete your first habit', icon: '🎯', xpReward: 10, condition: (s) => s.totalCompletions >= 1 },
  { id: 'five_completions', name: 'Getting Going', description: 'Complete 5 habits total', icon: '✅', xpReward: 15, condition: (s) => s.totalCompletions >= 5 },
  { id: 'week_warrior', name: 'Week Warrior', description: 'Complete 7 habits total', icon: '🗓️', xpReward: 25, condition: (s) => s.totalCompletions >= 7 },
  { id: 'ten_completions', name: 'Double Digits', description: 'Complete 10 habits', icon: '🔟', xpReward: 20, condition: (s) => s.totalCompletions >= 10 },
  { id: 'twenty_completions', name: 'Score!', description: 'Complete 20 habits', icon: '🏀', xpReward: 30, condition: (s) => s.totalCompletions >= 20 },
  { id: 'thirty_completions', name: 'Thirty & Thriving', description: 'Complete 30 habits', icon: '🌻', xpReward: 35, condition: (s) => s.totalCompletions >= 30 },
  { id: 'half_century', name: 'Halfway There', description: 'Complete 50 habits', icon: '🌟', xpReward: 50, condition: (s) => s.totalCompletions >= 50 },
  { id: 'seventy_five', name: 'Three Quarters', description: 'Complete 75 habits', icon: '🎗️', xpReward: 60, condition: (s) => s.totalCompletions >= 75 },
  { id: 'century', name: 'Century Club', description: 'Complete 100 habits', icon: '💯', xpReward: 100, condition: (s) => s.totalCompletions >= 100 },
  { id: 'one_fifty', name: 'Unstoppable Force', description: 'Complete 150 habits', icon: '💨', xpReward: 120, condition: (s) => s.totalCompletions >= 150 },
  { id: 'double_century', name: 'Double Century', description: 'Complete 200 habits', icon: '🎖️', xpReward: 150, condition: (s) => s.totalCompletions >= 200 },
  { id: 'two_fifty', name: 'Quarter Thousand', description: 'Complete 250 habits', icon: '🎪', xpReward: 175, condition: (s) => s.totalCompletions >= 250 },
  { id: 'three_hundred', name: 'Spartan', description: 'Complete 300 habits', icon: '🛡️', xpReward: 200, condition: (s) => s.totalCompletions >= 300 },
  { id: 'four_hundred', name: 'Relentless', description: 'Complete 400 habits', icon: '⚡', xpReward: 250, condition: (s) => s.totalCompletions >= 400 },
  { id: 'habit_machine', name: 'Habit Machine', description: 'Complete 500 habits', icon: '🤖', xpReward: 300, condition: (s) => s.totalCompletions >= 500 },
  { id: 'six_hundred', name: 'Six Hundred Strong', description: 'Complete 600 habits', icon: '💎', xpReward: 350, condition: (s) => s.totalCompletions >= 600 },
  { id: 'seven_fifty', name: 'Diamond Grind', description: 'Complete 750 habits', icon: '🏔️', xpReward: 400, condition: (s) => s.totalCompletions >= 750 },
  { id: 'thousand_club', name: 'Thousand Club', description: 'Complete 1000 habits', icon: '🏅', xpReward: 500, condition: (s) => s.totalCompletions >= 1000 },
  { id: 'fifteen_hundred', name: 'Iron Will', description: 'Complete 1500 habits', icon: '🔩', xpReward: 600, condition: (s) => s.totalCompletions >= 1500 },
  { id: 'two_thousand', name: 'Two Thousand!', description: 'Complete 2000 habits', icon: '🚀', xpReward: 750, condition: (s) => s.totalCompletions >= 2000 },
  { id: 'twenty_five_hundred', name: 'Titan', description: 'Complete 2500 habits', icon: '🏛️', xpReward: 850, condition: (s) => s.totalCompletions >= 2500 },
  { id: 'three_thousand', name: 'Habit God', description: 'Complete 3000 habits', icon: '👼', xpReward: 1000, condition: (s) => s.totalCompletions >= 3000 },
  { id: 'four_thousand', name: 'Immortal', description: 'Complete 4000 habits', icon: '♾️', xpReward: 1200, condition: (s) => s.totalCompletions >= 4000 },
  { id: 'five_thousand', name: 'Transcendent', description: 'Complete 5000 habits', icon: '🌌', xpReward: 1500, condition: (s) => s.totalCompletions >= 5000 },
  { id: 'ten_thousand', name: 'Ten Thousand Hours', description: 'Complete 10000 habits', icon: '🧬', xpReward: 3000, condition: (s) => s.totalCompletions >= 10000 },

  // ═══════════════════════════════════════════════
  // STREAK ACHIEVEMENTS (30 achievements)
  // ═══════════════════════════════════════════════
  { id: 'streak_2', name: 'Two in a Row', description: 'Reach a 2-day streak', icon: '🔥', xpReward: 5, condition: (s) => s.longestStreak >= 2 },
  { id: 'streak_starter', name: 'Streak Starter', description: 'Reach a 3-day streak', icon: '🔥', xpReward: 15, condition: (s) => s.longestStreak >= 3 },
  { id: 'streak_5', name: 'Five Alive', description: 'Reach a 5-day streak', icon: '🔥', xpReward: 25, condition: (s) => s.longestStreak >= 5 },
  { id: 'streak_master', name: 'Streak Master', description: 'Reach a 7-day streak', icon: '🔥', xpReward: 50, condition: (s) => s.longestStreak >= 7 },
  { id: 'streak_10', name: 'Ten Day Terror', description: 'Reach a 10-day streak', icon: '💥', xpReward: 60, condition: (s) => s.longestStreak >= 10 },
  { id: 'two_week_warrior', name: 'Two Week Warrior', description: 'Reach a 14-day streak', icon: '⚡', xpReward: 75, condition: (s) => s.longestStreak >= 14 },
  { id: 'streak_21', name: 'Habit Formed', description: 'Reach a 21-day streak (habits take 21 days!)', icon: '🧠', xpReward: 100, condition: (s) => s.longestStreak >= 21 },
  { id: 'streak_25', name: 'Quarter Hundred', description: 'Reach a 25-day streak', icon: '🌊', xpReward: 110, condition: (s) => s.longestStreak >= 25 },
  { id: 'month_master', name: 'Month Master', description: 'Reach a 30-day streak', icon: '📅', xpReward: 150, condition: (s) => s.longestStreak >= 30 },
  { id: 'streak_40', name: 'Forty Days', description: 'Reach a 40-day streak', icon: '🏜️', xpReward: 175, condition: (s) => s.longestStreak >= 40 },
  { id: 'streak_50', name: 'Half Century Streak', description: 'Reach a 50-day streak', icon: '🎯', xpReward: 200, condition: (s) => s.longestStreak >= 50 },
  { id: 'sixty_day_streak', name: 'Unstoppable', description: 'Reach a 60-day streak', icon: '💪', xpReward: 250, condition: (s) => s.longestStreak >= 60 },
  { id: 'streak_66', name: 'Automatic', description: '66-day streak (science says it\'s automatic now!)', icon: '🤖', xpReward: 275, condition: (s) => s.longestStreak >= 66 },
  { id: 'streak_75', name: '75 Hard', description: 'Reach a 75-day streak', icon: '🏋️', xpReward: 300, condition: (s) => s.longestStreak >= 75 },
  { id: 'ninety_day_streak', name: 'Habit Hero', description: 'Reach a 90-day streak', icon: '🦸', xpReward: 400, condition: (s) => s.longestStreak >= 90 },
  { id: 'streak_100', name: 'Century Streak', description: 'Reach a 100-day streak', icon: '💯', xpReward: 450, condition: (s) => s.longestStreak >= 100 },
  { id: 'streak_120', name: 'Four Months Strong', description: 'Reach a 120-day streak', icon: '🔒', xpReward: 500, condition: (s) => s.longestStreak >= 120 },
  { id: 'streak_150', name: 'Iron Streak', description: 'Reach a 150-day streak', icon: '⛓️', xpReward: 550, condition: (s) => s.longestStreak >= 150 },
  { id: 'streak_180', name: 'Half Year Streak', description: 'Reach a 180-day streak', icon: '🌗', xpReward: 600, condition: (s) => s.longestStreak >= 180 },
  { id: 'streak_200', name: 'Bicentennial Streak', description: 'Reach a 200-day streak', icon: '🗽', xpReward: 700, condition: (s) => s.longestStreak >= 200 },
  { id: 'streak_250', name: 'Streak Legend', description: 'Reach a 250-day streak', icon: '🐉', xpReward: 800, condition: (s) => s.longestStreak >= 250 },
  { id: 'streak_300', name: 'Streak Titan', description: 'Reach a 300-day streak', icon: '⚔️', xpReward: 900, condition: (s) => s.longestStreak >= 300 },
  { id: 'year_streak', name: 'Year of Discipline', description: 'Reach a 365-day streak', icon: '🏆', xpReward: 1000, condition: (s) => s.longestStreak >= 365 },
  { id: 'streak_400', name: 'Beyond the Year', description: 'Reach a 400-day streak', icon: '🌠', xpReward: 1100, condition: (s) => s.longestStreak >= 400 },
  { id: 'streak_500', name: 'Five Hundred Days', description: 'Reach a 500-day streak', icon: '🛸', xpReward: 1300, condition: (s) => s.longestStreak >= 500 },
  { id: 'streak_600', name: 'Streak Immortal', description: 'Reach a 600-day streak', icon: '🌅', xpReward: 1500, condition: (s) => s.longestStreak >= 600 },
  { id: 'streak_730', name: 'Two Year Streak', description: 'Reach a 730-day streak', icon: '👑', xpReward: 2000, condition: (s) => s.longestStreak >= 730 },
  { id: 'streak_1000', name: 'Millennium Streak', description: 'Reach a 1000-day streak', icon: '🔱', xpReward: 3000, condition: (s) => s.longestStreak >= 1000 },
  { id: 'streak_1500', name: 'Streak Deity', description: 'Reach a 1500-day streak', icon: '🌟', xpReward: 4000, condition: (s) => s.longestStreak >= 1500 },
  { id: 'streak_2000', name: 'Eternal Flame', description: 'Reach a 2000-day streak', icon: '🔥', xpReward: 5000, condition: (s) => s.longestStreak >= 2000 },

  // ═══════════════════════════════════════════════
  // CURRENT STREAK (15 achievements)
  // ═══════════════════════════════════════════════
  { id: 'current_3', name: 'Rolling', description: 'Have a current streak of 3', icon: '🎲', xpReward: 10, condition: (s) => s.currentStreak >= 3 },
  { id: 'current_7', name: 'On Fire This Week', description: 'Have a current streak of 7', icon: '🔥', xpReward: 30, condition: (s) => s.currentStreak >= 7 },
  { id: 'current_14', name: 'Fortnight Fury', description: 'Have a current streak of 14', icon: '⚡', xpReward: 50, condition: (s) => s.currentStreak >= 14 },
  { id: 'current_21', name: 'Three Week Blaze', description: 'Have a current streak of 21', icon: '🌋', xpReward: 75, condition: (s) => s.currentStreak >= 21 },
  { id: 'current_30', name: 'Monthly Momentum', description: 'Have a current streak of 30', icon: '🚂', xpReward: 100, condition: (s) => s.currentStreak >= 30 },
  { id: 'current_45', name: 'Six Weeks Strong', description: 'Have a current streak of 45', icon: '💎', xpReward: 150, condition: (s) => s.currentStreak >= 45 },
  { id: 'current_60', name: 'Two Month Fire', description: 'Have a current streak of 60', icon: '🌪️', xpReward: 200, condition: (s) => s.currentStreak >= 60 },
  { id: 'current_90', name: 'Quarter Year Active', description: 'Have a current streak of 90', icon: '🏰', xpReward: 300, condition: (s) => s.currentStreak >= 90 },
  { id: 'current_120', name: 'Season Champion', description: 'Have a current streak of 120', icon: '🌸', xpReward: 400, condition: (s) => s.currentStreak >= 120 },
  { id: 'current_150', name: 'Five Months Running', description: 'Have a current streak of 150', icon: '🏃', xpReward: 500, condition: (s) => s.currentStreak >= 150 },
  { id: 'current_180', name: 'Half Year Warrior', description: 'Have a current streak of 180', icon: '⚔️', xpReward: 600, condition: (s) => s.currentStreak >= 180 },
  { id: 'current_270', name: 'Three Quarter Year', description: 'Have a current streak of 270', icon: '🌍', xpReward: 800, condition: (s) => s.currentStreak >= 270 },
  { id: 'current_365', name: 'Full Year Active', description: 'Have a current streak of 365', icon: '🎆', xpReward: 1000, condition: (s) => s.currentStreak >= 365 },
  { id: 'current_500', name: 'Legendary Active Streak', description: 'Have a current streak of 500', icon: '🐲', xpReward: 1500, condition: (s) => s.currentStreak >= 500 },
  { id: 'current_730', name: 'Two Year Active Streak', description: 'Have a current streak of 730', icon: '🦅', xpReward: 2500, condition: (s) => s.currentStreak >= 730 },

  // ═══════════════════════════════════════════════
  // HABIT CREATION (20 achievements)
  // ═══════════════════════════════════════════════
  { id: 'first_creation', name: 'Creator', description: 'Create your first habit', icon: '✨', xpReward: 5, condition: (s) => s.totalHabits >= 1 },
  { id: 'two_habits', name: 'Double Trouble', description: 'Create 2 habits', icon: '✌️', xpReward: 10, condition: (s) => s.totalHabits >= 2 },
  { id: 'habit_collector', name: 'Habit Collector', description: 'Create 3 habits', icon: '📦', xpReward: 20, condition: (s) => s.totalHabits >= 3 },
  { id: 'habit_enthusiast', name: 'Habit Enthusiast', description: 'Create 5 habits', icon: '📚', xpReward: 35, condition: (s) => s.totalHabits >= 5 },
  { id: 'lucky_seven', name: 'Lucky Seven', description: 'Create 7 habits', icon: '🍀', xpReward: 45, condition: (s) => s.totalHabits >= 7 },
  { id: 'habit_architect', name: 'Habit Architect', description: 'Create 10 habits', icon: '🏗️', xpReward: 75, condition: (s) => s.totalHabits >= 10 },
  { id: 'dozen_habits', name: 'Baker\'s Dozen', description: 'Create 12 habits', icon: '🍩', xpReward: 85, condition: (s) => s.totalHabits >= 12 },
  { id: 'lifestyle_designer', name: 'Lifestyle Designer', description: 'Create 15 habits', icon: '🎨', xpReward: 100, condition: (s) => s.totalHabits >= 15 },
  { id: 'twenty_habits', name: 'Prolific Planner', description: 'Create 20 habits', icon: '📋', xpReward: 125, condition: (s) => s.totalHabits >= 20 },
  { id: 'twenty_five_habits', name: 'Habit Hoarding', description: 'Create 25 habits', icon: '🗃️', xpReward: 150, condition: (s) => s.totalHabits >= 25 },
  { id: 'thirty_habits', name: 'Life Overhaul', description: 'Create 30 habits', icon: '🔄', xpReward: 175, condition: (s) => s.totalHabits >= 30 },
  { id: 'forty_habits', name: 'System Builder', description: 'Create 40 habits', icon: '⚙️', xpReward: 200, condition: (s) => s.totalHabits >= 40 },
  { id: 'fifty_habits', name: 'Habit Encyclopedia', description: 'Create 50 habits', icon: '📖', xpReward: 250, condition: (s) => s.totalHabits >= 50 },
  { id: 'sixty_habits', name: 'Routine Master', description: 'Create 60 habits', icon: '🎓', xpReward: 300, condition: (s) => s.totalHabits >= 60 },
  { id: 'seventy_five_habits', name: 'Diamond Planner', description: 'Create 75 habits', icon: '💎', xpReward: 350, condition: (s) => s.totalHabits >= 75 },
  { id: 'hundred_habits', name: 'Centurion Creator', description: 'Create 100 habits', icon: '🏛️', xpReward: 500, condition: (s) => s.totalHabits >= 100 },
  { id: 'one_fifty_habits', name: 'Legendary Planner', description: 'Create 150 habits', icon: '📜', xpReward: 700, condition: (s) => s.totalHabits >= 150 },
  { id: 'two_hundred_habits', name: 'Habit Library', description: 'Create 200 habits', icon: '🏫', xpReward: 900, condition: (s) => s.totalHabits >= 200 },
  { id: 'three_hundred_habits', name: 'Master Architect', description: 'Create 300 habits', icon: '🏰', xpReward: 1200, condition: (s) => s.totalHabits >= 300 },
  { id: 'five_hundred_habits', name: 'Infinite Planner', description: 'Create 500 habits', icon: '♾️', xpReward: 2000, condition: (s) => s.totalHabits >= 500 },

  // ═══════════════════════════════════════════════
  // PERFECT DAYS (25 achievements)
  // ═══════════════════════════════════════════════
  { id: 'perfect_day', name: 'Perfect Day', description: 'Complete all habits in a day', icon: '⭐', xpReward: 25, condition: (s) => s.perfectDays >= 1 },
  { id: 'perfect_2', name: 'Two Perfect Days', description: 'Have 2 perfect days', icon: '✨', xpReward: 30, condition: (s) => s.perfectDays >= 2 },
  { id: 'perfect_3', name: 'Hat Trick', description: 'Have 3 perfect days', icon: '🎩', xpReward: 35, condition: (s) => s.perfectDays >= 3 },
  { id: 'perfect_5', name: 'High Five', description: 'Have 5 perfect days', icon: '🖐️', xpReward: 45, condition: (s) => s.perfectDays >= 5 },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Have 7 perfect days', icon: '🌈', xpReward: 75, condition: (s) => s.perfectDays >= 7 },
  { id: 'perfect_10', name: 'Ten Out of Ten', description: 'Have 10 perfect days', icon: '🎯', xpReward: 100, condition: (s) => s.perfectDays >= 10 },
  { id: 'perfect_14', name: 'Fortnight Perfection', description: 'Have 14 perfect days', icon: '🏅', xpReward: 125, condition: (s) => s.perfectDays >= 14 },
  { id: 'perfect_20', name: 'Twenty Perfects', description: 'Have 20 perfect days', icon: '🌟', xpReward: 150, condition: (s) => s.perfectDays >= 20 },
  { id: 'perfect_25', name: 'Quarter Century Perfect', description: 'Have 25 perfect days', icon: '💫', xpReward: 175, condition: (s) => s.perfectDays >= 25 },
  { id: 'perfect_month', name: 'Perfect Month', description: 'Have 30 perfect days', icon: '🌙', xpReward: 200, condition: (s) => s.perfectDays >= 30 },
  { id: 'perfect_40', name: 'Forty Flawless', description: 'Have 40 perfect days', icon: '🔶', xpReward: 250, condition: (s) => s.perfectDays >= 40 },
  { id: 'perfect_50', name: 'Fifty & Flawless', description: 'Have 50 perfect days', icon: '💎', xpReward: 300, condition: (s) => s.perfectDays >= 50 },
  { id: 'perfect_60', name: 'Sixty Stellar Days', description: 'Have 60 perfect days', icon: '🌠', xpReward: 350, condition: (s) => s.perfectDays >= 60 },
  { id: 'perfect_75', name: 'Diamond Standard', description: 'Have 75 perfect days', icon: '💠', xpReward: 400, condition: (s) => s.perfectDays >= 75 },
  { id: 'perfect_90', name: 'Quarter Year Perfect', description: 'Have 90 perfect days', icon: '🏰', xpReward: 500, condition: (s) => s.perfectDays >= 90 },
  { id: 'perfect_100', name: 'Century of Perfection', description: 'Have 100 perfect days', icon: '💯', xpReward: 600, condition: (s) => s.perfectDays >= 100 },
  { id: 'perfect_120', name: 'Platinum Perfection', description: 'Have 120 perfect days', icon: '🔘', xpReward: 700, condition: (s) => s.perfectDays >= 120 },
  { id: 'perfect_150', name: 'Five Months Flawless', description: 'Have 150 perfect days', icon: '🏆', xpReward: 800, condition: (s) => s.perfectDays >= 150 },
  { id: 'perfect_180', name: 'Half Year Perfection', description: 'Have 180 perfect days', icon: '🌗', xpReward: 900, condition: (s) => s.perfectDays >= 180 },
  { id: 'perfect_200', name: 'Two Hundred Flawless', description: 'Have 200 perfect days', icon: '🗻', xpReward: 1000, condition: (s) => s.perfectDays >= 200 },
  { id: 'perfect_250', name: 'Perfection Incarnate', description: 'Have 250 perfect days', icon: '👼', xpReward: 1200, condition: (s) => s.perfectDays >= 250 },
  { id: 'perfect_300', name: 'Flawless Legend', description: 'Have 300 perfect days', icon: '🐉', xpReward: 1500, condition: (s) => s.perfectDays >= 300 },
  { id: 'perfect_365', name: 'Year of Perfection', description: 'Have 365 perfect days', icon: '🎆', xpReward: 2000, condition: (s) => s.perfectDays >= 365 },
  { id: 'perfect_500', name: 'Perfection God', description: 'Have 500 perfect days', icon: '🌌', xpReward: 3000, condition: (s) => s.perfectDays >= 500 },
  { id: 'perfect_1000', name: 'Thousand Perfect Days', description: 'Have 1000 perfect days', icon: '🧬', xpReward: 5000, condition: (s) => s.perfectDays >= 1000 },

  // ═══════════════════════════════════════════════
  // DAYS ACTIVE (25 achievements)
  // ═══════════════════════════════════════════════
  { id: 'active_1', name: 'Day One', description: 'Be active for 1 day', icon: '🌱', xpReward: 5, condition: (s) => s.daysActive >= 1 },
  { id: 'active_3', name: 'Three Day Start', description: 'Be active for 3 days', icon: '🌿', xpReward: 10, condition: (s) => s.daysActive >= 3 },
  { id: 'active_5', name: 'Five Day Groove', description: 'Be active for 5 days', icon: '🌾', xpReward: 15, condition: (s) => s.daysActive >= 5 },
  { id: 'one_week_active', name: 'Getting Started', description: 'Be active for 7 days', icon: '🌱', xpReward: 30, condition: (s) => s.daysActive >= 7 },
  { id: 'active_10', name: 'Ten Days In', description: 'Be active for 10 days', icon: '🌻', xpReward: 40, condition: (s) => s.daysActive >= 10 },
  { id: 'active_14', name: 'Two Weeks Active', description: 'Be active for 14 days', icon: '🌴', xpReward: 50, condition: (s) => s.daysActive >= 14 },
  { id: 'active_21', name: 'Three Weeks Strong', description: 'Be active for 21 days', icon: '🎋', xpReward: 65, condition: (s) => s.daysActive >= 21 },
  { id: 'one_month_active', name: 'Committed', description: 'Be active for 30 days', icon: '🌿', xpReward: 100, condition: (s) => s.daysActive >= 30 },
  { id: 'active_45', name: 'Six Weeks Active', description: 'Be active for 45 days', icon: '🌲', xpReward: 125, condition: (s) => s.daysActive >= 45 },
  { id: 'active_60', name: 'Two Months In', description: 'Be active for 60 days', icon: '🏕️', xpReward: 150, condition: (s) => s.daysActive >= 60 },
  { id: 'three_months_active', name: 'Dedicated User', description: 'Be active for 90 days', icon: '🌳', xpReward: 250, condition: (s) => s.daysActive >= 90 },
  { id: 'active_100', name: 'Triple Digit Active', description: 'Be active for 100 days', icon: '💯', xpReward: 300, condition: (s) => s.daysActive >= 100 },
  { id: 'active_120', name: 'Four Months Active', description: 'Be active for 120 days', icon: '🍂', xpReward: 350, condition: (s) => s.daysActive >= 120 },
  { id: 'active_150', name: 'Five Months Active', description: 'Be active for 150 days', icon: '❄️', xpReward: 375, condition: (s) => s.daysActive >= 150 },
  { id: 'six_months_active', name: 'Habit Veteran', description: 'Be active for 180 days', icon: '🏔️', xpReward: 400, condition: (s) => s.daysActive >= 180 },
  { id: 'active_200', name: 'Two Hundred Days', description: 'Be active for 200 days', icon: '🌍', xpReward: 450, condition: (s) => s.daysActive >= 200 },
  { id: 'active_250', name: 'Quarter Thousand Active', description: 'Be active for 250 days', icon: '🗺️', xpReward: 500, condition: (s) => s.daysActive >= 250 },
  { id: 'active_300', name: 'Three Hundred Active', description: 'Be active for 300 days', icon: '🏞️', xpReward: 600, condition: (s) => s.daysActive >= 300 },
  { id: 'one_year_active', name: 'Year Strong', description: 'Be active for 365 days', icon: '🎂', xpReward: 750, condition: (s) => s.daysActive >= 365 },
  { id: 'active_400', name: 'Four Hundred Active', description: 'Be active for 400 days', icon: '🌅', xpReward: 800, condition: (s) => s.daysActive >= 400 },
  { id: 'active_500', name: 'Five Hundred Active', description: 'Be active for 500 days', icon: '🧭', xpReward: 1000, condition: (s) => s.daysActive >= 500 },
  { id: 'active_600', name: 'Six Hundred Active', description: 'Be active for 600 days', icon: '🏖️', xpReward: 1200, condition: (s) => s.daysActive >= 600 },
  { id: 'active_730', name: 'Two Year Veteran', description: 'Be active for 730 days', icon: '🎊', xpReward: 1500, condition: (s) => s.daysActive >= 730 },
  { id: 'active_1000', name: 'Thousand Day Legend', description: 'Be active for 1000 days', icon: '🏛️', xpReward: 2000, condition: (s) => s.daysActive >= 1000 },
  { id: 'active_1500', name: 'Eternal User', description: 'Be active for 1500 days', icon: '♾️', xpReward: 3000, condition: (s) => s.daysActive >= 1500 },

  // ═══════════════════════════════════════════════
  // LEVEL ACHIEVEMENTS (20 achievements)
  // ═══════════════════════════════════════════════
  { id: 'level_2', name: 'Level Up!', description: 'Reach level 2', icon: '⬆️', xpReward: 10, condition: (s) => s.level >= 2 },
  { id: 'level_3', name: 'Apprentice', description: 'Reach level 3', icon: '🌿', xpReward: 25, condition: (s) => s.level >= 3 },
  { id: 'level_4', name: 'Consistent', description: 'Reach level 4', icon: '⭐', xpReward: 35, condition: (s) => s.level >= 4 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '🌟', xpReward: 50, condition: (s) => s.level >= 5 },
  { id: 'level_6', name: 'Disciplined', description: 'Reach level 6', icon: '💪', xpReward: 75, condition: (s) => s.level >= 6 },
  { id: 'level_7', name: 'Champion', description: 'Reach level 7', icon: '🏆', xpReward: 100, condition: (s) => s.level >= 7 },
  { id: 'level_8', name: 'Elite', description: 'Reach level 8', icon: '👑', xpReward: 125, condition: (s) => s.level >= 8 },
  { id: 'level_9', name: 'Master', description: 'Reach level 9', icon: '🔮', xpReward: 150, condition: (s) => s.level >= 9 },
  { id: 'level_10', name: 'Legend Status', description: 'Reach level 10', icon: '👑', xpReward: 200, condition: (s) => s.level >= 10 },
  { id: 'level_12', name: 'Ascended', description: 'Reach level 12', icon: '🌠', xpReward: 250, condition: (s) => s.level >= 12 },
  { id: 'level_15', name: 'Transcended', description: 'Reach level 15', icon: '🔥', xpReward: 350, condition: (s) => s.level >= 15 },
  { id: 'level_18', name: 'Mythical', description: 'Reach level 18', icon: '🐉', xpReward: 450, condition: (s) => s.level >= 18 },
  { id: 'level_20', name: 'Legendary', description: 'Reach level 20', icon: '⚜️', xpReward: 500, condition: (s) => s.level >= 20 },
  { id: 'level_25', name: 'Demigod', description: 'Reach level 25', icon: '🏛️', xpReward: 750, condition: (s) => s.level >= 25 },
  { id: 'level_30', name: 'Olympian', description: 'Reach level 30', icon: '🏔️', xpReward: 1000, condition: (s) => s.level >= 30 },
  { id: 'level_35', name: 'Ethereal', description: 'Reach level 35', icon: '✨', xpReward: 1200, condition: (s) => s.level >= 35 },
  { id: 'level_40', name: 'Celestial', description: 'Reach level 40', icon: '🌌', xpReward: 1500, condition: (s) => s.level >= 40 },
  { id: 'level_45', name: 'Cosmic', description: 'Reach level 45', icon: '🪐', xpReward: 1800, condition: (s) => s.level >= 45 },
  { id: 'level_50', name: 'Galactic', description: 'Reach level 50', icon: '🌀', xpReward: 2000, condition: (s) => s.level >= 50 },
  { id: 'level_100', name: 'Universal', description: 'Reach level 100', icon: '🧬', xpReward: 5000, condition: (s) => s.level >= 100 },

  // ═══════════════════════════════════════════════
  // EARLY MILESTONES / MOTIVATION (15 achievements)
  // ═══════════════════════════════════════════════
  { id: 'early_bird', name: 'Early Bird', description: 'Complete 10 habits before noon', icon: '🌅', xpReward: 40, condition: (s) => s.totalCompletions >= 10 },
  { id: 'comeback_kid', name: 'Comeback Kid', description: 'Return after a break and complete a habit', icon: '🔄', xpReward: 30, condition: (s) => s.totalCompletions >= 1 },
  { id: 'warm_up', name: 'Warm Up', description: 'Complete 3 habits in total', icon: '🏃', xpReward: 8, condition: (s) => s.totalCompletions >= 3 },
  { id: 'building_momentum', name: 'Building Momentum', description: 'Complete 15 habits', icon: '🚀', xpReward: 25, condition: (s) => s.totalCompletions >= 15 },
  { id: 'quarter_century_done', name: 'Quarter Century', description: 'Complete 25 habits', icon: '🎉', xpReward: 35, condition: (s) => s.totalCompletions >= 25 },
  { id: 'forty_done', name: 'Forty & Fabulous', description: 'Complete 40 habits', icon: '🎭', xpReward: 40, condition: (s) => s.totalCompletions >= 40 },
  { id: 'sixty_done', name: 'Sixty Solid', description: 'Complete 60 habits', icon: '🎪', xpReward: 55, condition: (s) => s.totalCompletions >= 60 },
  { id: 'eighty_done', name: 'Eighty Strong', description: 'Complete 80 habits', icon: '🏋️', xpReward: 70, condition: (s) => s.totalCompletions >= 80 },
  { id: 'ninety_done', name: 'Almost There!', description: 'Complete 90 habits', icon: '🎗️', xpReward: 80, condition: (s) => s.totalCompletions >= 90 },
  { id: 'one_twenty_five', name: 'Surge', description: 'Complete 125 habits', icon: '⚡', xpReward: 110, condition: (s) => s.totalCompletions >= 125 },
  { id: 'one_seventy_five', name: 'Almost Double Century', description: 'Complete 175 habits', icon: '🎯', xpReward: 130, condition: (s) => s.totalCompletions >= 175 },
  { id: 'two_twenty_five', name: 'Overachiever', description: 'Complete 225 habits', icon: '🏆', xpReward: 160, condition: (s) => s.totalCompletions >= 225 },
  { id: 'two_seventy_five', name: 'Powerhouse', description: 'Complete 275 habits', icon: '🔋', xpReward: 185, condition: (s) => s.totalCompletions >= 275 },
  { id: 'three_fifty', name: 'Triple Fifty', description: 'Complete 350 habits', icon: '🎖️', xpReward: 225, condition: (s) => s.totalCompletions >= 350 },
  { id: 'four_fifty', name: 'Almost Five Hundred', description: 'Complete 450 habits', icon: '🎯', xpReward: 275, condition: (s) => s.totalCompletions >= 450 },

  // ═══════════════════════════════════════════════
  // MEGA COMPLETIONS (15 achievements)
  // ═══════════════════════════════════════════════
  { id: 'five_fifty', name: 'Five Fifty', description: 'Complete 550 habits', icon: '🔥', xpReward: 325, condition: (s) => s.totalCompletions >= 550 },
  { id: 'six_fifty', name: 'Six Fifty', description: 'Complete 650 habits', icon: '🌊', xpReward: 375, condition: (s) => s.totalCompletions >= 650 },
  { id: 'eight_hundred', name: 'Eight Hundred', description: 'Complete 800 habits', icon: '🎆', xpReward: 425, condition: (s) => s.totalCompletions >= 800 },
  { id: 'nine_hundred', name: 'Nine Hundred', description: 'Complete 900 habits', icon: '🛡️', xpReward: 475, condition: (s) => s.totalCompletions >= 900 },
  { id: 'twelve_hundred', name: 'Twelve Hundred', description: 'Complete 1200 habits', icon: '🗡️', xpReward: 550, condition: (s) => s.totalCompletions >= 1200 },
  { id: 'fifteen_hundred_done', name: 'Fifteen Hundred', description: 'Complete 1500 habits', icon: '⚡', xpReward: 650, condition: (s) => s.totalCompletions >= 1500 },
  { id: 'seventeen_fifty', name: 'Almost Two K', description: 'Complete 1750 habits', icon: '🚀', xpReward: 700, condition: (s) => s.totalCompletions >= 1750 },
  { id: 'twenty_five_hundred_done', name: 'Two Point Five K', description: 'Complete 2500 habits', icon: '🎊', xpReward: 850, condition: (s) => s.totalCompletions >= 2500 },
  { id: 'three_thousand_done', name: 'Three K Club', description: 'Complete 3000 habits', icon: '🏟️', xpReward: 1000, condition: (s) => s.totalCompletions >= 3000 },
  { id: 'thirty_five_hundred', name: 'Thirty-Five Hundred', description: 'Complete 3500 habits', icon: '🔱', xpReward: 1100, condition: (s) => s.totalCompletions >= 3500 },
  { id: 'four_thousand_done', name: 'Four Thousand', description: 'Complete 4000 habits', icon: '🏺', xpReward: 1250, condition: (s) => s.totalCompletions >= 4000 },
  { id: 'forty_five_hundred', name: 'Forty-Five Hundred', description: 'Complete 4500 habits', icon: '🪙', xpReward: 1400, condition: (s) => s.totalCompletions >= 4500 },
  { id: 'six_thousand', name: 'Six Thousand', description: 'Complete 6000 habits', icon: '🌋', xpReward: 1750, condition: (s) => s.totalCompletions >= 6000 },
  { id: 'seven_five_hundred', name: 'Seven Point Five K', description: 'Complete 7500 habits', icon: '☄️', xpReward: 2000, condition: (s) => s.totalCompletions >= 7500 },
  { id: 'fifteen_thousand', name: 'Fifteen Thousand', description: 'Complete 15000 habits', icon: '🌟', xpReward: 5000, condition: (s) => s.totalCompletions >= 15000 },

  // ═══════════════════════════════════════════════
  // XP MILESTONES (15 achievements - based on level)
  // ═══════════════════════════════════════════════
  { id: 'xp_50', name: 'First 50 XP', description: 'Earn 50 total XP (reach level 2)', icon: '🪙', xpReward: 10, condition: (s) => s.level >= 2 },
  { id: 'xp_milestone_3', name: 'Triple Threat', description: 'Reach level 3 milestone', icon: '🥉', xpReward: 20, condition: (s) => s.level >= 3 },
  { id: 'xp_milestone_5', name: 'Halfway to Ten', description: 'Reach level 5 milestone', icon: '🥈', xpReward: 40, condition: (s) => s.level >= 5 },
  { id: 'xp_milestone_8', name: 'Almost Max', description: 'Reach level 8 milestone', icon: '🥇', xpReward: 75, condition: (s) => s.level >= 8 },
  { id: 'xp_milestone_10', name: 'Max Level Original', description: 'Reach level 10 milestone', icon: '🏅', xpReward: 100, condition: (s) => s.level >= 10 },
  { id: 'xp_milestone_15', name: 'Beyond Max', description: 'Surpass original max level', icon: '🚀', xpReward: 200, condition: (s) => s.level >= 15 },
  { id: 'xp_milestone_20', name: 'Double Max', description: 'Reach level 20', icon: '💎', xpReward: 300, condition: (s) => s.level >= 20 },
  { id: 'xp_milestone_25', name: 'Quarter Century Level', description: 'Reach level 25', icon: '🔶', xpReward: 400, condition: (s) => s.level >= 25 },
  { id: 'xp_milestone_30', name: 'Level Thirty', description: 'Reach level 30', icon: '🔷', xpReward: 500, condition: (s) => s.level >= 30 },
  { id: 'xp_milestone_40', name: 'Level Forty', description: 'Reach level 40', icon: '🔸', xpReward: 750, condition: (s) => s.level >= 40 },
  { id: 'xp_milestone_50', name: 'Half Century Level', description: 'Reach level 50', icon: '🔹', xpReward: 1000, condition: (s) => s.level >= 50 },
  { id: 'xp_milestone_60', name: 'Level Sixty', description: 'Reach level 60', icon: '💠', xpReward: 1250, condition: (s) => s.level >= 60 },
  { id: 'xp_milestone_75', name: 'Diamond Level', description: 'Reach level 75', icon: '💎', xpReward: 1500, condition: (s) => s.level >= 75 },
  { id: 'xp_milestone_90', name: 'Ninety & Mighty', description: 'Reach level 90', icon: '🌠', xpReward: 2000, condition: (s) => s.level >= 90 },
  { id: 'xp_milestone_100', name: 'Ultimate Level', description: 'Reach level 100', icon: '🧬', xpReward: 5000, condition: (s) => s.level >= 100 },

  // ═══════════════════════════════════════════════
  // COMBINATION / MISC (20 achievements)
  // ═══════════════════════════════════════════════
  { id: 'balanced_start', name: 'Balanced Start', description: '3 habits and 3 perfect days', icon: '⚖️', xpReward: 30, condition: (s) => s.totalHabits >= 3 && s.perfectDays >= 3 },
  { id: 'dedicated_beginner', name: 'Dedicated Beginner', description: '5 habits and 7-day streak', icon: '🎓', xpReward: 50, condition: (s) => s.totalHabits >= 5 && s.longestStreak >= 7 },
  { id: 'committed_builder', name: 'Committed Builder', description: '10 habits and 14-day streak', icon: '🏗️', xpReward: 100, condition: (s) => s.totalHabits >= 10 && s.longestStreak >= 14 },
  { id: 'well_rounded', name: 'Well Rounded', description: '5 habits, 10 perfect days, 50 completions', icon: '🌍', xpReward: 75, condition: (s) => s.totalHabits >= 5 && s.perfectDays >= 10 && s.totalCompletions >= 50 },
  { id: 'power_user', name: 'Power User', description: '10 habits, 30 days active, 100 completions', icon: '⚡', xpReward: 150, condition: (s) => s.totalHabits >= 10 && s.daysActive >= 30 && s.totalCompletions >= 100 },
  { id: 'habit_master', name: 'Habit Master', description: '15 habits, 30-day streak, 200 completions', icon: '🎭', xpReward: 250, condition: (s) => s.totalHabits >= 15 && s.longestStreak >= 30 && s.totalCompletions >= 200 },
  { id: 'life_changer', name: 'Life Changer', description: '20 habits, 60-day streak, 500 completions', icon: '🦋', xpReward: 500, condition: (s) => s.totalHabits >= 20 && s.longestStreak >= 60 && s.totalCompletions >= 500 },
  { id: 'perfectionist', name: 'Perfectionist', description: '100 perfect days and 100 completions', icon: '👌', xpReward: 300, condition: (s) => s.perfectDays >= 100 && s.totalCompletions >= 100 },
  { id: 'iron_discipline', name: 'Iron Discipline', description: '90-day streak and 50 perfect days', icon: '🔩', xpReward: 350, condition: (s) => s.longestStreak >= 90 && s.perfectDays >= 50 },
  { id: 'ultimate_warrior', name: 'Ultimate Warrior', description: '365-day streak and 200 perfect days', icon: '⚔️', xpReward: 1000, condition: (s) => s.longestStreak >= 365 && s.perfectDays >= 200 },
  { id: 'grand_master', name: 'Grand Master', description: 'Level 10, 1000 completions, 100 perfect days', icon: '🏆', xpReward: 750, condition: (s) => s.level >= 10 && s.totalCompletions >= 1000 && s.perfectDays >= 100 },
  { id: 'legend_status', name: 'True Legend', description: 'Level 20, 2000 completions, 200 perfect days', icon: '👑', xpReward: 1500, condition: (s) => s.level >= 20 && s.totalCompletions >= 2000 && s.perfectDays >= 200 },
  { id: 'godlike', name: 'Godlike', description: 'Level 50, 5000 completions, 365 perfect days', icon: '🌟', xpReward: 5000, condition: (s) => s.level >= 50 && s.totalCompletions >= 5000 && s.perfectDays >= 365 },
  { id: 'first_week_combo', name: 'First Week Combo', description: '7 days active and 7 completions', icon: '🎯', xpReward: 20, condition: (s) => s.daysActive >= 7 && s.totalCompletions >= 7 },
  { id: 'month_combo', name: 'Monthly Combo', description: '30 days active and 30 completions', icon: '📅', xpReward: 75, condition: (s) => s.daysActive >= 30 && s.totalCompletions >= 30 },
  { id: 'century_combo', name: 'Century Combo', description: '100 days active and 100 completions', icon: '💯', xpReward: 200, condition: (s) => s.daysActive >= 100 && s.totalCompletions >= 100 },
  { id: 'year_combo', name: 'Year Combo', description: '365 days active and 365 completions', icon: '🎆', xpReward: 500, condition: (s) => s.daysActive >= 365 && s.totalCompletions >= 365 },
  { id: 'streak_and_habits', name: 'Streak & Variety', description: '14-day streak and 10 habits created', icon: '🌈', xpReward: 100, condition: (s) => s.longestStreak >= 14 && s.totalHabits >= 10 },
  { id: 'triple_crown', name: 'Triple Crown', description: '30-day streak, 30 perfect days, 30 days active', icon: '👑', xpReward: 200, condition: (s) => s.longestStreak >= 30 && s.perfectDays >= 30 && s.daysActive >= 30 },
  { id: 'ultimate_completionist', name: 'Ultimate Completionist', description: 'Unlock 100 other achievements', icon: '🌟', xpReward: 2000, condition: () => false }, // Special: checked manually
];

// Achievement categories for filtering in the UI
export type AchievementCategory = 'all' | 'completions' | 'streaks' | 'current_streak' | 'creation' | 'perfect_days' | 'days_active' | 'levels' | 'milestones' | 'combos';

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🏆' },
  { id: 'completions', label: 'Completions', icon: '✅' },
  { id: 'streaks', label: 'Streaks', icon: '🔥' },
  { id: 'current_streak', label: 'Active Streak', icon: '⚡' },
  { id: 'creation', label: 'Creation', icon: '✨' },
  { id: 'perfect_days', label: 'Perfect Days', icon: '⭐' },
  { id: 'days_active', label: 'Days Active', icon: '🌱' },
  { id: 'levels', label: 'Levels', icon: '👑' },
  { id: 'milestones', label: 'XP Milestones', icon: '🪙' },
  { id: 'combos', label: 'Combos', icon: '🌈' },
];

// Map achievement IDs to categories
export function getAchievementCategory(id: string): AchievementCategory {
  if (id.startsWith('current_')) return 'current_streak';
  if (id.startsWith('streak_') || ['streak_starter', 'streak_master', 'two_week_warrior', 'month_master', 'sixty_day_streak', 'ninety_day_streak', 'year_streak'].includes(id)) return 'streaks';
  if (id.startsWith('perfect_')) return 'perfect_days';
  if (id.startsWith('active_') || id.endsWith('_active')) return 'days_active';
  if (id.startsWith('level_')) return 'levels';
  if (id.startsWith('xp_')) return 'milestones';
  if (['first_creation', 'two_habits', 'habit_collector', 'habit_enthusiast', 'lucky_seven', 'habit_architect', 'dozen_habits', 'lifestyle_designer'].includes(id) || id.endsWith('_habits')) return 'creation';
  if (['balanced_start', 'dedicated_beginner', 'committed_builder', 'well_rounded', 'power_user', 'habit_master', 'life_changer', 'perfectionist', 'iron_discipline', 'ultimate_warrior', 'grand_master', 'legend_status', 'godlike', 'first_week_combo', 'month_combo', 'century_combo', 'year_combo', 'streak_and_habits', 'triple_crown', 'ultimate_completionist'].includes(id)) return 'combos';
  return 'completions';
}
