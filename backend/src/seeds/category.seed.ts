import "dotenv/config";
import mongoose from "mongoose";
import CategoryModel from "../models/category.model";
import { envConfig } from "../config/env.config";

const categories = [
   {
    name: "Beverages",
    imageUrl:
      "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265027/Beverages_lcunrb.png",
    description: "Drinks, juices, and everyday refreshments.",
    isActive: true,
  },
  {
    name: "Snacks",
    imageUrl:
      "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265027/Snacks_wxordv.png",
    description: "Chips, biscuits, and quick bites.",
    isActive: true,
  },
   {
    name: "Bakery",
    imageUrl:
      "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265027/Bakery_xwbrje.png",
    description: "Fresh bread, pastries, and baked goods.",
    isActive: true,
  },
    
    {
      name: "Baby Care",
      imageUrl:
        "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265026/Baby_Care_bxxwu0.png",
      description: "Essentials for infants and toddlers.",
    isActive: true,
  },
 
 {
      name: "Frozen Foods",
      imageUrl:
        "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265027/Frozen_Foods_wknnin.png",
      description: "Frozen meals and freezer staples.",
      isActive: true,
    },
  {
    name: "Fruits & Vegetables",
    imageUrl:
      "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265026/Fruits_Vegetables_lnmslm.png",
    description: "Fresh produce for everyday cooking.",
    isActive: true,
  },
  {
    name: "Meat & Seafood",
    imageUrl:
      "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265026/Meat_Seafood_nhtxen.png",
    description: "Fresh meat, fish, and seafood options.",
    isActive: true,
  },
  {
    name: "Pantry Staples",
    imageUrl:
      "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265027/Pantry_Staples_ppwolo.png",
    description: "Rice, flour, oil, and pantry basics.",
    isActive: true,
  },
  {
    name: "Personal Care",
    imageUrl:
      "https://res.cloudinary.com/dp9vvlndo/image/upload/v1781265026/Personal_Care_osossq.png",
    description: "Daily hygiene and personal grooming items.",
    isActive: true,
  },
  
];

const seedCategories = async () => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("Database connected");

    await CategoryModel.deleteMany({});
    console.log("Existing categories cleared");

    const created = await CategoryModel.insertMany(categories);
    console.log(`${created.length} categories seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedCategories();