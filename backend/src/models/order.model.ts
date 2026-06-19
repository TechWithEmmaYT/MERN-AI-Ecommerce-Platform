import mongoose, { Document, Schema } from "mongoose";
import {
  ORDER_STATUS,
  OrderStatus,
  ORDER_STATUS_VALUES,
  PaymentMethod,
  PAYMENT_METHOD_VALUES,
  PaymentStatus,
  PAYMENT_STATUS_VALUES,
  PAYMENT_STATUS,
} from "../constants/enums";
import { generateOrderNo } from "../utils/order.util";

export interface IOrderItem {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  originalPrice: number;
  discountPercent: number;
  salePrice: number;
  quantity: number;
  isReviewed: boolean
}

export interface IOrderAddress {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  note?: string;
  date: Date;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderNo: string;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: IOrderStatusHistory[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true, default: 0 },
    salePrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    isReviewed: { type: Boolean, default: false },
  },
);

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: { 
        type: String,
         enum: ORDER_STATUS_VALUES, 
         required: true 
        },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNo: {
      type: String,
      required: true,
      unique: true,
      default: () => generateOrderNo()
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    shippingAddress: {
      type: orderAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD_VALUES,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.PLACED,
    },
    statusHistory: {
      type: [orderStatusHistorySchema],
      default: () => [
        {
          status: ORDER_STATUS.PLACED,
          date: new Date(),
        },
      ],
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// orderSchema.pre("validate", async function () {
//   if (this.isNew) {
//     this.orderNo = generateOrderNo();
//   }
// });

const OrderModel = mongoose.model<IOrder>("Order", orderSchema);

export default OrderModel;
