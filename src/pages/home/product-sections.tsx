import ProductCard from "@/components/product-card";
import { PUBLIC_ROUTES } from "@/routes/route";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useQuery } from "@tanstack/react-query";
// import { ChevronRight } from "lucide-react";
// import { getProductsQueryFn } from "@/lib/api";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getStarterProductCardProps,
  starterFeaturedProducts,
} from "@/constants/products";

const ProductSections = () => {
  // const { data, isLoading } = useQuery({
  //   queryKey: ["more-products"],
  //   queryFn: () => getProductsQueryFn({ limit: 12 }),
  // });
  //
  // const products = data?.products ?? [];
  const products = starterFeaturedProducts.slice(0, 3);

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
          <ProductCard key={product.id} {...getStarterProductCardProps(product)} />
        ))}
      </div>
    </section>
  );
};

export default ProductSections;
