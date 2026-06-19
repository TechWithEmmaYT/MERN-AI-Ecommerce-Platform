export type ProductType = {
  _id: string;
  name: string;
  images: string[];
  originalPrice: number;
  discountPercent: number;
  discountLabel?: string | null;
  unit: string;
  stockCount: number;
  ratingAverage: number;
  reviewCount: number;
  slug: string;
  salePrice: number;
};

export type DealsResponseType = {
  message: string;
  products: ProductType[];
};

export type PaginationType = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
};

export type ProductResponseType = {
  message: string;
  products: ProductType[];
  pagination: PaginationType;
};

export type ProductParams = {
  categoryId?: string;
  hasDiscount?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  keyword?: string;
  page?: number;
  limit?: number;
  skip?: number;
};

export type ProductDetailResponseType = {
  message: string;
  product: ProductType & {
    description?: string;
    categoryId: {
      _id: string;
      name: string;
      slug: string;
    };
  };
  related: ProductType[];
};

export type ReviewType = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};

export type RatingBreakdownItem = {
  stars: number;
  count: number;
};

export type ReviewsResponseType = {
  message: string;
  reviews: ReviewType[];
  ratingBreakdown: RatingBreakdownItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};



