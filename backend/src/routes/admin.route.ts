import { Router } from "express";
import {
  createProductController,
  generateAIAdminController,
  getAdminAnalyticsController,
  getAdminOrdersController,
  getProductsForAdminController,
  updateOrderStatusController,
  uploadProductImagesController,
} from "../controllers/admin.controller";
import {
  uploadProductImages,
  validateFilesPresence,
} from "../middlewares/multer.middleware";
import { passportAuthenticateJwt } from "../config/passport.config";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";

const adminRoutes = Router();

adminRoutes.use(passportAuthenticateJwt);
adminRoutes.use(requireAdmin);

adminRoutes.get("/analytics", getAdminAnalyticsController);
adminRoutes.get("/analytics", getAdminAnalyticsController);
adminRoutes.post("/ai/generate", generateAIAdminController);
adminRoutes.get("/orders", getAdminOrdersController);
adminRoutes.put("/orders/:id/status", updateOrderStatusController);
adminRoutes.get("/products", getProductsForAdminController);
adminRoutes.post(
  "/products/upload",
  uploadProductImages,
  validateFilesPresence,
  uploadProductImagesController
);
adminRoutes.post("/products", createProductController);

export default adminRoutes;
