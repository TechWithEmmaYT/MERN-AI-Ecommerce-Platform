import { Router } from "express";
import {
  createOrderController,
  getUserOrdersController,
  getUserOrderByIdController,
} from "../controllers/order.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const orderRoutes = Router();

orderRoutes.use(passportAuthenticateJwt);
orderRoutes.post("/", createOrderController);
orderRoutes.get("/", getUserOrdersController);
orderRoutes.get("/:id", getUserOrderByIdController);

export default orderRoutes;
