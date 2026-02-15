import { useState } from 'react';
import { Droplets, Plus, Minus, Target, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHabitContext } from '@/contexts/HabitContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface WaterTrackerProps {
  dailyGoal: number;
  todayIntake: number;
  addWater: (amount: number) => void;
  setDailyGoal: (goal: number) => void;
  resetToday: () => void;
  getProgress: () => { intake: number; goal: number; percentage: number; isGoalMet: boolean };
  getWeeklyStats: () => { date: string; intake: number; goal: number }[];
}

export function WaterTracker({
  dailyGoal,
  todayIntake,
  addWater,
  setDailyGoal,
  resetToday,
  getProgress,
  getWeeklyStats,
}: WaterTrackerProps) {
  const { isGhostMode } = useHabitContext();
  const progress = getProgress();
  const weeklyStats = getWeeklyStats();
  
  const [customAmount, setCustomAmount] = useState(250);

  const quickAmounts = [250, 500, 750];
  const goalOptions = [1500, 2000, 2500, 3000, 3500, 4000];

  // Calculate stroke properties for circular progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.percentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Main Progress Ring */}
      <div className="flex flex-col items-center py-4">
        <div className="relative">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={isGhostMode ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                "transition-all duration-500",
                !isGhostMode && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
              )}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets className={cn(
              "h-8 w-8 mb-1",
              isGhostMode ? "text-muted-foreground" : "text-primary"
            )} />
            <span className="text-3xl font-bold">{todayIntake}</span>
            <span className="text-sm text-muted-foreground">/ {dailyGoal} ml</span>
          </div>
        </div>

        {/* Progress percentage */}
        <div className={cn(
          "mt-4 text-center",
          progress.isGoalMet && !isGhostMode && "text-primary"
        )}>
          <span className="text-lg font-medium">{progress.percentage}%</span>
          <p className="text-sm text-muted-foreground">
            {progress.isGoalMet ? 'Goal achieved!' : `${dailyGoal - todayIntake} ml to go`}
          </p>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Quick Add
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="h-14 flex flex-col gap-0.5"
              onClick={() => addWater(amount)}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">{amount} ml</span>
            </Button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCustomAmount(Math.max(50, customAmount - 50))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            className="flex-1 h-12"
            onClick={() => addWater(customAmount)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {customAmount} ml
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCustomAmount(Math.min(1000, customAmount + 50))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          This Week
        </h3>
        <div className="flex items-end justify-between gap-1 h-24">
          {weeklyStats.map((day, i) => {
            const dayPercentage = Math.min(100, Math.round((day.intake / day.goal) * 100));
            const height = Math.max(8, (dayPercentage / 100) * 80);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    dayPercentage >= 100 
                      ? isGhostMode ? "bg-muted-foreground" : "bg-primary"
                      : "bg-secondary"
                  )}
                  style={{ height: `${height}px` }}
                />
                <span className="text-xs text-muted-foreground">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Settings
        </h3>
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Daily Goal</span>
          </div>
          <Select
            value={dailyGoal.toString()}
            onValueChange={(v) => setDailyGoal(parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {goalOptions.map((goal) => (
                <SelectItem key={goal} value={goal.toString()}>
                  {goal} ml
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Today's Progress
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset today's water intake?</AlertDialogTitle>
              <AlertDialogDescription>
                This will set your water intake for today back to 0 ml.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={resetToday}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
