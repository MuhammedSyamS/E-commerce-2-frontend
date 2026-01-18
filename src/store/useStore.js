import { create } from 'zustand';

export const useStore = create((set) => ({
  cart: [],
  isCartOpen: false,
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item._id === product._id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        ),
        isCartOpen: true
      };
    }
    return { cart: [...state.cart, { ...product, qty: 1 }], isCartOpen: true };
  }),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item._id !== id)
  })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));