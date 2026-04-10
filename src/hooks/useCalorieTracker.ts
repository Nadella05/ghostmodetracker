import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { parseCalorieInput, ParsedFoodItem } from '@/lib/calorieParser';

export interface CalorieEntry {
  id: string;
  input: string;
  items: ParsedFoodItem[];
  total: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'app';
  text: string;
  entry?: CalorieEntry;
  unfoundItems?: ParsedFoodItem[];
  timestamp: string;
}

interface CalorieData {
  entries: Record<string, CalorieEntry[]>;
  customFoods: Record<string, number>;
}

const STORAGE_KEY = 'habit-tracker-calories';

const DEFAULT_DATA: CalorieData = {
  entries: {},
  customFoods: {},
};

export function useCalorieTracker() {
  const [data, setData] = useState<CalorieData>(DEFAULT_DATA);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  // Load today's messages on mount
  useEffect(() => {
    if (!isLoaded) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntries = data.entries[today] || [];
    const msgs: ChatMessage[] = [];
    for (const entry of todayEntries) {
      msgs.push({
        id: entry.id + '-user',
        type: 'user',
        text: entry.input,
        timestamp: entry.timestamp,
      });
      msgs.push({
        id: entry.id + '-app',
        type: 'app',
        text: '',
        entry,
        timestamp: entry.timestamp,
      });
    }
    setMessages(msgs);
  }, [isLoaded]); // Only on initial load

  const processInput = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date().toISOString();
    const id = Date.now().toString(36);

    // Add user message
    const userMsg: ChatMessage = {
      id: id + '-user',
      type: 'user',
      text: trimmed,
      timestamp: now,
    };

    const parsed = parseCalorieInput(trimmed);
    const foundItems = parsed.filter(i => i.found);
    const unfoundItems = parsed.filter(i => !i.found);
    const total = foundItems.reduce((sum, i) => sum + i.cal, 0);

    const entry: CalorieEntry = {
      id,
      input: trimmed,
      items: foundItems,
      total,
      timestamp: now,
    };

    // Save entry
    setData(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [today]: [...(prev.entries[today] || []), entry],
      },
    }));

    const appMsg: ChatMessage = {
      id: id + '-app',
      type: 'app',
      text: '',
      entry: foundItems.length > 0 ? entry : undefined,
      unfoundItems: unfoundItems.length > 0 ? unfoundItems : undefined,
      timestamp: now,
    };

    setMessages(prev => [...prev, userMsg, appMsg]);
  }, []);

  const addCustomCalorie = useCallback((name: string, calories: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date().toISOString();
    const id = Date.now().toString(36) + 'c';

    const item: ParsedFoodItem = {
      name: name.toLowerCase(),
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      qty: 1,
      cal: calories,
      unit: 'serving',
      found: true,
    };

    const entry: CalorieEntry = {
      id,
      input: `${name} (manual: ${calories} kcal)`,
      items: [item],
      total: calories,
      timestamp: now,
    };

    setData(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [today]: [...(prev.entries[today] || []), entry],
      },
    }));

    const appMsg: ChatMessage = {
      id: id + '-app',
      type: 'app',
      text: '',
      entry,
      timestamp: now,
    };

    setMessages(prev => [...prev, appMsg]);
  }, []);

  const getDailyTotal = useCallback((date?: Date) => {
    const key = format(date || new Date(), 'yyyy-MM-dd');
    const entries = data.entries[key] || [];
    return entries.reduce((sum, e) => sum + e.total, 0);
  }, [data.entries]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const getWeeklyCalories = useCallback(() => {
    const result: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = format(d, 'yyyy-MM-dd');
      result.push({
        date: format(d, 'EEE'),
        total: (data.entries[key] || []).reduce((s, e) => s + e.total, 0),
      });
    }
    return result;
  }, [data.entries]);

  return {
    messages,
    processInput,
    addCustomCalorie,
    getDailyTotal,
    clearChat,
    getWeeklyCalories,
    isLoaded,
  };
}
