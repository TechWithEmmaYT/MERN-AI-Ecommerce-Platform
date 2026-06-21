import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CheckIcon, Inbox, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getStarterProductCardProps,
  getStarterProductsByCategory,
  starterCategories,
} from "@/constants/products";
import { getAllCategoriesQueryFn, getProductsQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";

  const [priceInput, setPriceInput] = useState({ min: "", max: "" });
  const [filters, setFilters] = useState({
    dealsOnly: false,
    inStockOnly: false,
    minPrice: "",
    maxPrice: "",
    sort: "best-match",
  });

 const { data:categoriesData, isLoading:isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategoriesQueryFn,
  });
  
  const categories = categoriesData?.categories ?? [];

  const { data:productsData, isLoading:isProductsLoading } = useQuery({
      queryKey: ["products", selectedCategory, filters],
      queryFn: () => getProductsQueryFn({
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
        hasDiscount: filters.dealsOnly ? true : undefined,
        inStock: filters.inStockOnly ? true : undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        sort: filters.sort,
      }),
    });
    
  const products = productsData?.products ?? [];
  
  const currentCategoryName =
    selectedCategory === "all"
      ? "All"
      : categories.find((cat) => cat._id === selectedCategory)?.name || "Category";

  const hasActiveFilters =
    filters.dealsOnly ||
    filters.inStockOnly ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.sort !== "best-match";

  const handleCategoryChange = (categoryId: string) => {
    setSearchParams(categoryId === "all" ? {} : { category: categoryId });
  };

  const handleApplyPriceFilter = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: priceInput.min,
      maxPrice: priceInput.max,
    }));
  };

  const handleResetFilters = () => {
    setPriceInput({ min: "", max: "" });
    setFilters({
      dealsOnly: false,
      inStockOnly: false,
      minPrice: "",
      maxPrice: "",
      sort: "best-match",
    });
    setSearchParams(selectedCategory === "all" ? {} : { category: selectedCategory });
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">All products</h1>
        <p className="text-sm text-muted-foreground">
          Browse groceries by category, price, and availability.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* {Sidebar Filters} */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">Categories</h2>

            <div className="flex flex-col gap-1">

              {isCategoriesLoading ? (
                Array.from({ length:6}).map((_, index) => (
                  <Skeleton key={index} className="w-full h-9" />
                ))
              ):(
                <>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("all")}
                    className={cn(
                      "rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                      selectedCategory === "all" && "bg-muted font-medium text-foreground"
                    )}
                  >
                    All
                  </button>
                {categories.map((category) => {
                  const isActive = category._id === selectedCategory;
                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => handleCategoryChange(category._id)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                        isActive && "bg-muted font-medium text-foreground",
                      )}
                    >
                      {category.name}
                    </button>
                  );
                })}
                
                </>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">Filters</h2>
            <Label className="gap-3">
              <Checkbox
                checked={filters.dealsOnly}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({ ...prev, dealsOnly: checked === true }))
                }
              />
              Deals only
            </Label>
            <Label className="gap-3">
              <Checkbox
                checked={filters.inStockOnly}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({ ...prev, inStockOnly: checked === true }))
                }
              />
              In stock
            </Label>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">Price range</h2>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="text"
                inputMode="numeric"
                min="0"
                placeholder="Min"
                value={priceInput.min}
                onChange={(event) =>
                  setPriceInput((prev) => ({ ...prev, min: event.target.value }))
                }
              />
              <Input
                type="text"
                inputMode="numeric"
                min="0"
                placeholder="Max"
                value={priceInput.max}
                onChange={(event) =>
                  setPriceInput((prev) => ({ ...prev, max: event.target.value }))
                }
              />
              <Button size="icon" type="button" onClick={handleApplyPriceFilter}>
                <CheckIcon />
              </Button>
            </div>
          </section>
        </aside>

        <section className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {currentCategoryName}
              </h2>
              <p className="text-sm text-muted-foreground">
                 {isProductsLoading ? "Loading..." : `${products.length} products`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {hasActiveFilters ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleResetFilters}
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </Button>
                  <Separator
                    orientation="vertical"
                    className="mx-1 h-5 !self-center bg-border"
                  />
                </>
              ) : null}
              <span className="font-semibold text-foreground">Sort by</span>
              <Select
                value={filters.sort}
                onValueChange={(val) =>
                  setFilters((prev) => ({ ...prev, sort: val }))
                }
              >
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
          </div>

          
          {isProductsLoading ? (
             <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton className="aspect-square w-full rounded-md" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ): products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <span>
                <Inbox className="mb-1 size-9" />
              </span>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try modifying your category or filter selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
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
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;
