export type CreateReviewInput = {
  orderId: string;
  orderItemId: string;
  rating: number;
  comment: string;
};

export type ReviewProductInfo = {
  _id: string;
  name: string;
  slug: string;
  images: string[];
};

export type UserReviewType = {
  _id: string;
  userId: string;
  orderId: string;
  orderItemId: string;
  productId: ReviewProductInfo;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ReviewableOrderItemType = {
  _id: string; // Order item ID
  productId: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  quantity: number;
  isReviewed: boolean;
};

export type ReviewableOrderType = {
  _id: string; // Order ID
  createdAt: string;
  items: ReviewableOrderItemType[];
};

export type GetReviewableItemsResponse = {
  message: string;
  orders: ReviewableOrderType[];
};

export type GetUserReviewsResponse = {
  message: string;
  reviews: UserReviewType[];
};

export type CreateReviewResponse = {
  message: string;
  review: UserReviewType;
};
