import Stripe from "stripe";
import { envConfig } from "./env.config";

const stripeClient = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover"
})

export default stripeClient;