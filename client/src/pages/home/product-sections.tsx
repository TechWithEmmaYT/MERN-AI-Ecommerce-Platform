import ProductCard from "@/components/product-card";
import { PUBLIC_ROUTES } from "@/routes/route";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getProductsQueryFn } from "@/lib/api";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProductSections = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["more-products"],
    queryFn: () => getProductsQueryFn({ limit: 12 }),
  });
  
  const products = data?.products ?? [];

  if (isLoading) {
    return (
      <section className="flex flex-col gap-5 py-8 animate-pulse">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-md animate-pulse" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }


  return (
    <section className="flex flex-col gap-5 py-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">More products</h2>
        <Link
          to={PUBLIC_ROUTES.PRODUCTS}
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          See more
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard 
              key={product._id} 
              id={product._id}
              slug={product.slug}
              imageUrl={product.images?.[0] || ""}
              name={product.name}
              salePrice={product.salePrice}
              originalPrice={product.originalPrice}
              discountPercent={product.discountPercent}
              discountLabel={product.discountLabel || ""}
              ratingAverage={product.ratingAverage}
              reviewCount={product.reviewCount}
              unit={product.unit}
              stockCount={product.stockCount}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductSections;
