export const calculateSalePrice = (
  originalPrice: number,
  discountPercent: number
): number => {
  const discountAmount = (originalPrice * discountPercent) / 100;
  return Math.round((originalPrice - discountAmount) * 100) / 100;
};
