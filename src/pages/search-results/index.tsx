import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
// import { getProductsQueryFn } from "@/lib/api";
import {
  getStarterProductCardProps,
  starterProducts,
} from "@/constants/products";
import { PUBLIC_ROUTES } from "@/routes/route";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState("best-match");
  const query = searchParams.get("q") || "";
  const normalizedQuery = query.trim();

  // const { data: searchData, isLoading: isSearchLoading } = useQuery({
  //   queryKey: ["search-products", normalizedQuery, sort],
  //   queryFn: () =>
  //     getProductsQueryFn({
  //       keyword: normalizedQuery || undefined,
  //       sort: sort,
  //     }),
  //   enabled: !!normalizedQuery,
  // });
  //
  // const searchResults = searchData?.products ?? [];

  const searchResults = starterProducts
    .filter((product) => {
      if (!normalizedQuery) {
        return false;
      }

      const searchableText = [
        product.name,
        product.description,
        product.categoryId.name,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery.toLowerCase());
    })
    .sort((left, right) => {
      switch (sort) {
        case "price-low":
          return left.salePrice - right.salePrice;
        case "price-high":
          return right.salePrice - left.salePrice;
        case "highest-rating":
          return right.ratingAverage - left.ratingAverage;
        default:
          return 0;
      }
    });

  const isSearchLoading = false;

  return (
    <div className="flex flex-col gap-8 px-4 py-6">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Search Instant
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              {normalizedQuery ? `Search results for "${query}"` : "Search groceries"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {normalizedQuery
                ? isSearchLoading
                  ? "Searching..."
                  : `${searchResults.length} products found`
                : "Type in the search bar to find products and categories."}
            </p>
          </div>

          {normalizedQuery && searchResults.length > 0 && !isSearchLoading ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">Sort by</span>
              <span className="h-4 w-px bg-border" />
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="border-0 px-0 shadow-none focus-visible:ring-0">
                  <SelectValue placeholder="Best Match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="best-match">Best Match</SelectItem>
                    <SelectItem value="price-low">Price: low to high</SelectItem>
                    <SelectItem value="price-high">Price: high to low</SelectItem>
                    <SelectItem value="highest-rating">Highest rated</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </section>

      {!normalizedQuery ? (
        <Empty className="min-h-[360px] bg-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>Start with a product or category</EmptyTitle>
            <EmptyDescription>
              Try snacks, produce, pantry staples, or your favorite grocery item.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="lg" asChild>
              <Link to={PUBLIC_ROUTES.PRODUCTS}>Browse all products</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : isSearchLoading ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {searchResults.map((product) => (
            <ProductCard
              key={product.id}
              {...getStarterProductCardProps(product)}
            />
          ))}
        </div>
      ) : (
        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-8" />
            </EmptyMedia>
            <EmptyTitle>No results for "{query}"</EmptyTitle>
            <EmptyDescription>
              Check the spelling or browse all products instead.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="lg" asChild>
              <Link to={PUBLIC_ROUTES.PRODUCTS}>Browse all products</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
};

export default SearchResultPage;
