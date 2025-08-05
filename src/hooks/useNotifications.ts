import { useState, useEffect } from 'react';
import { Notification } from '../types';

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Low Stock Alert',
    message: 'Paracetamol is running low (5 units remaining)',
    type: 'warning',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Appointment Reminder',
    message: 'Appointment with John Doe at 2:00 PM today',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight at 11 PM',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount
  };
};