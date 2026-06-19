import { Router } from "express";
import { stripeWebhookHandler } from "../webhooks/stripe.webhook";
import express from "express";

const webhookRouter = Router();

webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

export default webhookRouter;
