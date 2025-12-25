// ============================================
// SANII WORLD - Type Definitions
// ============================================

// User & Auth
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  phone?: string;
  addresses?: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // "Maison", "Bureau"
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
}

// Categories & SubCategories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  parentId?: string; // null = catégorie principale, sinon = sous-catégorie
  order: number;
  isActive: boolean;
  createdAt: string;
}

// Product Options (Taille, Couleur, Matière, etc.)
export interface ProductOption {
  id: string;
  name: string; // "Taille", "Couleur", "Matière"
  type: 'select' | 'color' | 'button';
  order: number;
}

export interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string; // "S", "M", "L", "Noir", "Rose"
  displayValue?: string;
  colorHex?: string; // Pour type color
  order: number;
}

// Product avec variantes
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  basePrice: number;
  coverImage: string;
  gallery: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  optionValues: { optionId: string; valueId: string }[]; // ex: [{optionId: "size", valueId: "m"}, {optionId: "color", valueId: "black"}]
  price?: number; // Override basePrice si différent
  stock: number;
  isActive: boolean;
}

// Inventory
export interface InventoryLog {
  id: string;
  variantId: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reason: string;
  createdAt: string;
}

// Orders avec variantes
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: string;
  variantDetails: string; // "Taille: M, Couleur: Noir"
  coverImage: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingMethod: 'click-collect' | 'dakar' | 'hors-dakar';
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'online' | 'on-delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Shipping & Tracking
export interface ShippingConfig {
  id: string;
  method: 'click-collect' | 'dakar' | 'hors-dakar';
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
  isActive: boolean;
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier?: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  createdAt: string;
  deliveredAt?: string;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  orderId: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

// Returns & Exchanges
export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  type: 'return' | 'exchange';
  reason: string;
  items: { orderItemId: string; quantity: number; reason?: string }[];
  status: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded' | 'exchanged';
  adminNotes?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Wishlist
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  createdAt: string;
}

// Coupons
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

// Notifications
export interface NotificationEvent {
  id: string;
  orderId: string;
  type: 'email' | 'whatsapp' | 'sms';
  event: 'order-confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'incident' | 'cancelled';
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}

// Cart Item (local)
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantDetails: string;
  price: number;
  quantity: number;
  coverImage: string;
  stock: number;
}

// Filters
export interface ProductFilters {
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  optionFilters?: { optionId: string; valueIds: string[] }[]; // ex: Taille: [S, M], Couleur: [Noir]
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
}