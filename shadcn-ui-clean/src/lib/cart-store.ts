import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          });
        } else {
          // Add new item
          set({ items: [...items, item] });
        }
      },

      removeItem: (itemId: string) => {
        set({ items: get().items.filter((i) => i.id !== itemId) });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.id === itemId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);