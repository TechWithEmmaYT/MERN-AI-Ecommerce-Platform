export type OrderItemType = {
  productId: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  quantity: number;
};

export type OrderAddressSnapshot = {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
};

export type OrderStatusHistoryType = {
  status: string;
  note?: string;
  createdAt: string;
};

export type OrderType = {
  _id: string;
  userId: string;
  orderNo: string;
  items: OrderItemType[];
  shippingAddress: OrderAddressSnapshot;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  statusHistory?: OrderStatusHistoryType[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  stripeCheckoutSessionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  addressId: string;
  paymentMethod: string;
};

export type CreateOrderResponse = {
  message: string;
  order: OrderType;
  stripeUrl: string | null;
};

export type GetOrdersResponse = {
  message: string;
  orders: OrderType[];
};

export type GetOrderByIdResponse = {
  message: string;
  order: OrderType;
};
