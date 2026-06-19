import { z } from "zod";
import { ORDER_STATUS, ORDER_STATUS_VALUES } from "../constants/enums";

const VALID_ADMIN_ORDER_STATUS_VALUES = ORDER_STATUS_VALUES.filter(
  (status) => status !== ORDER_STATUS.PLACED
) as [string, ...string[]];

export const getAdminOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GetAdminOrdersInput = z.infer<typeof getAdminOrdersSchema>;

export const updateOrderStatusParamsSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
});

export type UpdateOrderStatusParamsInput = z.infer<
  typeof updateOrderStatusParamsSchema
>;

export const updateOrderStatusBodySchema = z.object({
  status: z.enum(VALID_ADMIN_ORDER_STATUS_VALUES),
  note: z.string().optional(),
});

export type UpdateOrderStatusBodyInput = z.infer<typeof updateOrderStatusBodySchema>;
