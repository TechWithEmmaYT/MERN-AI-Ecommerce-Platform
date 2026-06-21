import mongoose from "mongoose";
import ReviewModel from "../models/review.model";
import OrderModel from "../models/order.model";
import ProductModel from "../models/product.model";
import { CreateReviewInput } from "../validators/review.validator";
import {
  BadRequestException,
  NotFoundException,
} from "../utils/app-error";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants/enums";

export const createReviewService = async (
  userId: string,
  data: CreateReviewInput
) => {
  const { orderId, orderItemId, rating, comment } = data;

  if (
    !mongoose.isValidObjectId(orderId) ||
    !mongoose.isValidObjectId(orderItemId)
  ) {
    throw new BadRequestException("Invalid order or item ID");
  }

  const order = await OrderModel.findOne({
    _id: orderId,
    userId,
  });
  if (!order) {
    throw new NotFoundException("Order not found");
  }

  if (
    order.status !== ORDER_STATUS.DELIVERED ||
    order.paymentStatus !== PAYMENT_STATUS.PAID
  ) {
    throw new BadRequestException(
      "Order must be delivered and paid to leave a review"
    );
  }

  const orderItem = order.items.find(
    (item) => item._id?.toString() === orderItemId
  );
  if (!orderItem) {
    throw new NotFoundException("Order item not found in this order");
  }

  const existingReview = await ReviewModel.findOne({ orderItemId });
  if (existingReview) {
    throw new BadRequestException("You have already reviewed this item");
  }

  const session = await mongoose.startSession();

  const review = await session.withTransaction(async () => {
    const [created] = await ReviewModel.create(
      [
        {
          userId,
          orderId,
          orderItemId,
          productId: orderItem.productId,
          rating,
          comment,
        },
      ],
      { session }
    );

    await OrderModel.updateOne(
      { _id: orderId, "items._id": orderItemId },
      { $set: { "items.$.isReviewed": true } },
      { session }
    );

    const [aggResult] = await ReviewModel.aggregate([
      { $match: { productId: orderItem.productId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]).session(session);

    const newAverage =
      aggResult?.averageRating != null
        ? Math.round(aggResult.averageRating * 10) / 10
        : 0;
    const newCount = aggResult?.totalReviews ?? 0;

    await ProductModel.updateOne(
      { _id: orderItem.productId },
      {
        $set: {
          ratingAverage: newAverage,
          reviewCount: newCount,
        },
      },
      { session }
    );

    return created;
  });

  session.endSession();

  if (!review) {
    throw new BadRequestException("Failed to create review");
  }

  return { review };
};

export const getUserReviewsService = async (userId: string) => {
  const reviews = await ReviewModel.find({ userId })
    .populate("productId", "name slug images")
    .sort({ createdAt: -1 })
    .lean();

  return { reviews };
};

export const getUserReviewableOrderItemsService = async (
  userId: string
) => {
  const orders = await OrderModel.find({
    userId,
    status: ORDER_STATUS.DELIVERED,
    paymentStatus: PAYMENT_STATUS.PAID,
    "items.isReviewed": false,
  })
    .sort({ createdAt: -1 })
    .select("_id items orderNo createdAt")
    .lean();

     const filteredOrders = orders.map(order => ({
    ...order,
    items: order.items.filter(item => item.isReviewed === false)
  }));

  return { orders:filteredOrders };
};
