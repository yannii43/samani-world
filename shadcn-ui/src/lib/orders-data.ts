
import { v4 as uuidv4 } from 'uuid';

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    quantity: number;
    price: number;
    coverImage: string;
    variantDetails?: string;
  }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderStatus: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  shippingMethod: string;
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
    notes?: string;
  };
  couponCode?: string;
  createdAt: string;
  notes?: string;
}

type CreateOrderInput = {
  userId: string;
  items: Order['items'];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingMethod: string;
  paymentMethod: Order['paymentMethod'];
  couponCode?: string;
  shippingInfo: Order['shippingInfo'];
};

const STORAGE_KEY = 'samani_orders_v1';

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const loadOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  const parsed = safeParse<Order[]>(localStorage.getItem(STORAGE_KEY));
  return Array.isArray(parsed) ? parsed : [];
};

let orders: Order[] = loadOrders();

const saveOrders = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

const generateOrderNumber = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rnd = String(Math.floor(Math.random() * 9000) + 1000);
  return `SW${yyyy}${mm}${dd}-${rnd}`;
};

export const getOrders = () => orders;
export const getAllOrders = () => orders;

export const getOrdersByUserId = (userId: string) => {
  return orders.filter((order) => order.userId === userId);
};

export const getOrderById = (orderId: string) => {
  return orders.find((order) => order.id === orderId);
};

export const addOrder = (input: CreateOrderInput): Order => {
  const now = new Date().toISOString();

  const order: Order = {
    id: `order-${uuidv4()}`,
    userId: input.userId || 'guest',
    orderNumber: generateOrderNumber(),

    customerName: input.shippingInfo.fullName,
    customerPhone: input.shippingInfo.phone,
    customerAddress: input.shippingInfo.address ?? '',

    items: input.items,
    subtotal: input.subtotal,
    shippingCost: input.shippingCost,
    discount: input.discount,
    total: input.total,
    totalAmount: input.total,

    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === 'cash' ? 'pending' : 'paid',

    status: 'pending',
    orderStatus: 'pending',

    shippingMethod: input.shippingMethod,
    shippingInfo: input.shippingInfo,

    couponCode: input.couponCode,
    createdAt: now,
    notes: input.shippingInfo.notes,
  };

  orders = [order, ...orders];
  saveOrders();
  return order;
};

export const updateOrderStatus = (
  orderId: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
) => {
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;

  const updated: Order = {
    ...orders[idx],
    orderStatus,
    status: orderStatus === 'delivered' ? 'delivered' : orderStatus,
    ...(paymentStatus ? { paymentStatus } : {}),
  };

  orders = orders.map((o, i) => (i === idx ? updated : o));
  saveOrders();
  return updated;
};

export const clearAllOrders = () => {
  orders = [];
  saveOrders();
};

