import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      
      setOrders: (orders) => set({ orders }),
      
      addOrder: (order) => set((state) => ({ 
        orders: [order, ...state.orders] 
      })),
      
      updateOrder: (id, updatedData) => set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, ...updatedData } : o))
      })),
      
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter((o) => o.id !== id)
      })),
      
      getOrderById: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: 'app-orders',
    }
  )
);
