import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ErrorCodes } from "../utils/app-error";
import { HTTPSTATUS } from "../config/http.config";

const formatZodError = (error: ZodError) => {
  return error.issues.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
};


export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.log("Error occured in this path", _req.path, err)
  if (err instanceof ZodError) {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Validation failed",
      errorCode: ErrorCodes.ERR_VALIDATION,
      errors: formatZodError(err),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      errorCode: err.errorCode,
    });
    return;
  }

  res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    errorCode: ErrorCodes.ERR_INTERNAL,
  });
};
