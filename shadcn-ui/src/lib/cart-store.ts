// src/lib/cart-store.ts
import { useSyncExternalStore } from "react";
import { cart, type CartItem } from "@/lib/cart";

type CartState = {
  items: CartItem[];
  subtotal: number;
  count: number;

  // ✅ pour ton Header actuel
  getTotalItems: () => number;

  // actions
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (id: string, qty: number, variantId?: string | null) => void;
  remove: (id: string, variantId?: string | null) => void;
  clear: () => void;
};

const KEY = "samani_cart_v1";

// cache pour éviter warning React "getSnapshot should be cached"
let cachedRaw: string | null = null;
let cachedState: CartState | null = null;

function safeParse(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function computeState(items: CartItem[]): CartState {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const count = items.reduce((sum, it) => sum + it.qty, 0);

  return {
    items,
    subtotal,
    count,
    getTotalItems: () => count,

    add: cart.add,
    updateQty: cart.updateQty,
    remove: cart.remove,
    clear: cart.clear,
  };
}

function getSnapshot(): CartState {
  const raw = localStorage.getItem(KEY) || "[]";
  if (raw !== cachedRaw || !cachedState) {
    cachedRaw = raw;
    const items = safeParse(raw);
    cachedState = computeState(items);
  }
  return cachedState;
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("cart:changed", handler);
  return () => window.removeEventListener("cart:changed", handler);
}

export function useCartStore<T>(selector: (s: CartState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot())
  );
}
