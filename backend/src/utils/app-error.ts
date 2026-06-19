import { HTTPSTATUS } from "../config/http.config";

const ErrorCodes = {
  ERR_INTERNAL: "ERR_INTERNAL",
  ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
  ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
  ERR_FORBIDDEN: "ERR_FORBIDDEN",
  ERR_NOT_FOUND: "ERR_NOT_FOUND",
  ERR_VALIDATION: "ERR_VALIDATION",
} as const;

type ErrorCodeType = (typeof ErrorCodes)[keyof typeof ErrorCodes];

class AppError extends Error {
  public statusCode: number;
  public errorCode: ErrorCodeType;

  constructor(message: string, statusCode: number, errorCode: ErrorCodeType) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class InternalServerException extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL);
    Object.setPrototypeOf(this, InternalServerException.prototype);
  }
}

class NotFoundException extends AppError {
  constructor(message = "Resource not found") {
    super(message, HTTPSTATUS.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

class BadRequestException extends AppError {
  constructor(message = "Bad Request") {
    super(message, HTTPSTATUS.BAD_REQUEST, ErrorCodes.ERR_BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized") {
    super(message, HTTPSTATUS.UNAUTHORIZED, ErrorCodes.ERR_UNAUTHORIZED);
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

class ForbiddenException extends AppError {
  constructor(message = "Forbidden") {
    super(message, HTTPSTATUS.FORBIDDEN, ErrorCodes.ERR_FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}

export {
  ErrorCodes,
  ErrorCodeType,
  AppError,
  InternalServerException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
};
