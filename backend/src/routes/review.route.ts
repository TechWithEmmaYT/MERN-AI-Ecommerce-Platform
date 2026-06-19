import { Router } from "express";
import {
  createReviewController,
  getUserReviewsController,
  getUserReviewableOrderItemsController,
} from "../controllers/review.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const reviewRoutes = Router();

reviewRoutes.use(passportAuthenticateJwt);
reviewRoutes.post("/", createReviewController);
reviewRoutes.get("/", getUserReviewsController);
reviewRoutes.get("/reviewable", getUserReviewableOrderItemsController);

export default reviewRoutes;
