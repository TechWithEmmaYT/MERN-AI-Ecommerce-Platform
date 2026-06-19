import { Router } from "express";
import { getCategoriesController } from "../controllers/category.controller";

const categoryRoutes = Router();
categoryRoutes.get("/", getCategoriesController);

export default categoryRoutes;
