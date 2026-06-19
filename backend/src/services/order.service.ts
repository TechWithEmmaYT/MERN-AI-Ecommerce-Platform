import mongoose from "mongoose";
import OrderModel from "../models/order.model";
import CartModel from "../models/cart.model";
import AddressModel from "../models/address.model";
import ProductModel from "../models/product.model";
import UserModel from "../models/user.model";
import { CreateOrderInput } from "../validators/order.validator";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { calculateCartTotals } from "../utils/cart.util";
import { PAYMENT_METHODS, PaymentMethod } from "../constants/enums";
import stripeClient from "../config/stripe.config";
import { envConfig } from "../config/env.config";


export const createOrderService = async (
  userId: string,
  data: CreateOrderInput
) => {
  const { addressId, paymentMethod } = data;

  const cart = await CartModel.findOne({ userId }).populate({
    path: "items.productId",
    select: "name slug images originalPrice discountPercent salePrice stockCount",
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new BadRequestException("Cart is empty");
  }

  const address = await AddressModel.findOne({ _id: addressId, userId });
  if (!address) {
    throw new NotFoundException("Address not found");
  }

  const items = cart.items as unknown as Array<{
    productId: {
      _id: mongoose.Types.ObjectId;
      name: string;
      images: string[];
      originalPrice: number;
      discountPercent: number;
      salePrice: number;
      stockCount: number;
    };
    quantity: number;
  }>;

  const totals = calculateCartTotals(items);

  const orderItems = items.map((item) => ({
    productId: item.productId._id,
    name: item.productId.name,
    image: item.productId.images?.[0] ?? "",
    originalPrice: item.productId.originalPrice,
    discountPercent: item.productId.discountPercent,
    salePrice: item.productId.salePrice,
    quantity: item.quantity,
  }));

  const shippingAddress = {
    recipientName: address.recipientName,
    phone: address.phone,
    street: address.street,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };

  const order = await OrderModel.create({
    userId,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod as PaymentMethod,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    tax: totals.tax,
    total: totals.orderTotal,
  });

  const orderDoc = order as import("mongoose").Document & { _id: mongoose.Types.ObjectId };

  if (paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY) {
    await CartModel.deleteOne({ userId });

   await Promise.all(
      items.map((item) =>
        ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stockCount: -item.quantity },
        })
      )
    );

    return { order: orderDoc, stripeUrl: null };
  }

  const lineItems: Array<{
    price_data: {
      currency: string;
      product_data: { name: string; images?: string[] };
      unit_amount: number;
    };
    quantity: number;
  }> = orderItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.salePrice * 100),
    },
    quantity: item.quantity,
  }));

  if (totals.deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Delivery Fee" },
        unit_amount: Math.round(totals.deliveryFee * 100),
      },
      quantity: 1,
    });
  }

  if (totals.tax > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Tax" },
        unit_amount: Math.round(totals.tax * 100),
      },
      quantity: 1,
    });
  }

  const user = await UserModel.findById(userId).select("email").lean();
  const customerEmail = user?.email;

  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: lineItems,
    metadata: { 
      orderId: orderDoc._id.toString()
    },
    success_url: `${envConfig.FRONTEND_ORIGIN}/orders/${orderDoc._id}`,
    cancel_url: `${envConfig.FRONTEND_ORIGIN}/checkout`,
  });

  return { stripeUrl: session.url! };
};

export const getUserOrdersService = async (userId: string) => {
  const orders = await OrderModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return { orders };
};

export const getUserOrderByIdService = async (
  userId: string,
  orderId: string
) => {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new BadRequestException("Invalid order ID");
  }
  const order = await OrderModel.findOne({ _id: orderId, userId }).lean();
  if (!order) {
    throw new NotFoundException("Order not found");
  }

  return { order };
};
