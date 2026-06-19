import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../utils/app-error";
import { USER_ROLES } from "../constants/enums";

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    throw new ForbiddenException("Admin access required");
  }
  next();
};
