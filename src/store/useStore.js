import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      isCartOpen: false,
      isSearchOpen: false,

      setUser: (userData) => set({ user: userData }),

      // ✅ FIX: Added missing addToCart function
      addToCart: (product) => {
        const state = get();
        const currentCart = state.user?.cart || [];
        const existingItem = currentCart.find((item) => item._id === product._id);

        let updatedCart;
        if (existingItem) {
          updatedCart = currentCart.map((item) =>
            item._id === product._id 
              ? { ...item, quantity: item.quantity + (product.quantity || 1) } 
              : item
          );
        } else {
          updatedCart = [...currentCart, { ...product, quantity: product.quantity || 1 }];
        }

        set({ user: state.user ? { ...state.user, cart: updatedCart } : null });
      },

      setCart: (updatedCart) => set((state) => ({
        user: state.user ? { ...state.user, cart: updatedCart } : null
      })),

      toggleCart: (open) => set((state) => ({ 
        isCartOpen: typeof open === 'boolean' ? open : !state.isCartOpen 
      })),
      
      logout: () => {
        set({ user: null });
        localStorage.removeItem('miso-storage');
      }
    }),
    { 
      name: 'miso-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);