// shadcn-ui/src/lib/orders-api.ts
export const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

export type CreateOrderItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingMethod: "click-collect" | "dakar" | "hors-dakar";
  shippingAddress?: string;
  paymentMethod: "online" | "on-delivery";
  items: CreateOrderItem[];
  couponCode?: string;
  notes?: string;
  discount?: number;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingMethod?: string;
  shippingAddress?: string;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt?: string;
};

export type ApiOrderItem = {
  id?: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number; // unit price
  productName: string;
  variantDetails?: string | null;
  coverImage?: string | null;
};

function normalizeOrder(o: any): ApiOrder {
  return {
    id: o.id,
    orderNumber: o.orderNumber ?? o.order_number,
    customerName: o.customerName ?? o.customer_name,
    customerEmail: o.customerEmail ?? o.customer_email,
    customerPhone: o.customerPhone ?? o.customer_phone,
    shippingMethod: o.shippingMethod ?? o.shipping_method,
    shippingAddress: o.shippingAddress ?? o.shipping_address,
    shippingCost: Number(o.shippingCost ?? o.shipping_cost ?? 0),
    subtotal: Number(o.subtotal ?? 0),
    discount: Number(o.discount ?? 0),
    total: Number(o.total ?? 0),
    paymentStatus: o.paymentStatus ?? o.payment_status,
    orderStatus: o.orderStatus ?? o.order_status,
    createdAt: o.createdAt ?? o.created_at,
  };
}

function normalizeItem(i: any): ApiOrderItem {
  return {
    id: i.id,
    productId: i.productId ?? i.product_id,
    variantId: i.variantId ?? i.variant_id,
    quantity: Number(i.quantity ?? 1),
    price: Number(i.price ?? i.unitPrice ?? i.unit_price ?? 0),
    productName: i.productName ?? i.product_name,
    variantDetails: i.variantDetails ?? i.variant_details ?? null,
    coverImage: i.coverImage ?? i.cover_image ?? null,
  };
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: "INVALID_JSON", raw: text };
  }
}

export async function createOrder(payload: CreateOrderPayload) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok || !data?.ok) {
    const err = data?.error || `HTTP_${res.status}`;
    throw new Error(err);
  }

  return {
    order: normalizeOrder(data.order),
    items: Array.isArray(data.items) ? data.items.map(normalizeItem) : [],
  };
}

export async function getOrderById(orderId: string) {
  const res = await fetch(`${API_URL}/orders/${encodeURIComponent(orderId)}`, {
    credentials: "include",
  });

  const data = await safeJson(res);
  if (!res.ok || !data?.ok) {
    const err = data?.error || `HTTP_${res.status}`;
    throw new Error(err);
  }

  return {
    order: normalizeOrder(data.order),
    items: Array.isArray(data.items) ? data.items.map(normalizeItem) : [],
  };
}
