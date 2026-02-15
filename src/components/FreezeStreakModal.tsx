import { useState } from 'react';
import { Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit, FREEZE_REASONS, FreezeReason, MAX_FREEZES_PER_MONTH } from '@/types/habit';
import { useHabitContext } from '@/contexts/HabitContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FreezeStreakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit;
  date: Date;
}

export function FreezeStreakModal({ open, onOpenChange, habit, date }: FreezeStreakModalProps) {
  const { freezeHabitForDate, getFreezesThisMonth, isGhostMode } = useHabitContext();
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<FreezeReason | null>(null);
  const [customReason, setCustomReason] = useState('');

  const freezesUsed = getFreezesThisMonth(habit, date);
  const freezesRemaining = MAX_FREEZES_PER_MONTH - freezesUsed;

  const effectiveReason = selectedReason === 'Other' 
    ? customReason.trim() 
    : selectedReason;

  const canConfirm = selectedReason && (selectedReason !== 'Other' || customReason.trim().length > 0);

  const handleConfirm = () => {
    if (!effectiveReason) return;
    freezeHabitForDate(habit.id, date, effectiveReason);
    
    if (!isGhostMode) {
      toast({
        title: '🧊 Streak Frozen',
        description: `${habit.name} — streak preserved`,
        duration: 3000,
      });
    }

    setSelectedReason(null);
    setCustomReason('');
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedReason(null);
      setCustomReason('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-sky-400" />
            Freeze streak for today
          </DialogTitle>
          <DialogDescription>
            Your streak will be preserved. No XP will be awarded. 
            {freezesRemaining > 0 
              ? ` You have ${freezesRemaining} freeze${freezesRemaining !== 1 ? 's' : ''} remaining this month.`
              : ' You have no freezes remaining this month.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm font-medium text-muted-foreground">Reason (required)</p>
          <div className="grid grid-cols-2 gap-2">
            {FREEZE_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm text-left transition-all",
                  selectedReason === reason
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card hover:border-primary/30 text-muted-foreground"
                )}
              >
                {reason === 'Sick' && '🤒 '}
                {reason === 'Travel' && '✈️ '}
                {reason === 'Emergency' && '🚨 '}
                {reason === 'Mental health' && '🧠 '}
                {reason === 'Other' && '📝 '}
                {reason}
              </button>
            ))}
          </div>

          {selectedReason === 'Other' && (
            <input
              type="text"
              placeholder="Enter your reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value.slice(0, 100))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!canConfirm}
            className="gap-2"
          >
            <Snowflake className="h-4 w-4" />
            Confirm Freeze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
