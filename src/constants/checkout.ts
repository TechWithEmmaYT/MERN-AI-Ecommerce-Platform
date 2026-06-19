export const CheckoutPaymentMethod = {
  CARD: "card",
  CASH_ON_DELIVERY: "cash_on_delivery",
} as const;

export type CheckoutPaymentMethod =
  (typeof CheckoutPaymentMethod)[keyof typeof CheckoutPaymentMethod];

export type CheckoutAddress = {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};