import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Trash2, Flame, AlertCircle, Mic, MicOff, Camera, X, Pencil, Target, Check, CalendarIcon, History } from 'lucide-react';
import { format, isToday as fnsIsToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCalorieTracker, ChatMessage, CalorieEntry } from '@/hooks/useCalorieTracker';
import { saveCustomFood } from '@/data/foodDatabase';
import { useHabitContext } from '@/contexts/HabitContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { MacroDashboard } from '@/components/MacroDashboard';
import { WeightProjection } from '@/components/WeightProjection';
import { computeTargets, DEFAULT_HEALTH_PROFILE, HealthProfile } from '@/lib/nutritionTargets';
import { buildInsights } from '@/lib/nutritionInsights';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FoodSearchBar } from '@/components/nutrition/FoodSearchBar';
import { FoodQuickLog } from '@/components/nutrition/FoodQuickLog';
import { FoodFormDialog } from '@/components/nutrition/FoodFormDialog';
import { NutritionDatabaseDialog } from '@/components/nutrition/NutritionDatabaseDialog';
import { CustomFood } from '@/types/nutrition';

export function CalorieChat() {
  const {
    messages, processInput, addCustomCalorie, addFoodEntry, getDailyTotal, getDailyMacros, clearChat,
    calorieGoal, setCalorieGoal, editEntry, deleteEntry, getEntriesForDate,
  } = useCalorieTracker();
  const { isGhostMode, profile } = useHabitContext();
  const [input, setInput] = useState('');
  const [pendingCustom, setPendingCustom] = useState<{ name: string } | null>(null);
  const [customCalories, setCustomCalories] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFood, setImageFood] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ date: string; entry: CalorieEntry } | null>(null);
  const [editText, setEditText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [browseDate, setBrowseDate] = useState<Date | null>(null);
  const [selectedFood, setSelectedFood] = useState<CustomFood | null>(null);
  const [foodFormOpen, setFoodFormOpen] = useState(false);
  const [foodFormPrefill, setFoodFormPrefill] = useState<string | undefined>();
  const [dbDialogOpen, setDbDialogOpen] = useState(false);

  const dailyTotal = getDailyTotal();
  const dailyMacros = getDailyMacros();
  const goalPercent = Math.min((dailyTotal / calorieGoal) * 100, 100);
  const remaining = Math.max(calorieGoal - dailyTotal, 0);
  const today = format(new Date(), 'yyyy-MM-dd');
  const browseKey = browseDate ? format(browseDate, 'yyyy-MM-dd') : null;
  const browseEntries = useMemo(
    () => (browseKey ? getEntriesForDate(browseKey) : []),
    [browseKey, getEntriesForDate]
  );
  const browseTotal = browseEntries.reduce((s, e) => s + e.total, 0);

  // Health profile (falls back to defaults if user hasn't set one in Settings)
  const healthProfile: HealthProfile = {
    weightKg: profile.weightKg ?? DEFAULT_HEALTH_PROFILE.weightKg,
    heightCm: profile.heightCm ?? DEFAULT_HEALTH_PROFILE.heightCm,
    age: profile.age ?? DEFAULT_HEALTH_PROFILE.age,
    gender: profile.gender ?? DEFAULT_HEALTH_PROFILE.gender,
    activityLevel: profile.activityLevel ?? DEFAULT_HEALTH_PROFILE.activityLevel,
    weightGoal: profile.weightGoal ?? DEFAULT_HEALTH_PROFILE.weightGoal,
  };
  const targets = useMemo(() => {
    const t = computeTargets(healthProfile);
    return { ...t, calories: calorieGoal || t.calories };
  }, [healthProfile.weightKg, healthProfile.heightCm, healthProfile.age, healthProfile.gender, healthProfile.activityLevel, healthProfile.weightGoal, calorieGoal]);
  const insights = useMemo(() => buildInsights(dailyMacros, targets), [dailyMacros, targets]);

  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
    setTimeout(() => {
      if (text.trim()) {
        processInput(text);
        setInput('');
      }
    }, 500);
  }, [processInput]);

  const { isListening, isSupported: voiceSupported, toggleListening } = useVoiceInput(handleVoiceResult);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    processInput(input);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCustomSave = () => {
    if (!pendingCustom || !customCalories) return;
    const cal = parseInt(customCalories);
    if (isNaN(cal) || cal <= 0) return;
    saveCustomFood(pendingCustom.name, cal);
    addCustomCalorie(pendingCustom.name, cal);
    setPendingCustom(null);
    setCustomCalories('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setImageFood('');
    };
    reader.readAsDataURL(file);
  };

  const handleImageFoodSubmit = () => {
    if (!imageFood.trim()) return;
    processInput(imageFood);
    setImagePreview(null);
    setImageFood('');
  };

  const handleGoalSave = () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val >= 500 && val <= 10000) {
      setCalorieGoal(val);
    }
    setShowGoalEdit(false);
    setGoalInput('');
  };

  const handleEditSave = () => {
    if (!editingEntry || !editText.trim()) return;
    editEntry(editingEntry.date, editingEntry.entry.id, editText);
    setEditingEntry(null);
    setEditText('');
  };

  const handleDelete = (entryId: string) => {
    deleteEntry(today, entryId);
  };

  const quickFoods = ['🍌 Banana', '☕ Tea', '🍚 Rice', '🥚 Egg', '🫓 Roti', '🥛 Milk', '🍗 Chicken', '🫘 Dal'];

  const handleQuickFood = (food: string) => {
    const name = food.replace(/^[^\w]+\s*/, '');
    processInput(name);
  };

  if (isGhostMode) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4 border-b">
          <p className="text-2xl font-mono font-bold">{dailyTotal} kcal</p>
          <p className="text-xs text-muted-foreground">today's total</p>
        </div>
        <MacroDashboard totals={dailyMacros} targets={targets} ghost />
        <div className="flex-1 space-y-2 min-h-[240px] max-h-[400px] overflow-y-auto">
          {messages.filter(m => m.type === 'app' && m.entry).map(msg => (
            <div key={msg.id} className="text-sm font-mono py-1 border-b border-dashed">
              Total: {msg.entry!.total} kcal
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What did you eat?"
            className="flex-1"
          />
          <Button size="icon" variant="ghost" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Hero gradient header */}
      <div className="relative overflow-hidden rounded-2xl mb-3 p-4 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center shadow-inner">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold leading-none tracking-tight">
                {dailyTotal}
                <span className="text-base text-muted-foreground font-medium ml-1">kcal</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">of {calorieGoal} today · {remaining} left</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-9">
                  <History className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={browseDate ?? undefined}
                  onSelect={(d) => setBrowseDate(d ?? null)}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
            {showGoalEdit ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder={String(calorieGoal)}
                  className="w-20 h-9 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
                />
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleGoalSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setShowGoalEdit(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-9"
                onClick={() => { setShowGoalEdit(true); setGoalInput(String(calorieGoal)); }}
              >
                <Target className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Goal</span>
              </Button>
            )}
            {messages.length > 0 && !browseDate && (
              <Button variant="ghost" size="icon" onClick={clearChat} className="text-muted-foreground h-9 w-9">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="relative mt-3 space-y-1">
          <Progress value={goalPercent} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{Math.round(goalPercent)}% of goal</span>
            <span>{remaining} kcal remaining</span>
          </div>
        </div>
      </div>

      {/* Nutrition database quick-log */}
      <div className="mb-3 space-y-2">
        {selectedFood ? (
          <FoodQuickLog
            food={selectedFood}
            onCancel={() => setSelectedFood(null)}
            onLog={(p) => {
              addFoodEntry(p);
              setSelectedFood(null);
            }}
          />
        ) : (
          <FoodSearchBar
            onSelect={(f) => setSelectedFood(f)}
            onAddNew={(name) => { setFoodFormPrefill(name); setFoodFormOpen(true); }}
            onManage={() => setDbDialogOpen(true)}
          />
        )}
      </div>


      {/* Macro/Projection/Insights — inline on small screens; moved to right panel on xl+ */}
      <div className="xl:hidden space-y-3 mb-3">
        <MacroDashboard totals={dailyMacros} targets={targets} />
        <WeightProjection profile={healthProfile} todayIntake={dailyTotal} />
        {insights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {insights.map(i => (
              <span
                key={i.id}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]',
                  i.tone === 'good' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                  i.tone === 'warn' && 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                  i.tone === 'info' && 'border-muted-foreground/20 bg-muted/50',
                )}
              >
                <span>{i.icon}</span>{i.text}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Past-day editor */}
      {browseDate && (
        <div className="mb-3 rounded-2xl border bg-card p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm">
                {format(browseDate, 'EEEE, MMM d')}
                {fnsIsToday(browseDate) && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">Today</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-semibold">{browseTotal} kcal</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setBrowseDate(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {browseEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No entries logged for this day.</p>
          ) : (
            <div className="space-y-2">
              {browseEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-2 rounded-lg border bg-background/60 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{entry.input}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.total} kcal · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7"
                      onClick={() => { setEditingEntry({ date: browseKey!, entry }); setEditText(entry.input); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive"
                      onClick={() => deleteEntry(browseKey!, entry.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Flame className="h-12 w-12 text-primary/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-1">
              Tell me what you ate, and I'll count the calories!
            </p>
            <p className="text-muted-foreground text-xs mb-4">
              Try: "300g rice" or "half plate biryani" or "2 rotis"
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickFoods.map(food => (
                <Button
                  key={food}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => handleQuickFood(food)}
                >
                  {food}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onAddCustom={(name) => setPendingCustom({ name })}
            onEdit={(entry) => {
              setEditingEntry({ date: today, entry });
              setEditText(entry.input);
            }}
            onDelete={(entryId) => handleDelete(entryId)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="p-3 border rounded-xl mb-2 bg-muted/50 animate-fade-in">
          <div className="flex items-start gap-3">
            <img src={imagePreview} alt="Food" className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium mb-1">What food is this?</p>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setImagePreview(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={imageFood}
                  onChange={(e) => setImageFood(e.target.value)}
                  placeholder="e.g. 2 dosas"
                  className="flex-1 h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleImageFoodSubmit()}
                />
                <Button size="sm" className="h-8" onClick={handleImageFoodSubmit}>Log</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom food entry */}
      {pendingCustom && (
        <div className="p-3 border rounded-xl mb-2 bg-muted/50 animate-fade-in">
          <p className="text-sm mb-2">
            Enter calories for <span className="font-semibold">{pendingCustom.name}</span>:
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              placeholder="e.g. 200"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSave()}
            />
            <Button size="sm" onClick={handleCustomSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setPendingCustom(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Quick foods when chat has messages */}
      {messages.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-hide">
          {quickFoods.map(food => (
            <Button
              key={food}
              variant="outline"
              size="sm"
              className="rounded-full text-xs whitespace-nowrap shrink-0"
              onClick={() => handleQuickFood(food)}
            >
              {food}
            </Button>
          ))}
        </div>
      )}

      {/* Input with voice & camera */}
      <div className="flex gap-2 pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          size="icon"
          variant="outline"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="I ate 300g rice and dal..."
          className="flex-1"
        />
        {voiceSupported && (
          <Button
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            className={cn("shrink-0", isListening && "animate-pulse")}
            onClick={toggleListening}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
        <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="e.g. 2 rotis and dal"
            onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingEntry(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageBubble({
  message,
  onAddCustom,
  onEdit,
  onDelete,
}: {
  message: ChatMessage;
  onAddCustom: (name: string) => void;
  onEdit: (entry: CalorieEntry) => void;
  onDelete: (entryId: string) => void;
}) {
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
          <p className="text-sm">{message.text}</p>
          <p className="text-[10px] opacity-60 text-right mt-0.5">{time}</p>
        </div>
      </div>
    );
  }

  const { entry, unfoundItems } = message;

  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] space-y-1.5">
        {entry && entry.items.length > 0 && (
          <>
            {entry.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-4 text-sm">
                <span>
                  {item.displayName}
                  {item.unit === 'g' ? (
                    <span className="text-muted-foreground"> ({item.qty}g)</span>
                  ) : item.qty !== 1 ? (
                    <span className="text-muted-foreground"> ({item.qty})</span>
                  ) : null}
                </span>
                <span className="font-semibold whitespace-nowrap">{item.cal} kcal</span>
              </div>
            ))}
            {entry.items.length > 1 && (
              <div className="flex justify-between gap-4 text-sm font-bold border-t pt-1.5 mt-1">
                <span>Total</span>
                <span>{entry.total} kcal</span>
              </div>
            )}
            {/* Edit/Delete buttons */}
            <div className="flex gap-1 pt-1">
              <button
                onClick={() => onEdit(entry)}
                className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </>
        )}
        {unfoundItems && unfoundItems.length > 0 && (
          <div className="space-y-1">
            {unfoundItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-muted-foreground">
                  "{item.displayName}" not found
                </span>
                <button
                  onClick={() => onAddCustom(item.name)}
                  className="text-primary text-xs underline whitespace-nowrap"
                >
                  Add manually
                </button>
              </div>
            ))}
          </div>
        )}
        {(!entry || entry.items.length === 0) && (!unfoundItems || unfoundItems.length === 0) && (
          <p className="text-sm text-muted-foreground">
            I couldn't understand that. Try something like "2 rotis and dal" or "300g rice".
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
