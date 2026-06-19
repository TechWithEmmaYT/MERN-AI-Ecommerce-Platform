export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export const USER_ROLE_VALUES = Object.values(USER_ROLES);

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

export const ORDER_STATUS = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  ASSIGNED: "assigned",
  PACKED: "packed",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);


export const PAYMENT_METHODS = {
  CARD: "card",
  CASH_ON_DELIVERY: "cash_on_delivery",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHODS);
