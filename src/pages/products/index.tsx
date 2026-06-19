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

  const categories = starterCategories;
  const baseProducts = getStarterProductsByCategory(selectedCategory);
  const hasActiveFilters =
    filters.dealsOnly ||
    filters.inStockOnly ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.sort !== "best-match";

  const filteredProducts = [...baseProducts]
    .filter((product) =>
      filters.dealsOnly ? product.originalPrice > product.salePrice : true,
    )
    .filter((product) =>
      filters.inStockOnly ? (product.stockCount ?? 0) > 0 : true,
    )
    .filter((product) => {
      const minPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
      const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;

      if (minPrice !== undefined && product.salePrice < minPrice) {
        return false;
      }

      if (maxPrice !== undefined && product.salePrice > maxPrice) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      switch (filters.sort) {
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

  const currentCategoryName =
    selectedCategory === "all"
      ? "All"
      : categories.find((cat) => cat._id === selectedCategory)?.name || "Category";

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
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">Categories</h2>
            <div className="flex flex-col gap-1">
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
                {filteredProducts.length} products
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

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <span>
                <Inbox className="mb-1 size-9" />
              </span>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try modifying your category or filter selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...getStarterProductCardProps(product)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;
