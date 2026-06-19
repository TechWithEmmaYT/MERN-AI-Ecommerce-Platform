import crypto from "crypto";

export const generateOrderNo = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${timestamp}${random}`;
};
