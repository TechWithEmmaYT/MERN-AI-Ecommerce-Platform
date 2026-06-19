import { z } from "zod";
import { PAYMENT_METHOD_VALUES } from "../constants/enums";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address ID is required"),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES as [string, ...string[]]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const getUserOrderByIdSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
});

export type GetUserOrderByIdInput = z.infer<typeof getUserOrderByIdSchema>;
