import { useState, useEffect } from 'react';
import { useEngagementStore } from '../store/engagement';

interface Notification {
  id: string;
  eventId: string;
  eventTitle: string;
  type: 'join' | 'reminder' | 'update';
  timestamp: Date;
  read: boolean;
}

export default function useEngagementNotifications() {
  const { joinedEvents } = useEngagementStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications when joined events change
  useEffect(() => {
    const newNotifications: Notification[] = joinedEvents.map(eventId => ({
      id: `notif-${eventId}-${Date.now()}`,
      eventId,
      eventTitle: `Event ${eventId.slice(0, 6)}`, // Placeholder - would come from API
      type: 'join',
      timestamp: new Date(),
      read: false
    }));

    setNotifications(prev => [...newNotifications, ...prev]);
    setUnreadCount(prev => prev + newNotifications.length);
  }, [joinedEvents]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  };
}