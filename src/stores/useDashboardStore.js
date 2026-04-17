import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDashboardStore = create(
  persist(
    (set) => ({
      layout: ['stats', 'analytics', 'products', 'orders', 'alerts'],
      
      setLayout: (newLayout) => set({ layout: newLayout }),
      
      resetLayout: () => set({ layout: ['stats', 'analytics', 'products', 'orders', 'alerts'] }),
    }),
    {
      name: 'dashboard-layout',
    }
  )
);
