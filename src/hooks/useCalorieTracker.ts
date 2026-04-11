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
  calorieGoal: number;
}

const STORAGE_KEY = 'habit-tracker-calories';

const DEFAULT_DATA: CalorieData = {
  entries: {},
  customFoods: {},
  calorieGoal: 2000,
};

export function useCalorieTracker() {
  const [data, setData] = useState<CalorieData>(DEFAULT_DATA);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData({ ...DEFAULT_DATA, ...parsed });
      }
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

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

  const editEntry = useCallback((date: string, entryId: string, newInput: string) => {
    const parsed = parseCalorieInput(newInput);
    const foundItems = parsed.filter(i => i.found);
    const total = foundItems.reduce((sum, i) => sum + i.cal, 0);

    setData(prev => {
      const dateEntries = [...(prev.entries[date] || [])];
      const idx = dateEntries.findIndex(e => e.id === entryId);
      if (idx === -1) return prev;

      dateEntries[idx] = {
        ...dateEntries[idx],
        input: newInput,
        items: foundItems,
        total,
      };

      return {
        ...prev,
        entries: { ...prev.entries, [date]: dateEntries },
      };
    });

    // Update messages if editing today
    const today = format(new Date(), 'yyyy-MM-dd');
    if (date === today) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === entryId + '-user') {
          return { ...msg, text: newInput };
        }
        if (msg.id === entryId + '-app' && msg.entry) {
          return {
            ...msg,
            entry: { ...msg.entry, input: newInput, items: foundItems, total },
          };
        }
        return msg;
      }));
    }
  }, []);

  const deleteEntry = useCallback((date: string, entryId: string) => {
    setData(prev => {
      const dateEntries = (prev.entries[date] || []).filter(e => e.id !== entryId);
      return {
        ...prev,
        entries: { ...prev.entries, [date]: dateEntries },
      };
    });

    // Remove from messages if today
    const today = format(new Date(), 'yyyy-MM-dd');
    if (date === today) {
      setMessages(prev => prev.filter(msg =>
        msg.id !== entryId + '-user' && msg.id !== entryId + '-app'
      ));
    }
  }, []);

  const getDailyTotal = useCallback((date?: Date) => {
    const key = format(date || new Date(), 'yyyy-MM-dd');
    const entries = data.entries[key] || [];
    return entries.reduce((sum, e) => sum + e.total, 0);
  }, [data.entries]);

  const getEntriesForDate = useCallback((date: string) => {
    return data.entries[date] || [];
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

  const calorieGoal = data.calorieGoal;

  const setCalorieGoal = useCallback((goal: number) => {
    setData(prev => ({ ...prev, calorieGoal: goal }));
  }, []);

  return {
    messages,
    processInput,
    addCustomCalorie,
    editEntry,
    deleteEntry,
    getDailyTotal,
    getEntriesForDate,
    clearChat,
    getWeeklyCalories,
    calorieGoal,
    setCalorieGoal,
    isLoaded,
  };
}
