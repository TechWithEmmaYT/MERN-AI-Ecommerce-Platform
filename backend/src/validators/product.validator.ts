import { z } from "zod";

export const getProductsSchema = z.object({
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  hasDiscount: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  inStock: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(["best-match", 
      "price-low", 
      "price-high", 
      "highest-rating"])
    .default("best-match"),
  keyword: z.string().optional(),
  skip: z.coerce.number().int().min(0).optional(),
});

export type GetProductsInput = z.infer<typeof getProductsSchema>;

export const getDealsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type GetDealsInput = z.infer<typeof getDealsSchema>;

export const getProductBySlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type GetProductBySlugInput = z.infer<typeof getProductBySlugSchema>;

export const getProductReviewsSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type GetProductReviewsInput = z.infer<typeof getProductReviewsSchema>;

export const createProductSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  images: z.array(z.string()).default([]),
  originalPrice: z.number().min(0),
  discountPercent: z.number().min(0).max(100).default(0),
  discountLabel: z.string().optional(),
  unit: z.string().default("pc"),
  stockCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const getProductsForAdminSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GetProductsForAdminInput = z.infer<
  typeof getProductsForAdminSchema
>;
