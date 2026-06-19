import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { getStockDisplay } from "@/utils/helper";
import {
  ArrowLeft,
  BanIcon,
  Minus,
  Plus,
  Star,
  TriangleAlert,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  buildStarterRatingBreakdown,
  getStarterProductBySlug,
  getStarterProductCardProps,
  getStarterRelatedProducts,
  getStarterReviewsForSlug,
} from "@/constants/products";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCart((state) => state.addToCart);

  // const { data: detailData, isLoading: isDetailLoading } = useQuery({
  //   queryKey: ["product-detail", slug],
  //   queryFn: () => getProductBySlugQueryFn(slug!),
  //   enabled: !!slug,
  // });
  //
  // const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
  //   queryKey: ["product-reviews", slug],
  //   queryFn: () => getProductReviewsQueryFn(slug!),
  //   enabled: !!slug,
  // });

  const product = slug ? getStarterProductBySlug(slug) : undefined;
  const relatedProducts = slug ? getStarterRelatedProducts(slug, 2) : [];
  const reviews = slug ? getStarterReviewsForSlug(slug) : [];
  const ratingBreakdown = buildStarterRatingBreakdown(reviews);

  const cartItems = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeFromCart = useCart((state) => state.removeFromCart);

  const cartItem = cartItems.find((item) => item.productId === product?.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(
      {
        productId: product.id,
        imageUrl: product.images[0] || "",
        name: product.name,
        salePrice: product.salePrice,
        originalPrice: product.originalPrice,
        discountPercent: product.discountPercent,
        discountLabel: product.discountLabel || undefined,
        unit: product.unit,
        stockCount: product.stockCount,
      },
      quantity,
    );
  };

  if (!slug || !product) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <p className="text-sm text-muted-foreground">Starter product not found.</p>
      </div>
    );
  }

  const stock = getStockDisplay({ stockCount: product.stockCount });
  const isOutofStock = stock.status === "out";

  const StockIcon =
    stock.status === "in-stock"
      ? Truck
      : stock.status === "out"
        ? BanIcon
        : TriangleAlert;
  const stockClassName =
    stock.status === "in-stock"
      ? "text-primary"
      : stock.status === "out"
        ? "text-destructive"
        : "text-secondary";

  const hasDiscount = product.originalPrice > product.salePrice;
  const sizes = 1;

  return (
    <div className="flex flex-col gap-10 px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <section className="grid gap-8 lg:grid-cols-[1fr_1.55fr_430px]">
        <div className="flex min-h-[380px] items-center justify-center">
          <img
            src={product.images[0] || ""}
            alt={product.name}
            className="max-h-[330px] w-full object-contain"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex text-secondary" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "size-4 fill-current stroke-current",
                    index >= product.ratingAverage && "text-gray-300",
                  )}
                />
              ))}
            </span>
            <span className="font-medium text-foreground">
              {product.ratingAverage} ({product.reviewCount})
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {product.categoryId.name}
            </p>
            <h1 className="max-w-2xl text-2xl font-semibold leading-tight text-foreground">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {product.unit ? <span>{product.unit}</span> : null}
              {sizes ? <span> · </span> : null}
              {sizes ? (
                <span className="font-medium text-foreground">
                  {sizes} sizes
                </span>
              ) : null}
            </p>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              stockClassName,
            )}
          >
            <StockIcon className="size-4" />
            {stock.text}
          </div>

          <div className="border-t border-border pt-5">
            <h2 className="text-base font-semibold text-foreground">
              Description
            </h2>
            <p className="mt-2 max-w-2xl text-ellipsis line-clamp-5 text-sm leading-6 text-muted-foreground">
              {product.description}
            </p>
          </div>
        </div>

        <Card className="h-fit bg-background shadow-none">
          <CardContent className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-2">
                <span
                  className={cn(
                    "text-2xl font-semibold leading-none",
                    hasDiscount && "mark-label",
                  )}
                >
                  ${product.salePrice.toFixed(2)}
                </span>
                {hasDiscount ? (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                ) : null}
              </div>
              {product.discountLabel ? (
                <p className="text-sm font-medium text-green-light">
                  {product.discountLabel}
                </p>
              ) : product.discountPercent ? (
                <p className="text-sm font-medium text-green-light">
                  {product.discountPercent}% off
                </p>
              ) : null}
            </div>

            {isOutofStock ? (
              <Button className="h-12 cursor-not-allowed! rounded-full bg-gray-500! text-base opacity-50">
                <BanIcon />
                Out of Stock
              </Button>
            ) : isInCart ? (
              <>
                <div className="flex h-12 items-center justify-between rounded-xl bg-green-light! px-4 text-white">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      if (cartItem.quantity === 1) {
                        removeFromCart(product.id);
                      } else {
                        updateQuantity(product.id, cartItem.quantity - 1);
                      }
                    }}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="text-sm font-semibold">
                    {cartItem.quantity} in cart
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      updateQuantity(product.id, cartItem.quantity + 1);
                    }}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="mt-0 border-t border-border pt-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Item instructions
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add any special instructions here for the picker.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-12 items-center justify-between rounded-xl bg-muted px-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                  >
                    <Minus />
                  </Button>
                  <span className="text-sm font-semibold">{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setQuantity((value) => value + 1)}
                  >
                    <Plus />
                  </Button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="h-12 rounded-full bg-green-light! text-base font-semibold"
                >
                  Add to cart
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 border-t border-border pt-8 lg:grid-cols-[1fr_520px]">
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-foreground">
            Customer Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet for this product.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="border-b border-border pb-6 last:border-b-0"
                >
                  <div
                    className="flex text-secondary"
                    aria-label={`${review.rating} star review`}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "size-4 fill-current stroke-current",
                          index >= review.rating && "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    By {review.userName}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-foreground">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <p className="text-base font-semibold text-foreground">
            Rating Breakdown
          </p>

          <div className="flex flex-col gap-3">
            {ratingBreakdown.map((item) => {
              const total =
                ratingBreakdown.reduce((sum, rating) => sum + rating.count, 0) || 1;
              const value = (item.count / total) * 100;

              return (
                <div
                  key={item.stars}
                  className="grid grid-cols-[24px_1fr_34px] items-center gap-1 text-sm"
                >
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    {item.stars}
                    <span>
                      <Star
                        className={cn(
                          "size-3!",
                          item.count > 0
                            ? "fill-secondary stroke-secondary"
                            : "fill-gray-300 stroke-gray-300",
                        )}
                      />
                    </span>
                  </span>
                  <Progress
                    value={value}
                    className="h-1.5 [&_[data-slot=progress-indicator]]:bg-secondary"
                  />
                  <span className="text-right text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="flex flex-col gap-5 border-t border-border pt-8">
        <h2 className="text-xl font-semibold text-foreground">
          Related products to consider
        </h2>
        {relatedProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No related products found.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} {...getStarterProductCardProps(item)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
