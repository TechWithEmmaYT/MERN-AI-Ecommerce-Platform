import { starterProducts } from "@/constants/products";

const strawberry = starterProducts[0];
const juice = starterProducts[1];

export type ReviewableItem = {
  id: string;
  productName: string;
  productImage: string;
  productSlug: string;
  orderId: string;
  orderDate: string;
};

export type SubmittedReview = ReviewableItem & {
  rating: number;
  body: string;
  createdAt: string;
  verified: boolean;
};

export const reviewableItems: ReviewableItem[] = [
  {
    id: "review-strawberry",
    productName: strawberry.name,
    productImage: strawberry.images[0],
    productSlug: strawberry.slug,
    orderId: "starter-order-1",
    orderDate: "2026-06-08T09:00:00.000Z",
  },
  {
    id: "review-juice",
    productName: juice.name,
    productImage: juice.images[0],
    productSlug: juice.slug,
    orderId: "starter-order-1",
    orderDate: "2026-06-08T09:00:00.000Z",
  },
];

export const submittedReviews: SubmittedReview[] = [
  {
    id: "submitted-strawberry",
    productName: strawberry.name,
    productImage: strawberry.images[0],
    productSlug: strawberry.slug,
    orderId: "starter-order-2",
    orderDate: "2026-06-05T11:00:00.000Z",
    rating: 5,
    body: "Fresh, easy to use, and perfect for a starter grocery layout.",
    createdAt: "2026-06-06T10:20:00.000Z",
    verified: true,
  },
  {
    id: "submitted-juice",
    productName: juice.name,
    productImage: juice.images[0],
    productSlug: juice.slug,
    orderId: "starter-order-2",
    orderDate: "2026-06-05T11:00:00.000Z",
    rating: 4,
    body: "Clean placeholder content and the page reads well with it.",
    createdAt: "2026-06-06T14:45:00.000Z",
    verified: true,
  },
];
