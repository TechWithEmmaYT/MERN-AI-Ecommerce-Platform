import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateSalePrice = (originalPrice: number, discountPercent: number) => {
  if (discountPercent <= 0) return originalPrice;
  if (discountPercent >= 100) return 0;
  const originalPriceCents = Math.round(originalPrice * 100);
  const discountAmountCents = Math.round((originalPriceCents * discountPercent) / 100);
  return (originalPriceCents - discountAmountCents) / 100;
};