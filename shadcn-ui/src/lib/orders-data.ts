export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: 'cash' | 'mobile';
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  orderStatus: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
}

// Mock orders for demonstration
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'client-1',
    customerName: 'Client Test',
    customerPhone: '+221 77 123 45 67',
    customerAddress: 'Dakar, Plateau',
    items: [
      {
        productId: '1',
        productName: 'Smartphone Samsung Galaxy A54',
        quantity: 1,
        price: 185000,
      },
    ],
    totalAmount: 185000,
    paymentMethod: 'mobile',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: '2024-12-20T10:30:00Z',
  },
  {
    id: 'order-2',
    userId: 'client-1',
    customerName: 'Client Test',
    customerPhone: '+221 77 123 45 67',
    customerAddress: 'Dakar, Plateau',
    items: [
      {
        productId: '4',
        productName: 'Boubou Traditionnel Homme',
        quantity: 2,
        price: 45000,
      },
    ],
    totalAmount: 90000,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    createdAt: '2024-12-22T14:15:00Z',
  },
];

const orders = [...mockOrders];

export const getOrders = () => orders;

export const getOrdersByUserId = (userId: string) => {
  return orders.filter((order) => order.userId === userId);
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
      ...(paymentStatus && { paymentStatus }),
    };
    return orders[orderIndex];
  }
  return null;
};