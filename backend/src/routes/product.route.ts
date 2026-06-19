import { Router } from "express";
import {
  getProductsController,
  getDealsController,
  getProductBySlugController,
  getProductReviewsController,
} from "../controllers/product.controller";

const productRoutes = Router();

productRoutes.get("/", getProductsController);
productRoutes.get("/deals", getDealsController);
productRoutes.get("/:slug/reviews", getProductReviewsController);
productRoutes.get("/:slug", getProductBySlugController);

export default productRoutes;
