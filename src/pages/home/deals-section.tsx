import ProductCard from "@/components/product-card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useQuery } from "@tanstack/react-query";
// import { getProductDealsQueryFn } from "@/lib/api";
import { getStarterProductCardProps, starterDeals } from "@/constants/products";

const TodayDealsSection = () => {
  // const { data, isLoading } = useQuery({
  //   queryKey: ["product-deals"],
  //   queryFn: () => getProductDealsQueryFn(6),
  // });
  //
  // const products = data?.products ?? [];
  const products = starterDeals.slice(0, 2);

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
            <ProductCard key={product.id} {...getStarterProductCardProps(product)} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TodayDealsSection;
