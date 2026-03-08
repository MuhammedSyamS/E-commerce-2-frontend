import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/instance';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      wishlist: [], // Guest Vault (Persists even if logged out)
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
        const productId = (product._id || product).toString();

        // CASE A: LOGGED IN USER
        if (state.user) {
          const originalUser = state.user;
          const currentWishlist = state.user.wishlist || [];

          const exists = currentWishlist.some(item =>
            (item._id || item).toString() === productId
          );

          // 1. Optimistic Update
          let newWishlist;
          if (exists) {
            newWishlist = currentWishlist.filter(item =>
              (item._id || item).toString() !== productId
            );
          } else {
            newWishlist = [...currentWishlist, product];
          }

          set({ user: { ...state.user, wishlist: newWishlist } });

          // 2. Backend Sync
          try {
            const { data } = await api.post('/wishlist', { productId }, {
              headers: { Authorization: `Bearer ${state.user.token}` }
            });
            set({ user: { ...get().user, wishlist: data } });
          } catch (error) {
            console.error("Wishlist sync failed:", error);
            set({ user: originalUser });
          }
        }
        // CASE B: GUEST USER
        else {
          const currentWishlist = state.wishlist || [];
          const exists = currentWishlist.some(item =>
            (item._id || item).toString() === productId
          );

          let newWishlist;
          if (exists) {
            newWishlist = currentWishlist.filter(item =>
              (item._id || item).toString() !== productId
            );
          } else {
            newWishlist = [...currentWishlist, product];
          }

          set({ wishlist: newWishlist });
        }
      },

      cart: [], // Add guest cart
      addToCart: async (product) => {
        const state = get();
        const currentCart = state.user ? (state.user.cart || []) : state.cart;
        const productId = product._id;

        const isSameVariant = (v1, v2) => {
          if (!v1 && !v2) return true;
          if (!v1 || !v2) return false;
          return String(v1.size || '').toLowerCase() === String(v2.size || '').toLowerCase() &&
            String(v1.color || '').toLowerCase() === String(v2.color || '').toLowerCase();
        };

        const existingItem = currentCart.find((item) => {
          const itemProductId = (item.product?._id || item.product || item._id || '').toString();
          const sameId = itemProductId === (productId || '').toString();
          const sameVariant = isSameVariant(item.selectedVariant, product.selectedVariant);
          return sameId && sameVariant;
        });

        let updatedCart;
        if (existingItem) {
          updatedCart = currentCart.map((item) => {
            const itemProductId = (item.product?._id || item.product || item._id || '').toString();
            const sameId = itemProductId === productId;
            const sameVariant = isSameVariant(item.selectedVariant, product.selectedVariant);
            if (sameId && sameVariant) {
              return { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) };
            }
            return item;
          });
        } else {
          // Store with `product` field to match backend format
          updatedCart = [...currentCart, { ...product, product: productId, quantity: product.quantity || 1 }];
        }

        if (state.user) {
          set({ user: { ...state.user, cart: updatedCart }, isCartOpen: true });
        } else {
          set({ cart: updatedCart, isCartOpen: true });
        }

        // 2. Backend Sync
        if (state.user?.token) {
          try {
            const { data } = await api.post('/cart/add', {
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: product.quantity || 1,
              selectedVariant: product.selectedVariant
            }, { headers: { Authorization: `Bearer ${state.user.token}` } });
            // Sync with backend response to get correct _id fields
            set({ user: { ...get().user, cart: data }, isCartOpen: true });
          } catch (err) {
            console.error("Cart sync failed:", err);
          }
        }
      },

      setCart: (updatedCart) => set((state) => {
        if (state.user) return { user: { ...state.user, cart: updatedCart } };
        return { cart: updatedCart };
      }),

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
        // Only clear session-specific data, keep 'wishlist' and 'cart' (guest versions)
        set({
          user: null,
          coupon: null,
          flashSale: null
        });
        // Do NOT remove slook-storage entirely, just let the state persist naturally
      },

      // Refresh user data from server (keeps loyalty points, tier, cart in sync)
      refreshUser: async () => {
        const state = get();
        if (!state.user?.token) return;
        try {
          const { data } = await api.get('/users/profile', {
            headers: { Authorization: `Bearer ${state.user.token}` }
          });
          set({ user: { ...data, token: state.user.token } });
        } catch (err) {
          console.error('refreshUser failed:', err);
        }
      },

      syncGuestWishlist: async () => {
        const state = get();
        if (!state.user?.token || !state.wishlist?.length) return;

        console.log("Syncing guest wishlist to account...");
        const guestItems = state.wishlist;

        try {
          const productIds = guestItems.map(item => (item._id || item).toString());
          const { data } = await api.post('/users/wishlist/bulk', { productIds }, {
            headers: { Authorization: `Bearer ${state.user.token}` }
          });

          // Update user wishlist and CLEAR guest wishlist
          set({
            user: { ...get().user, wishlist: data },
            wishlist: []
          });
          console.log("Guest wishlist synced successfully.");
        } catch (err) {
          console.error("Failed to sync guest wishlist:", err);
        }
      }
    }),
    {
      name: 'slook-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the bare minimum - full user data (populated wishlists,
      // notifications, cart arrays) is too large for localStorage (5MB limit).
      // Essential session data is persisted; everything else is re-fetched from
      // the server on next load via refreshUser().
      partialize: (state) => ({
        // Guest cart (not tied to user account)
        cart: (state.cart || []).map(item => ({
          _id: item._id,
          product: item.product?._id || item.product,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant
        })),
        // Guest wishlist (just IDs, not full product objects)
        wishlist: (state.wishlist || []).map(item => item._id || item),
        // Applied coupon
        coupon: state.coupon,
        // Currency preference
        currency: state.currency,
        // Slim user: only auth token + basic non-array identity fields
        user: state.user ? {
          _id: state.user._id,
          firstName: state.user.firstName,
          lastName: state.user.lastName,
          email: state.user.email,
          phone: state.user.phone,
          token: state.user.token,
          isAdmin: state.user.isAdmin,
          role: state.user.role,
          permissions: state.user.permissions,
          avatar: state.user.avatar,
          loyaltyPoints: state.user.loyaltyPoints,
          membershipTier: state.user.membershipTier,
          totalSpent: state.user.totalSpent,
          referralCode: state.user.referralCode,
          // Persist cart items but without full product population
          cart: (state.user.cart || []).map(item => ({
            _id: item._id,
            product: item.product?._id || item.product,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant
          })),
        } : null,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate store, clearing corrupt storage:', error);
          try { localStorage.removeItem('slook-storage'); } catch { }
        }
      }
    }
  )
);
