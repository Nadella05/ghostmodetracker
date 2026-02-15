import { useState, useEffect, useCallback } from 'react';
import { Habit } from '@/types/habit';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      if (import.meta.env.DEV) {
        console.warn('This browser does not support notifications');
      }
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error requesting notification permission:', error);
      }
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'habit-reminder',
      });
    }
  }, [permission]);

  const scheduleHabitReminder = useCallback((habit: Habit) => {
    if (!habit.reminder?.enabled || !habit.reminder?.time) return null;

    const [hours, minutes] = habit.reminder.time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, don't schedule
    if (scheduledTime <= now) return null;

    const delay = scheduledTime.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      sendNotification('Habit Reminder', `Time for: ${habit.name}`);
    }, delay);

    return timeoutId;
  }, [sendNotification]);

  return {
    permission,
    isSupported: 'Notification' in window,
    requestPermission,
    sendNotification,
    scheduleHabitReminder,
  };
}
