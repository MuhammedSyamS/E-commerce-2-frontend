import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      isCartOpen: false,
      isSearchOpen: false,
      isAdminSidebarOpen: true, // Default Open

      toggleAdminSidebar: () => set((state) => ({ isAdminSidebarOpen: !state.isAdminSidebarOpen })),

      setUser: (userData) => set({ user: userData }),

      // ✅ OPTIMISTIC WISHLIST TOGGLE
      toggleWishlist: async (product) => {
        const state = get();
        if (!state.user) return;

        const originalUser = state.user;
        const currentWishlist = state.user.wishlist || [];
        const productId = product._id || product;

        // Check availability
        const exists = currentWishlist.some(item =>
          (item._id || item).toString() === productId.toString()
        );

        // 1. Optimistic Update (Immediate Feedback)
        let newWishlist;
        if (exists) {
          newWishlist = currentWishlist.filter(item =>
            (item._id || item).toString() !== productId.toString()
          );
        } else {
          newWishlist = [...currentWishlist, product];
        }

        set({ user: { ...state.user, wishlist: newWishlist } });

        // 2. Background Sync
        try {
          const config = { headers: { Authorization: `Bearer ${state.user.token}` } };
          const { data } = await axios.post('http://localhost:5000/api/wishlist', { productId }, config);

          // 3. Final Sync (Optional, keeps consistent with DB)
          set({ user: { ...get().user, wishlist: data } });

        } catch (error) {
          console.error("Wishlist sync failed:", error);
          // 4. Rollback on Error
          set({ user: originalUser });
        }
      },

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