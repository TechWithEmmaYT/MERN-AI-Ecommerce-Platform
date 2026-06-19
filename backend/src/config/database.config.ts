import mongoose from "mongoose"
import { envConfig } from "./env.config"

export const connectDatabase = async () => {
    try {
        await mongoose.connect(envConfig.MONGO_URI);
        console.log("Database connected!")
    } catch (error) {
        console.log("Database connection error", error);
        process.exit(1)
    }
}