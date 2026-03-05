import { useState, useEffect } from 'react';
import { format, startOfMonth } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Habit, HabitCategory, HabitFrequency, CATEGORY_LABELS, MAX_TIMES_PER_DAY } from '@/types/habit';
import { useHabitContext } from '@/contexts/HabitContext';
import { WeekdaySelector } from '@/components/WeekdaySelector';
import { cn } from '@/lib/utils';

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
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));

  // Reset form when editHabit changes
  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setCategory(editHabit.category);
      setFrequency(editHabit.frequency);
      setCustomDays(editHabit.customDays || [1, 3, 5]);
      setTimesPerDay(editHabit.timesPerDay || 1);
      setReminderEnabled(editHabit.reminder?.enabled || false);
      setReminderTime(editHabit.reminder?.time || '09:00');
      setStartDate(editHabit.startDate ? new Date(editHabit.startDate) : new Date(editHabit.createdOn));
    } else {
      resetForm();
    }
  }, [editHabit, open]);

  const resetForm = () => {
    setName('');
    setCategory('personal');
    setFrequency('daily');
    setCustomDays([1, 3, 5]);
    setTimesPerDay(1);
    setReminderEnabled(false);
    setReminderTime('09:00');
    setStartDate(startOfMonth(new Date()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    const habitData = {
      name,
      category,
      frequency,
      customDays: frequency === 'weekly' ? customDays : undefined,
      timesPerDay: frequency === 'daily' && timesPerDay > 1 ? timesPerDay : undefined,
      reminder: reminderEnabled ? { enabled: true, time: reminderTime } : undefined,
      startDate: format(startDate, 'yyyy-MM-dd'),
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

          {frequency === 'daily' && (
            <div className="space-y-2">
              <Label htmlFor="timesPerDay">Times per day</Label>
              <Input
                id="timesPerDay"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={timesPerDay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  if (raw === '') {
                    setTimesPerDay('' as any);
                  } else {
                    const num = parseInt(raw, 10);
                    setTimesPerDay(Math.min(MAX_TIMES_PER_DAY, num));
                  }
                }}
                onBlur={() => {
                  if (!timesPerDay || timesPerDay < 1) setTimesPerDay(1);
                }}
              />
              <p className="text-xs text-muted-foreground">
                {timesPerDay > 1 ? `Must be completed ${timesPerDay} times each day` : 'Single completion per day'}
              </p>
            </div>
          )}

          {/* Start Date Picker */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Habit tracking begins from this date
            </p>
          </div>

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
