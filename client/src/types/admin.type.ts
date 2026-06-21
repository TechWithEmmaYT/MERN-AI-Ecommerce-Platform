import type { OrderType } from "./order.type";
import type { ProductType } from "./products.type";

export type AdminAnalyticsType = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalOutOfStockProducts: number;
};

export type AdminAnalyticsResponse = {
  message: string;
} & AdminAnalyticsType;

export type AdminOrdersResponse = {
  message: string;
  orders: OrderType[];
};

export type AdminProductsResponse = {
  message: string;
  products: ProductType[];
};

export type UpdateOrderStatusInput = {
  status: string;
  note?: string;
};

export type UpdateOrderStatusResponse = {
  message: string;
  order: OrderType;
};
