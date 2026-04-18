import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  toasts: [],
  
  dispatchNotification: (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
      notifications: [{ id, message, type, date: new Date().toISOString(), read: false }, ...state.notifications]
    }));
    
    // Auto-remove toast after 4s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 4000);
  },
  
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
}));
