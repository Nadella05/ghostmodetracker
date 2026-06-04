import { useState } from 'react';
import { Droplets, Plus, Minus, Target, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHabitContext } from '@/contexts/HabitContext';
import { LiquidContainer } from '@/components/LiquidContainer';
import { HydrationAnalytics } from '@/components/HydrationAnalytics';
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
}: WaterTrackerProps) {
  const { isGhostMode } = useHabitContext();
  const progress = getProgress();
  const [customAmount, setCustomAmount] = useState(250);
  const [pourTrigger, setPourTrigger] = useState(0);

  const quickAmounts = [250, 500, 750];
  const goalOptions = [1500, 2000, 2500, 3000, 3500, 4000];
  const remaining = Math.max(0, dailyGoal - todayIntake);
  // Raw (unclamped) percentage so we can show overflow visuals
  const rawPercent = dailyGoal > 0 ? Math.round((todayIntake / dailyGoal) * 100) : 0;
  const isOverflow = rawPercent > 100;
  const overflowMl = Math.max(0, todayIntake - dailyGoal);

  const handleAdd = (amount: number) => {
    addWater(amount);
    setPourTrigger(t => t + 1);
  };

  return (
    <div className="space-y-6">
      {/* Immersive liquid container */}
      <LiquidContainer
        percentage={rawPercent}
        pourTrigger={pourTrigger}
        ghost={isGhostMode}
        className="h-[360px] sm:h-[440px]"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-between p-5">
          {/* Top dashboard */}
          <div className={cn(
            'w-full rounded-2xl border px-4 py-3 backdrop-blur-md',
            isGhostMode
              ? 'bg-card/80 border-border'
              : 'bg-white/70 dark:bg-card/70 border-white/40 shadow-lg shadow-sky-500/10',
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className={cn('h-5 w-5', isGhostMode ? 'text-muted-foreground' : 'text-sky-500')} />
                <span className="text-sm font-semibold">Hydration</span>
                {isOverflow && !isGhostMode && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                    Overflow
                  </span>
                )}
              </div>
              <span className={cn(
                'text-sm font-bold tabular-nums',
                (progress.isGoalMet || isOverflow) && !isGhostMode && 'text-sky-500',
              )}>
                {rawPercent}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              <Stat label="Current" value={`${todayIntake}`} unit="ml" />
              <Stat label="Goal"    value={`${dailyGoal}`}   unit="ml" />
              <Stat label={isOverflow ? 'Over' : 'Left'} value={`${isOverflow ? overflowMl : remaining}`} unit="ml" />
            </div>
          </div>

          {/* Center reading */}
          <div className={cn(
            'text-center pointer-events-none transition-transform',
            !isGhostMode && 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]'
          )}>
            <div className={cn(
              'text-5xl sm:text-6xl font-extrabold tabular-nums leading-none',
              !isGhostMode && rawPercent > 30 ? 'text-white' : '',
            )}>
              {todayIntake}
              <span className="text-lg font-medium opacity-80 ml-1">ml</span>
            </div>
            <p className={cn(
              'text-xs uppercase tracking-widest mt-1',
              !isGhostMode && rawPercent > 30 ? 'text-white/80' : 'text-muted-foreground',
            )}>
              {isOverflow ? `Overflow +${overflowMl} ml` : (progress.isGoalMet ? 'Goal achieved' : `${remaining} ml to goal`)}
            </p>
          </div>

          {/* Quick add chips */}
          <div className="flex items-center gap-2 w-full justify-center">
            {quickAmounts.map(amt => (
              <Button
                key={amt}
                size="sm"
                variant="secondary"
                className={cn(
                  'rounded-full px-4 backdrop-blur-md',
                  !isGhostMode && 'bg-white/80 hover:bg-white dark:bg-card/80 shadow'
                )}
                onClick={() => handleAdd(amt)}
              >
                +{amt}
              </Button>
            ))}
          </div>
        </div>
      </LiquidContainer>

      {/* Custom amount */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setCustomAmount(Math.max(50, customAmount - 50))}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="secondary" className="flex-1 h-12" onClick={() => handleAdd(customAmount)}>
          <Plus className="h-4 w-4 mr-2" />
          Add {customAmount} ml
        </Button>
        <Button variant="outline" size="icon" onClick={() => setCustomAmount(Math.min(1000, customAmount + 50))}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Analytics — inline on mobile/tablet; moved to right panel on xl+ */}
      <div className="xl:hidden">
        <HydrationAnalytics />
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
        <div className="flex items-center justify-between rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Daily Goal</span>
          </div>
          <Select value={dailyGoal.toString()} onValueChange={(v) => setDailyGoal(parseInt(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {goalOptions.map((goal) => (
                <SelectItem key={goal} value={goal.toString()}>{goal} ml</SelectItem>
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

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-bold tabular-nums">{value}<span className="text-[10px] font-medium text-muted-foreground ml-0.5">{unit}</span></div>
    </div>
  );
}
