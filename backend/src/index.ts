import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { envConfig } from "./config/env.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { connectDatabase } from "./config/database.config";

import passport from "./config/passport.config";
import routes from "./routes";
import webhookRouter from "./routes/webhook.route";

const app = express();

app.use("/api/webhook", webhookRouter);

app.use(cors({ 
  origin: envConfig.FRONTEND_ORIGIN, 
   methods: ["GET", "POST", "PUT", "DELETE"], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize())

app.get("/health", asyncHandler(
  async(_req, res) => {
  res.status(HTTPSTATUS.OK).json({
    message: "Server is running",
    status: "healthy",
  });
}))

app.use("/api", routes);

app.use(errorHandler);

app.listen(envConfig.PORT, async () => {
  await connectDatabase();
  console.log(`Server running on port ${envConfig.PORT} in ${envConfig.NODE_ENV} mode`);
});
