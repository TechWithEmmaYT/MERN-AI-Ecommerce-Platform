import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { createOrderSchema, getUserOrderByIdSchema } from "../validators/order.validator";
import {
  createOrderService,
  getUserOrdersService,
  getUserOrderByIdService,
} from "../services/order.service";

export const createOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const data = createOrderSchema.parse(req.body);
    const result = await createOrderService(userId, data);

    res.status(HTTPSTATUS.CREATED).json({
      message: "Order created successfully",
      ...result,
    });
  }
);

export const getUserOrdersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result = await getUserOrdersService(userId);

    res.status(HTTPSTATUS.OK).json({
      message: "Orders retrieved successfully",
      ...result,
    });
  }
);

export const getUserOrderByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const { id } = getUserOrderByIdSchema.parse({ id: req.params.id });
    const result = await getUserOrderByIdService(userId, id);

    res.status(HTTPSTATUS.OK).json({
      message: "Order retrieved successfully",
      ...result,
    });
  }
);
