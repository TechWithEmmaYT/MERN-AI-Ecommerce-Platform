import OrderModel from "../models/order.model";
import UserModel from "../models/user.model";
import ProductModel from "../models/product.model";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants/enums";
import {
  GetAdminOrdersInput,
  UpdateOrderStatusBodyInput,
  UpdateOrderStatusParamsInput,
} from "../validators/admin.validator";
import { NotFoundException } from "../utils/app-error";

export const getAdminAnalyticsService = async () => {
  const [totalOrders, totalUsers, totalProducts, outOfStockProducts, totalSalesResult] =
    await Promise.all([
      OrderModel.countDocuments(),
      UserModel.countDocuments(),
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ stockCount: { $lte: 0 } }),
      OrderModel.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

  const totalSales = totalSalesResult[0]?.total ?? 0;

  return {
    totalSales,
    totalOrders,
    totalUsers,
    totalProducts,
    totalOutOfStock: outOfStockProducts,
  };
};


export const getAdminOrdersService = async ({
  page,
  limit,
}: GetAdminOrdersInput) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    OrderModel.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    OrderModel.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
};

export const updateOrderStatusService = async (
  params: UpdateOrderStatusParamsInput,
  body: UpdateOrderStatusBodyInput
) => {
  const order = await OrderModel.findById(params.id);

  if (!order) throw new NotFoundException("Order not found");

  const statusExistsInHistory = order.statusHistory.some(
    (entry) => entry.status === body.status
  );

  if (!statusExistsInHistory) {
    order.statusHistory.push({
      status: body.status as any,
      note: body.note ||`Status updated to ${body.status} by admin`,
      date: new Date(),
    });
  }

  order.status = body.status as any;

  if (order.status === ORDER_STATUS.DELIVERED && order.paymentStatus !== PAYMENT_STATUS.PAID) {
    order.paymentStatus = PAYMENT_STATUS.PAID;
  }

  await order.save();

  return { order };
};

