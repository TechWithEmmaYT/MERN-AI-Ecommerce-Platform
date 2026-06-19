import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  getProductsSchema,
  getDealsSchema,
  getProductBySlugSchema,
  getProductReviewsSchema,
} from "../validators/product.validator";
import {
  getProductsService,
  getDealsService,
  getProductBySlugService,
  getProductReviewsService,
} from "../services/product.service";

export const getProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getProductsSchema.parse(req.query);
    const result = await getProductsService(query);

    res.status(HTTPSTATUS.OK).json({
      message: "Products retrieved successfully",
      ...result,
    });
  }
);

export const getDealsController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getDealsSchema.parse(req.query);
    const result = await getDealsService(query);

    res.status(HTTPSTATUS.OK).json({
      message: "Deals retrieved successfully",
      ...result,
    });
  }
);

export const getProductBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const params = getProductBySlugSchema.parse(req.params);
    const result = await getProductBySlugService(params);

    res.status(HTTPSTATUS.OK).json({
      message: "Product retrieved successfully",
      ...result,
    });
  }
);

export const getProductReviewsController = asyncHandler(
  async (req: Request, res: Response) => {
    const params = getProductReviewsSchema.parse({
      slug: req.params.slug,
      page: req.query.page,
      limit: req.query.limit,
    });
    const result = await getProductReviewsService(params);

    res.status(HTTPSTATUS.OK).json({
      message: "Product reviews retrieved successfully",
      ...result,
    });
  }
);
