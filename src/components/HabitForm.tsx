import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Habit, HabitCategory, HabitFrequency, CATEGORY_LABELS } from '@/types/habit';
import { useHabitContext } from '@/contexts/HabitContext';
import { WeekdaySelector } from '@/components/WeekdaySelector';

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editHabit?: Habit | null;
}

export function HabitForm({ open, onOpenChange, editHabit }: HabitFormProps) {
  const { addHabit, updateHabit, isGhostMode, settings } = useHabitContext();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('personal');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  // Reset form when editHabit changes
  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setCategory(editHabit.category);
      setFrequency(editHabit.frequency);
      setCustomDays(editHabit.customDays || [1, 3, 5]);
      setReminderEnabled(editHabit.reminder?.enabled || false);
      setReminderTime(editHabit.reminder?.time || '09:00');
    } else {
      resetForm();
    }
  }, [editHabit, open]);

  const resetForm = () => {
    setName('');
    setCategory('personal');
    setFrequency('daily');
    setCustomDays([1, 3, 5]);
    setReminderEnabled(false);
    setReminderTime('09:00');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const habitData = {
      name,
      category,
      frequency,
      customDays: frequency === 'weekly' ? customDays : undefined,
      reminder: reminderEnabled ? { enabled: true, time: reminderTime } : undefined,
    };

    if (editHabit) {
      updateHabit(editHabit.id, habitData);
    } else {
      addHabit(habitData);
    }

    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const showReminders = !isGhostMode || settings.showNotifications;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editHabit ? 'Edit Habit' : 'New Habit'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as HabitCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as HabitCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly (specific days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <WeekdaySelector value={customDays} onChange={setCustomDays} />
            </div>
          )}

          {showReminders && (
            <div className="space-y-3 rounded-lg border bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder" className="cursor-pointer">
                  Enable Reminder
                </Label>
                <Switch
                  id="reminder"
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>
              
              {reminderEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Reminder Time</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editHabit ? 'Save Changes' : 'Add Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
