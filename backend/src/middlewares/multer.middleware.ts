import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { BadRequestException } from "../utils/app-error";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        `Invalid file type: ${file.mimetype}. Only images are allowed.`
      )
    );
  }
};

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
}).array("images", 10);

export const validateFilesPresence = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    throw new BadRequestException("At least one image is required");
  }

  next();
};
