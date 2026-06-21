import type { ProductType } from "./products.type";

export type CartitemType = {
  _id: string;
  productId: ProductType;
  quantity: number;
};

export type CartResponseType = {
  message: string;
  cart: {
    _id: string;
    userId: string | null;
    guestCartId: string | null;
    items: CartitemType[];
    createdAt: string;
    updatedAt: string;
  } | null;
  subtotal: number;
  deliveryFee:number;
  freeDeliveryThreshold:number;
  tax:number; 
  orderTotal:number;
};