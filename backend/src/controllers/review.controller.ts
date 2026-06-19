import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { createReviewSchema } from "../validators/review.validator";
import {
  createReviewService,
  getUserReviewsService,
  getUserReviewableOrderItemsService,
} from "../services/review.service";

export const createReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const data = createReviewSchema.parse(req.body);
    const result = await createReviewService(userId, data);

    res.status(HTTPSTATUS.CREATED).json({
      message: "Review created successfully",
      ...result,
    });
  }
);

export const getUserReviewsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await getUserReviewsService(userId);

    res.status(HTTPSTATUS.OK).json({
      message: "Reviews retrieved successfully",
      ...result,
    });
  }
);

export const getUserReviewableOrderItemsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await getUserReviewableOrderItemsService(userId);

    res.status(HTTPSTATUS.OK).json({
      message: "Reviewable order items retrieved successfully",
      ...result,
    });
  }
);
