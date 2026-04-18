import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDashboardStore = create(
  persist(
    (set) => ({
      layout: ['stats', 'analytics', 'activity-row', 'alerts'],
      
      setLayout: (newLayout) => set({ layout: newLayout }),
      
      resetLayout: () => set({ layout: ['stats', 'analytics', 'activity-row', 'alerts'] }),
    }),
    {
      name: 'dashboard-layout',
      version: 2, // Incremented version to force/handle migration
      migrate: (persistedState, version) => {
        if (version === 1) {
          // Migrate from old separate blocks to new unified activity-row
          return {
            ...persistedState,
            layout: ['stats', 'analytics', 'activity-row', 'alerts']
          };
        }
        return persistedState;
      },
    }
  )
);
