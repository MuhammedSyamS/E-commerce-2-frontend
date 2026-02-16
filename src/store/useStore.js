import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/instance';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      isCartOpen: false,
      isSearchOpen: false,
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      isDesktopSidebarOpen: true, // Desktop default OPEN
      isMobileSidebarOpen: false, // Mobile default CLOSED

      toggleDesktopSidebar: () => set((state) => ({ isDesktopSidebarOpen: !state.isDesktopSidebarOpen })),
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      // Unified Toggle for simplicity:
      toggleAdminSidebar: () => set((state) => {
        // Toggle both for simplicity, or handle logic in component. 
        // YouTube style: One button toggles the sidebar appropriate for that screen.
        // We'll toggle both flags, and components will listen to the one they care about.
        return {
          isDesktopSidebarOpen: !state.isDesktopSidebarOpen,
          isMobileSidebarOpen: !state.isMobileSidebarOpen
        };
      }),
      closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),

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
          const { data } = await api.post('/wishlist', { productId }, {
            headers: { Authorization: `Bearer ${state.user.token}` }
          });

          // 3. Final Sync (Optional, keeps consistent with DB)
          set({ user: { ...get().user, wishlist: data } });

        } catch (error) {
          console.error("Wishlist sync failed:", error);
          // 4. Rollback on Error
          set({ user: originalUser });
        }
      },

      addToCart: async (product) => {
        const state = get();
        const currentCart = state.user?.cart || [];

        // 1. Optimistic Update
        const existingItem = currentCart.find((item) => {
          const sameId = item._id === product._id;
          const sameVariant = JSON.stringify(item.selectedVariant) === JSON.stringify(product.selectedVariant);
          return sameId && sameVariant;
        });

        let updatedCart;
        if (existingItem) {
          updatedCart = currentCart.map((item) => {
            const sameId = item._id === product._id;
            const sameVariant = JSON.stringify(item.selectedVariant) === JSON.stringify(product.selectedVariant);
            if (sameId && sameVariant) {
              return { ...item, quantity: item.quantity + (product.quantity || 1) };
            }
            return item;
          });
        } else {
          updatedCart = [...currentCart, { ...product, quantity: product.quantity || 1 }];
        }

        set({ user: state.user ? { ...state.user, cart: updatedCart } : null });

        // 2. Backend Sync
        if (state.user?.token) {
          try {
            await api.post('/cart/add', {
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: product.quantity || 1,
              selectedVariant: product.selectedVariant
            }, { headers: { Authorization: `Bearer ${state.user.token}` } });
          } catch (err) {
            console.error("Cart sync failed:", err);
          }
        }
      },

      setCart: (updatedCart) => set((state) => ({
        user: state.user ? { ...state.user, cart: updatedCart } : null
      })),

      toggleCart: (open) => set((state) => ({
        isCartOpen: typeof open === 'boolean' ? open : !state.isCartOpen
      })),

      coupon: null, // { code: string, discount: number }

      applyCoupon: (data) => set({ coupon: data }),
      removeCoupon: () => set({ coupon: null }),

      // FLASH SALE STATE
      flashSale: null,
      fetchFlashSale: async () => {
        try {
          const { data } = await api.get('/marketing/flash-sale');
          set({ flashSale: data });
        } catch (err) {
          console.error("Failed to fetch flash sale", err);
          set({ flashSale: null });
        }
      },

      // GLOBAL SCALE STATE (Phase 11)
      currency: 'INR',
      currencyRates: { 'INR': 1, 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0093 },

      setCurrency: (currency) => set({ currency }),
      setCurrencyRates: (rates) => set({ currencyRates: rates }),

      logout: () => {
        set({ user: null, coupon: null, flashSale: null });
        localStorage.removeItem('slook-storage');
      }
    }),
    {
      name: 'slook-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
