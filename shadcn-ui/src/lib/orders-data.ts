export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
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

// Mock orders for demonstration
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'client-1',
    orderNumber: 'SW2024001',
    customerName: 'Client Test',
    customerPhone: '+221 77 123 45 67',
    customerAddress: 'Dakar, Plateau',
    items: [
      {
        productId: '1',
        productName: 'Smartphone Samsung Galaxy A54',
        quantity: 1,
        price: 185000,
        coverImage: '/images/Smartphone.jpg',
      },
    ],
    subtotal: 185000,
    shippingCost: 2000,
    discount: 0,
    total: 187000,
    totalAmount: 187000,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'delivered',
    orderStatus: 'delivered',
    shippingMethod: 'dakar',
    shippingInfo: {
      fullName: 'Client Test',
      email: 'client@test.com',
      phone: '+221 77 123 45 67',
      address: 'Plateau',
      city: 'Dakar',
      postalCode: '10000',
    },
    createdAt: '2024-12-20T10:30:00Z',
  },
];

const orders = [...mockOrders];

export const getOrders = () => orders;

export const getAllOrders = () => orders;

export const getOrdersByUserId = (userId: string) => {
  return orders.filter((order) => order.userId === userId);
};

export const getOrderById = (orderId: string) => {
  return orders.find((order) => order.id === orderId);
};

export const addOrder = (order: Order) => {
  orders.push(order);
  return order;
};

export const updateOrderStatus = (
  orderId: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
) => {
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex] = {
      ...orders[orderIndex],
      orderStatus,
      status: orderStatus,
      ...(paymentStatus && { paymentStatus }),
    };
    return orders[orderIndex];
  }
  return null;
};