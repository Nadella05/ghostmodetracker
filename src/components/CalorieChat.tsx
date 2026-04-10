import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Flame, AlertCircle, Mic, MicOff, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCalorieTracker, ChatMessage } from '@/hooks/useCalorieTracker';
import { saveCustomFood } from '@/data/foodDatabase';
import { useHabitContext } from '@/contexts/HabitContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';

export function CalorieChat() {
  const { messages, processInput, addCustomCalorie, getDailyTotal, clearChat } = useCalorieTracker();
  const { isGhostMode } = useHabitContext();
  const [input, setInput] = useState('');
  const [pendingCustom, setPendingCustom] = useState<{ name: string } | null>(null);
  const [customCalories, setCustomCalories] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFood, setImageFood] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dailyTotal = getDailyTotal();

  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
    // Auto-process after short delay so user sees the text
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

  const quickFoods = ['🍌 Banana', '☕ Tea', '🍚 Rice', '🥚 Egg', '🫓 Roti', '🥛 Milk', '🍗 Chicken', '🫘 Dal'];

  const handleQuickFood = (food: string) => {
    const name = food.replace(/^[^\w]+\s*/, '');
    processInput(name);
  };

  // Ghost mode: minimal display
  if (isGhostMode) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4 border-b">
          <p className="text-2xl font-mono font-bold">{dailyTotal} kcal</p>
          <p className="text-xs text-muted-foreground">today's total</p>
        </div>
        <div className="flex-1 space-y-2 min-h-[300px] max-h-[400px] overflow-y-auto">
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
      {/* Daily total header */}
      <div className="flex items-center justify-between pb-3 border-b mb-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{dailyTotal}</p>
            <p className="text-xs text-muted-foreground">kcal today</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Flame className="h-12 w-12 text-primary/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-1">
              Tell me what you ate, and I'll count the calories!
            </p>
            <p className="text-muted-foreground text-xs mb-4">
              Try: "half plate rice and 2 rotis" or "1/2 biryani"
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
          placeholder="I ate 2 rotis and dal..."
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
    </div>
  );
}

function MessageBubble({ 
  message, 
  onAddCustom 
}: { 
  message: ChatMessage; 
  onAddCustom: (name: string) => void;
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
                  {item.qty !== 1 && <span className="text-muted-foreground"> ({item.qty})</span>}
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
            I couldn't understand that. Try something like "2 rotis and dal".
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
