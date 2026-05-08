import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
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

// ---- Module-level shared store so every component sees the same data ----
let storeData: CalorieData = DEFAULT_DATA;
let storeMessages: ChatMessage[] = [];
let storeLoaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
  } catch { /* ignore */ }
}

function setStoreData(updater: (prev: CalorieData) => CalorieData) {
  storeData = updater(storeData);
  persist();
  emit();
}

function setStoreMessages(updater: (prev: ChatMessage[]) => ChatMessage[]) {
  storeMessages = updater(storeMessages);
  emit();
}

function ensureLoaded() {
  if (storeLoaded) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      storeData = { ...DEFAULT_DATA, ...parsed };
    }
  } catch { /* ignore */ }

  // Hydrate today's messages from saved entries
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntries = storeData.entries[today] || [];
  const msgs: ChatMessage[] = [];
  for (const entry of todayEntries) {
    msgs.push({ id: entry.id + '-user', type: 'user', text: entry.input, timestamp: entry.timestamp });
    msgs.push({ id: entry.id + '-app', type: 'app', text: '', entry, timestamp: entry.timestamp });
  }
  storeMessages = msgs;
  storeLoaded = true;
}

// Cross-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        storeData = { ...DEFAULT_DATA, ...JSON.parse(e.newValue) };
        emit();
      } catch { /* ignore */ }
    }
  });
}

export function useCalorieTracker() {
  ensureLoaded();

  const data = useSyncExternalStore(
    subscribe,
    () => storeData,
    () => storeData
  );
  const messages = useSyncExternalStore(
    subscribe,
    () => storeMessages,
    () => storeMessages
  );

  const processInput = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date().toISOString();
    const id = Date.now().toString(36);

    const userMsg: ChatMessage = { id: id + '-user', type: 'user', text: trimmed, timestamp: now };

    const parsed = parseCalorieInput(trimmed);
    const foundItems = parsed.filter(i => i.found);
    const unfoundItems = parsed.filter(i => !i.found);
    const total = foundItems.reduce((sum, i) => sum + i.cal, 0);

    const entry: CalorieEntry = { id, input: trimmed, items: foundItems, total, timestamp: now };

    setStoreData(prev => ({
      ...prev,
      entries: { ...prev.entries, [today]: [...(prev.entries[today] || []), entry] },
    }));

    const appMsg: ChatMessage = {
      id: id + '-app',
      type: 'app',
      text: '',
      entry: foundItems.length > 0 ? entry : undefined,
      unfoundItems: unfoundItems.length > 0 ? unfoundItems : undefined,
      timestamp: now,
    };

    setStoreMessages(prev => [...prev, userMsg, appMsg]);
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

    setStoreData(prev => ({
      ...prev,
      entries: { ...prev.entries, [today]: [...(prev.entries[today] || []), entry] },
    }));

    setStoreMessages(prev => [...prev, { id: id + '-app', type: 'app', text: '', entry, timestamp: now }]);
  }, []);

  const editEntry = useCallback((date: string, entryId: string, newInput: string) => {
    const parsed = parseCalorieInput(newInput);
    const foundItems = parsed.filter(i => i.found);
    const total = foundItems.reduce((sum, i) => sum + i.cal, 0);

    setStoreData(prev => {
      const dateEntries = [...(prev.entries[date] || [])];
      const idx = dateEntries.findIndex(e => e.id === entryId);
      if (idx === -1) return prev;
      dateEntries[idx] = { ...dateEntries[idx], input: newInput, items: foundItems, total };
      return { ...prev, entries: { ...prev.entries, [date]: dateEntries } };
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    if (date === today) {
      setStoreMessages(prev => prev.map(msg => {
        if (msg.id === entryId + '-user') return { ...msg, text: newInput };
        if (msg.id === entryId + '-app' && msg.entry) {
          return { ...msg, entry: { ...msg.entry, input: newInput, items: foundItems, total } };
        }
        return msg;
      }));
    }
  }, []);

  const deleteEntry = useCallback((date: string, entryId: string) => {
    setStoreData(prev => {
      const dateEntries = (prev.entries[date] || []).filter(e => e.id !== entryId);
      return { ...prev, entries: { ...prev.entries, [date]: dateEntries } };
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    if (date === today) {
      setStoreMessages(prev => prev.filter(msg =>
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
    setStoreMessages(() => []);
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

  const setCalorieGoal = useCallback((goal: number) => {
    setStoreData(prev => ({ ...prev, calorieGoal: goal }));
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
    calorieGoal: data.calorieGoal,
    setCalorieGoal,
    isLoaded: true,
  };
}
