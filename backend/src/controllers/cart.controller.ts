import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { upsertCartSchema } from "../validators/cart.validator";
import { upsertCartService, getCartService } from "../services/cart.service";

export const upsertCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = upsertCartSchema.parse(req.body);
    const userId = req.user ? req.user._id.toString() : null;
    const guestCartId = req.guestCartId ?? null;

    const result = await upsertCartService(userId, guestCartId, data);

    res.status(HTTPSTATUS.OK).json({
      message: "Cart updated successfully",
      ...result,
    });
  }
);

export const getCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user ? req.user._id.toString() : null;
    const guestCartId = req.guestCartId ?? null;

    const result = await getCartService(userId, guestCartId);

    res.status(HTTPSTATUS.OK).json({
      message: "Cart retrieved successfully",
      ...result,
    });
  }
);
