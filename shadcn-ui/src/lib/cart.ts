// src/lib/cart.ts
export type CartItem = {
  id: string; // productId (UUID Product)
  name: string;
  slug?: string;
  price: number;
  qty: number;

  // Important pour la DB: NOT NULL variant_id
  variantId?: string | null;

  // Affichage images
  cover_image?: string | null;

  // Ex: "size:s|color:black"
  variantDetails?: string | null;
};

const KEY = "samani_cart_v1";

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export function money(x: number) {
  return `${Number(x || 0).toLocaleString("fr-FR")} FCFA`;
}

export const cart = {
  get(): CartItem[] {
    return read();
  },

  set(items: CartItem[]) {
    write(items);
  },

  clear() {
    write([]);
  },

  totals() {
    const items = read();
    const count = items.reduce((s, it) => s + (it.qty || 0), 0);
    const subtotal = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0);
    return { count, subtotal };
  },

  add(item: Omit<CartItem, "qty"> & { qty?: number }) {
    const items = read();
    const qty = item.qty ?? 1;

    // clé unique = produit + variante
    const key = `${item.id}::${item.variantId || ""}`;
    const idx = items.findIndex((x) => `${x.id}::${x.variantId || ""}` === key);

    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    } else {
      items.push({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: Number(item.price || 0),
        qty: Number(qty || 1),
        variantId: item.variantId ?? null,
        cover_image: item.cover_image ?? null,
        variantDetails: item.variantDetails ?? null,
      });
    }

    write(items);
  },

  updateQty(productId: string, qty: number, variantId?: string | null) {
    const items = read();
    const key = `${productId}::${variantId || ""}`;
    const idx = items.findIndex((x) => `${x.id}::${x.variantId || ""}` === key);
    if (idx < 0) return;

    const nextQty = Math.max(0, qty);
    if (nextQty === 0) {
      items.splice(idx, 1);
    } else {
      items[idx] = { ...items[idx], qty: nextQty };
    }
    write(items);
  },

  remove(productId: string, variantId?: string | null) {
    const items = read();
    const key = `${productId}::${variantId || ""}`;
    const next = items.filter((x) => `${x.id}::${x.variantId || ""}` !== key);
    write(next);
  },
};
