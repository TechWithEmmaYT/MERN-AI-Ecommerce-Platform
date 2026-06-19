import { Request, Response } from "express";
import mongoose from "mongoose";
import stripeClient from "../config/stripe.config";
import { envConfig } from "../config/env.config";
import OrderModel from "../models/order.model";
import CartModel from "../models/cart.model";
import ProductModel from "../models/product.model";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "../constants/enums";

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      envConfig.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    res.status(400).json({ message: "Webhook signature verification failed" });
    return;
  }

  const session = event.data.object as {
    metadata?: { orderId?: string };
  };
  const orderId = session.metadata?.orderId;

  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    res.status(200).json({ received: true });
    return;
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    res.status(200).json({ received: true });
    return;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.status = ORDER_STATUS.CONFIRMED;
      order.statusHistory.push({
        status: ORDER_STATUS.CONFIRMED,
        date: new Date(),
      });

      await order.save();

      await CartModel.deleteOne({ userId: order.userId });

      for (const item of order.items) {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stockCount: -item.quantity },
        });
      }

      console.log(`Order ${order.orderNo} paid and confirmed`);
      break;
    }

    case "checkout.session.expired": {
      order.paymentStatus = PAYMENT_STATUS.FAILED;
      order.status = ORDER_STATUS.CANCELLED;
      order.statusHistory.push({
        status: ORDER_STATUS.CANCELLED,
        date: new Date(),
      });

      await order.save();

      console.log(`Order ${order.orderNo} payment expired`);
      break;
    }
  }

  res.status(200).json({ received: true });
};
