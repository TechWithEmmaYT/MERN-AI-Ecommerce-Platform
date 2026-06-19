import fruitImage from "@/assets/product-imgs/fruit.jpeg";
import juiceImage from "@/assets/product-imgs/juice.jpeg";
import strawberryImage from "@/assets/product-imgs/strawberry.jpeg";
import productImageOne from "@/assets/images/product-img-1.jpeg";
import productImageTwo from "@/assets/images/product-img-2.png";

export type StarterCategory = {
  _id: string;
  name: string;
  slug: string;
};

export type StarterProduct = {
  id: string;
  slug: string;
  name: string;
  images: string[];
  originalPrice: number;
  salePrice: number;
  discountPercent?: number;
  discountLabel?: string;
  unit: string;
  stockCount?: number;
  ratingAverage: number;
  reviewCount: number;
  description: string;
  categoryId: StarterCategory;
};

export type StarterReview = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export const starterProducts: StarterProduct[] = [
  {
    id: "strawberry-crate",
    slug: "strawberry-crate",
    name: "Fresh strawberry crate",
    images: [strawberryImage, fruitImage],
    originalPrice: 8.99,
    salePrice: 5.99,
    discountPercent: 33,
    discountLabel: "Limited time deal",
    unit: "1 crate",
    stockCount: 12,
    ratingAverage: 5,
    reviewCount: 128,
    description:
      "A simple starter product for the storefront with bright fruit imagery and a clear discounted price.",
    categoryId: {
      _id: "fruits-vegetables",
      name: "Fruits & Vegetables",
      slug: "fruits-vegetables",
    },
  },
  {
    id: "fresh-juice-box",
    slug: "fresh-juice-box",
    name: "Cold-pressed juice box",
    images: [juiceImage, productImageTwo],
    originalPrice: 6.49,
    salePrice: 4.99,
    discountPercent: 23,
    discountLabel: "Deal of the day",
    unit: "6 pack",
    stockCount: 18,
    ratingAverage: 4,
    reviewCount: 84,
    description:
      "A starter beverage item with a clean product image and a discount so it can show up in the deals row.",
    categoryId: {
      _id: "beverages",
      name: "Beverages",
      slug: "beverages",
    },
  },
  {
    id: "pantry-starter-pack",
    slug: "pantry-starter-pack",
    name: "Pantry starter pack",
    images: [productImageOne, productImageTwo],
    originalPrice: 12.99,
    salePrice: 12.99,
    unit: "1 bundle",
    stockCount: 9,
    ratingAverage: 4,
    reviewCount: 51,
    description:
      "A regular-price starter product for the listing and product detail pages.",
    categoryId: {
      _id: "pantry-staples",
      name: "Pantry Staples",
      slug: "pantry-staples",
    },
  },
];

export const starterCategories: StarterCategory[] = [
  {
    _id: "all",
    name: "All",
    slug: "all",
  },
  ...Array.from(
    new Map(
      starterProducts.map((product) => [product.categoryId._id, product.categoryId]),
    ).values(),
  ),
];

export const starterDeals = starterProducts.filter(
  (product) => product.originalPrice > product.salePrice,
);

export const starterFeaturedProducts = starterProducts.slice(0, 3);

export const getStarterProductBySlug = (slug: string) =>
  starterProducts.find((product) => product.slug === slug);

export const getStarterRelatedProducts = (slug: string, limit = 2) =>
  starterProducts.filter((product) => product.slug !== slug).slice(0, limit);

export const getStarterProductsByCategory = (categoryId: string) => {
  if (categoryId === "all") {
    return starterProducts;
  }

  return starterProducts.filter((product) => product.categoryId._id === categoryId);
};

export const getStarterProductCardProps = (product: StarterProduct) => ({
  id: product.id,
  slug: product.slug,
  imageUrl: product.images[0] || "",
  name: product.name,
  salePrice: product.salePrice,
  originalPrice: product.originalPrice,
  discountPercent: product.discountPercent,
  discountLabel: product.discountLabel || "",
  ratingAverage: product.ratingAverage,
  reviewCount: product.reviewCount,
  unit: product.unit,
  stockCount: product.stockCount,
});

export const starterReviewsBySlug: Record<string, StarterReview[]> = {
  "strawberry-crate": [
    {
      id: "review-strawberry-1",
      userName: "Amina",
      rating: 5,
      comment: "Fresh and simple. Works well for the starter storefront.",
      createdAt: "2026-06-01T10:00:00.000Z",
    },
    {
      id: "review-strawberry-2",
      userName: "Daniel",
      rating: 4,
      comment: "Good placeholder product and the image looks clean on the page.",
      createdAt: "2026-06-03T14:20:00.000Z",
    },
  ],
  "fresh-juice-box": [
    {
      id: "review-juice-1",
      userName: "Maya",
      rating: 4,
      comment: "Nice starter item for the beverage section.",
      createdAt: "2026-06-02T09:15:00.000Z",
    },
    {
      id: "review-juice-2",
      userName: "Ife",
      rating: 5,
      comment: "Enough detail to make the product page feel complete.",
      createdAt: "2026-06-04T17:45:00.000Z",
    },
  ],
  "pantry-starter-pack": [
    {
      id: "review-pantry-1",
      userName: "Chidi",
      rating: 4,
      comment: "Solid baseline product for the listing page.",
      createdAt: "2026-06-05T08:30:00.000Z",
    },
    {
      id: "review-pantry-2",
      userName: "Sara",
      rating: 4,
      comment: "Good enough for starter content without feeling empty.",
      createdAt: "2026-06-06T16:10:00.000Z",
    },
  ],
};

export const getStarterReviewsForSlug = (slug: string) =>
  starterReviewsBySlug[slug] ?? [];

export const buildStarterRatingBreakdown = (reviews: StarterReview[]) => {
  return Array.from({ length: 5 }, (_, index) => {
    const stars = 5 - index;
    const count = reviews.filter((review) => review.rating === stars).length;

    return { stars, count };
  });
};

export const starterOrderStatuses = [
  "placed",
  "confirmed",
  "packed",
  "out_for_delivery",
  "delivered",
] as const;
