
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "assigned"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";


export const orderStatusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  assigned: "Assigned",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};