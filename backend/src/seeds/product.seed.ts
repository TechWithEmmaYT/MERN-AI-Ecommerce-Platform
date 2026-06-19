import "dotenv/config";
import mongoose from "mongoose";
import ProductModel from "../models/product.model";
import { envConfig } from "../config/env.config";

const seedProducts = async () => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("Database connected");

    await ProductModel.deleteMany({});
    console.log("Existing products cleared");

    const products = [
      {
        name: "Fresh Apples",
        description: "Crisp and juicy red apples",
        images: ["https://example.com/apple.jpg"],
        originalPrice: 4.99,
        discountPercent: 0,
        stockCount: 100,
        unit: "kg",
        isActive: true,
      },
      {
        name: "Organic Bananas",
        description: "Sweet organic bananas",
        images: ["https://example.com/banana.jpg"],
        originalPrice: 3.49,
        discountPercent: 10,
        discountLabel: "10% OFF",
        stockCount: 75,
        unit: "kg",
        isActive: true,
      },
      {
        name: "Whole Wheat Bread",
        description: "Freshly baked whole wheat bread",
        images: ["https://example.com/bread.jpg"],
        originalPrice: 2.99,
        discountPercent: 0,
        stockCount: 50,
        unit: "pc",
        isActive: true,
      },
      {
        name: "Orange Juice",
        description: "Fresh squeezed orange juice",
        images: ["https://example.com/juice.jpg"],
        originalPrice: 5.99,
        discountPercent: 15,
        discountLabel: "15% OFF",
        stockCount: 30,
        unit: "pc",
        isActive: false,
      },
    ];

    const created = await ProductModel.insertMany(products);
    console.log(`${created.length} products seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedProducts();
