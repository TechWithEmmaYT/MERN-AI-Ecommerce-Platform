import type { OrderType } from "@/types/order.type";
import {
  starterOrderStatuses,
  starterProducts,
} from "@/constants/products";
import { starterAddresses } from "@/constants/address";

export type OrderStatus = (typeof starterOrderStatuses)[number] | "assigned" | "cancelled";

export const orderStatusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  assigned: "Assigned",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const strawberry = starterProducts[0];
const juice = starterProducts[1];
const pantry = starterProducts[2];
const defaultAddress = starterAddresses[0];

export const starterOrders: OrderType[] = [
  {
    _id: "starter-order-1",
    userId: "starter-user",
    orderNo: "ORD-10021",
    items: [
      {
        productId: strawberry.id,
        name: strawberry.name,
        image: strawberry.images[0],
        originalPrice: strawberry.originalPrice,
        salePrice: strawberry.salePrice,
        quantity: 2,
      },
      {
        productId: juice.id,
        name: juice.name,
        image: juice.images[0],
        originalPrice: juice.originalPrice,
        salePrice: juice.salePrice,
        quantity: 1,
      },
    ],
    shippingAddress: {
      recipientName: defaultAddress.recipientName || "",
      phone: defaultAddress.phone,
      street: defaultAddress.street,
      city: defaultAddress.city,
      state: defaultAddress.state,
      postalCode: defaultAddress.postalCode,
      country: defaultAddress.country,
    },
    paymentMethod: "card",
    paymentStatus: "paid",
    status: "out_for_delivery",
    statusHistory: [
      { status: starterOrderStatuses[0], note: "Order placed successfully", createdAt: "2026-06-08T09:00:00.000Z" },
      { status: starterOrderStatuses[1], note: "Payment confirmed", createdAt: "2026-06-08T09:10:00.000Z" },
      { status: starterOrderStatuses[2], note: "Items packed and ready", createdAt: "2026-06-08T10:40:00.000Z" },
      { status: starterOrderStatuses[3], note: "Courier is on the way", createdAt: "2026-06-08T12:20:00.000Z" },
    ],
    subtotal: 16.97,
    deliveryFee: 0,
    tax: 1.02,
    discount: 0,
    total: 17.99,
    createdAt: "2026-06-08T09:00:00.000Z",
    updatedAt: "2026-06-08T12:20:00.000Z",
  },
  {
    _id: "starter-order-2",
    userId: "starter-user",
    orderNo: "ORD-10018",
    items: [
      {
        productId: pantry.id,
        name: pantry.name,
        image: pantry.images[0],
        originalPrice: pantry.originalPrice,
        salePrice: pantry.salePrice,
        quantity: 1,
      },
      {
        productId: strawberry.id,
        name: strawberry.name,
        image: strawberry.images[0],
        originalPrice: strawberry.originalPrice,
        salePrice: strawberry.salePrice,
        quantity: 1,
      },
    ],
    shippingAddress: {
      recipientName: starterAddresses[1].recipientName || "",
      phone: starterAddresses[1].phone,
      street: starterAddresses[1].street,
      city: starterAddresses[1].city,
      state: starterAddresses[1].state,
      postalCode: starterAddresses[1].postalCode,
      country: starterAddresses[1].country,
    },
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    status: "packed",
    statusHistory: [
      { status: starterOrderStatuses[0], note: "Order placed", createdAt: "2026-06-05T11:00:00.000Z" },
      { status: starterOrderStatuses[1], note: "Confirmed by store", createdAt: "2026-06-05T11:12:00.000Z" },
      { status: starterOrderStatuses[2], note: "Ready for dispatch", createdAt: "2026-06-05T14:25:00.000Z" },
    ],
    subtotal: 18.98,
    deliveryFee: 2.0,
    tax: 1.28,
    discount: 0,
    total: 22.26,
    createdAt: "2026-06-05T11:00:00.000Z",
    updatedAt: "2026-06-05T14:25:00.000Z",
  },
];

export const getStarterOrderById = (orderId: string) =>
  starterOrders.find((order) => order._id === orderId);
