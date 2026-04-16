import { useState, useEffect } from 'react';

export function useNotifications() {
  const [notifications, setNotificationsState] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const savedNotifs = localStorage.getItem('appNotifications');
    if (savedNotifs) {
      setNotificationsState(JSON.parse(savedNotifs));
    }
  }, []);

  const dispatchNotification = (msg, type = 'info') => {
    const id = Date.now().toString() + Math.random();
    setNotificationsState(prev => {
      const updated = [{
        id,
        message: msg,
        type: type,
        read: false,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }, ...prev];
      localStorage.setItem('appNotifications', JSON.stringify(updated));
      return updated;
    });

    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const markNotificationsRead = () => {
    setNotificationsState(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('appNotifications', JSON.stringify(updated));
      return updated;
    });
  };

  return {
    notifications,
    toasts,
    dispatchNotification,
    markNotificationsRead
  };
}
