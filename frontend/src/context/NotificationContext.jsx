import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const prevNotificationsRef = useRef([]);

  const addToast = (title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Auto remove after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.notifications.list();
      setNotifications(data);

      // Check for new notifications to show toast
      if (prevNotificationsRef.current.length > 0) {
        const currentIds = prevNotificationsRef.current.map(n => n._id || n.id);
        data.forEach(item => {
          const id = item._id || item.id;
          if (!currentIds.includes(id)) {
            addToast(item.title, item.message, item.type);
          }
        });
      }
      prevNotificationsRef.current = data;
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 8000); // Poll every 8s
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      prevNotificationsRef.current = [];
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => ((n._id || n.id) === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, toasts, markAsRead, addToast, fetchNotifications }}>
      {children}

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border backdrop-blur-xl flex flex-col gap-1 transition-all duration-300 transform translate-y-0 ${
              toast.type === 'emergency'
                ? 'bg-red-500/10 border-red-500/30 text-red-200'
                : toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
            }`}
          >
            <div className="flex justify-between items-center font-bold">
              <span>{toast.title}</span>
              <span className="text-xs opacity-60">now</span>
            </div>
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext) || {};
