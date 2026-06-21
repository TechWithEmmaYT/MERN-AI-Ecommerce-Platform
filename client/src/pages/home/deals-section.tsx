import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getProductDealsQueryFn } from "@/lib/api";
import { getStarterProductCardProps } from "@/constants/products";

const TodayDealsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["product-deals"],
    queryFn: () => getProductDealsQueryFn(6),
  });
  
  const products = data?.products ?? [];

   if (isLoading) {
    return (
      <section className="bg-muted/70 rounded-lg px-4 py-4">
        <div className="flex flex-col gap-6 animate-pulse">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full rounded-md animate-pulse" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg bg-muted/70 px-4 py-4">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">
            Today&apos;s deals
          </h2>
          <p className="text-sm text-muted-foreground">
            Fresh savings picked for your grocery run.
          </p>
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
      </div>
    </section>
  );
};

export default TodayDealsSection;
