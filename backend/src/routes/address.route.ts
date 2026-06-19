import { Router } from "express";
import {
  createAddressController,
  getUserAddressesController,
} from "../controllers/address.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const addressRoutes = Router();
addressRoutes.use(passportAuthenticateJwt);
addressRoutes.post("/", createAddressController);
addressRoutes.get("/", getUserAddressesController);

export default addressRoutes;
