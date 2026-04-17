import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      
      setProducts: (products) => set({ products }),
      
      addProduct: (product) => set((state) => ({ 
        products: [product, ...state.products] 
      })),
      
      updateProduct: (id, updatedData) => set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
      
      getProductById: (id) => get().products.find((p) => p.id === id),
      
      updateStock: (productId, quantityChange) => set((state) => {
        const products = state.products.map((p) => {
          if (p.id === productId) {
            const newStock = Math.max(0, p.stock + quantityChange);
            const status = newStock === 0 ? 'Out of Stock' : newStock < (p.minQuantity || 10) ? 'Low Stock' : 'In Stock';
            return { ...p, stock: newStock, status };
          }
          return p;
        });
        return { products };
      }),
    }),
    {
      name: 'app-products',
    }
  )
);
