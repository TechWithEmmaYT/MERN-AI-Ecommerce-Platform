import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.config";

interface UploadImageResult {
  url: string;
  publicId: string;
}

export const uploadImageToCloudinary = async (
  file: Express.Multer.File,
  folder = "products"
): Promise<UploadImageResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload image to Cloudinary"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

export const uploadMultipleImagesToCloudinary = async (
  files: Express.Multer.File[],
  folder = "products"
): Promise<UploadImageResult[]> => {
  const uploadPromises = files.map((file) =>
    uploadImageToCloudinary(file, folder)
  );
  return Promise.all(uploadPromises);
};
