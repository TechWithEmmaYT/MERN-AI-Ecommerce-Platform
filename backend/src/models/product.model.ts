import mongoose, { Document, Schema } from "mongoose";
import slugify from "slugify";
import { calculateSalePrice } from "../utils/price.util";

export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  discountLabel?: string;
  unit: string;
  stockCount: number;
  ratingAverage: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: undefined,
    },
    images: {
      type: [String],
      default: [],
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountLabel: {
      type: String,
      default: undefined,
    },
    unit: {
      type: String,
      default: "pc",
    },
    stockCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("validate", async function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (this.isModified("originalPrice") || this.isModified("discountPercent")) {
    if (this.discountPercent > 0) {
      this.salePrice = calculateSalePrice(this.originalPrice, this.discountPercent);
    } else {
      this.salePrice = this.originalPrice;
    }
  }
});

productSchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (this.isModified("originalPrice") || this.isModified("discountPercent")) {
    if (this.discountPercent > 0) {
      this.salePrice = calculateSalePrice(this.originalPrice, this.discountPercent);
    } else {
      this.salePrice = this.originalPrice;
    }
  }
});

const ProductModel = mongoose.model<IProduct>("Product", productSchema);

export default ProductModel;
