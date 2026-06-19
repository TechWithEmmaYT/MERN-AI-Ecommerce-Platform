import { z } from "zod";

export const createReviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  orderItemId: z.string().min(1, "Order Item ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
