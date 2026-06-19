import CartModel from "../models/cart.model";
import ProductModel from "../models/product.model";
import { UpsertCartInput } from "../validators/cart.validator";
import { BadRequestException } from "../utils/app-error";
import { calculateCartTotals } from "../utils/cart.util";
import { FREE_DELIVERY_THRESHOLD } from "../constants/constant";
import mongoose from "mongoose";

export const upsertCartService = async (
  userId: string | null,
  guestCartId: string | null,
  data: UpsertCartInput,
) => {
  if (!userId && !guestCartId) {
    throw new BadRequestException("User ID or guest cart ID is required");
  }

  const validItems: { productId: mongoose.Types.ObjectId; quantity: number }[] =
    [];
  const seenIds = new Set<string>();

  for (const item of data.items) {
    if (!item.productId || !mongoose.isValidObjectId(item.productId)) continue;
    if (seenIds.has(item.productId)) continue;
    seenIds.add(item.productId);
    validItems.push({
      productId: new mongoose.Types.ObjectId(item.productId),
      quantity: item.quantity,
    });
  }

  if (validItems.length === 0) {
    throw new BadRequestException("No valid products in cart");
  }

  const products = await ProductModel.find({
    _id: { $in: validItems.map((i) => i.productId) },
    isActive: true,
  })
    .select(
      "name slug images salePrice originalPrice discountPercent stockCount",
    )
    .lean();

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const filteredItems: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
  }[] = [];

  for (const item of validItems) {
    const product = productMap.get(item.productId.toString());
    if (!product) continue;
    filteredItems.push({
      productId: item.productId,
      quantity: Math.min(item.quantity, product.stockCount),
    });
  }

  if (filteredItems.length === 0) {
    throw new BadRequestException("No in-stock products found");
  }

  const query: Record<string, unknown> = userId
    ? { userId: new mongoose.Types.ObjectId(userId) }
    : { guestCartId };

  const update: Record<string, unknown> = { $set: { items: filteredItems } };
  if (userId) {
    update.$unset = { guestCartId: "" };
  }

  const cart = await CartModel.findOneAndUpdate(query, update, {
    upsert: true,
    new: true,
  })
    .populate({
      path: "items.productId",
      select:
        "name slug images salePrice originalPrice discountPercent stockCount",
    })
    .lean();

  if (!cart) {
    throw new BadRequestException("Failed to upsert cart");
  }

  const populatedItems = cart.items as unknown as Array<{
    productId: { salePrice: number; [key: string]: unknown };
    quantity: number;
  }>;

  const totals = calculateCartTotals(populatedItems);

  return { cart, ...totals };
};

export const getCartService = async (
  userId: string | null,
  guestCartId: string | null,
) => {
  if (!userId && !guestCartId) {
    throw new BadRequestException("User ID or guest cart ID is required");
  }

  const query: Record<string, unknown> = userId
    ? { userId: new mongoose.Types.ObjectId(userId) }
    : { guestCartId };

  const cart = await CartModel.findOne(query)
    .populate({
      path: "items.productId",
      select:
        "name slug images salePrice originalPrice discountPercent stockCount",
    })
    .lean();

  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      cart: {
        items: [],
      },
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      orderTotal: 0,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    };
  }

  const populatedItems = cart.items as unknown as Array<{
    productId: { salePrice: number; [key: string]: unknown };
    quantity: number;
  }>;

  const totals = calculateCartTotals(populatedItems);

  return { cart, ...totals };
};

export const mergeGuestCartService = async (
  userId: string,
  guestCartId: string | null
) => {
  if (!guestCartId) return;

  const guestCart = await CartModel.findOne({ guestCartId });
  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await CartModel.findOne({ userId: userId });

  if (!userCart) {
    await CartModel.updateOne(
      { guestCartId },
      {
        $set: { userId: userId },
        $unset: { guestCartId: "" },
      }
    );
    return;
  }

  const mergedItems = new Map<string, number>();

  for (const item of userCart.items) {
    mergedItems.set(item.productId.toString(), item.quantity);
  }

  for (const item of guestCart.items) {
    const existing = mergedItems.get(item.productId.toString());
    if (existing) {
      mergedItems.set(item.productId.toString(), existing + item.quantity);
    } else {
      mergedItems.set(item.productId.toString(), item.quantity);
    }
  }

  const items = Array.from(mergedItems.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  await CartModel.updateOne(
    { userId: userId },
    { $set: { items } }
  );

  await CartModel.deleteOne({ guestCartId });
};
