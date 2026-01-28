import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      isCartOpen: false,
      isSearchOpen: false,

      // Sets the entire user object (including the cart from DB)
      setUser: (userData) => set({ user: userData }),

      // Syncs ONLY the cart array when the controller returns it
      setCart: (updatedCart) => set((state) => ({
        user: state.user ? { ...state.user, cart: updatedCart } : null
      })),

      toggleCart: (open) => set((state) => ({ 
        isCartOpen: typeof open === 'boolean' ? open : !state.isCartOpen 
      })),
      
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

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