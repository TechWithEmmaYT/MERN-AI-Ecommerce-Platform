import { z } from "zod";

export const upsertCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
});

export type UpsertCartInput = z.infer<typeof upsertCartSchema>;
