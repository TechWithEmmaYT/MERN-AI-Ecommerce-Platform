import { Router } from "express";
import {
  upsertCartController,
  getCartController,
} from "../controllers/cart.controller";
import { optionalCartAuth } from "../config/passport.config";

const cartRoutes = Router();

cartRoutes.post("/", optionalCartAuth, upsertCartController);
cartRoutes.get("/", optionalCartAuth, getCartController);

export default cartRoutes;
