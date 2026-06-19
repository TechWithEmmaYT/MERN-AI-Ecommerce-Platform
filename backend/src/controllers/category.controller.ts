import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getCategoriesService } from "../services/category.service";

export const getCategoriesController = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await getCategoriesService();

    res.status(HTTPSTATUS.OK).json({
      message: "Categories retrieved successfully",
      ...result,
    });
  }
);
