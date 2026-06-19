import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PUBLIC_ROUTES } from "@/routes/route";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useMemo, useState } from "react";
import { starterProducts } from "@/constants/products";
// import { useQuery } from "@tanstack/react-query";
// import { getAdminProductsQueryFn } from "@/lib/api";

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(2);
  const products = starterProducts;
  const totalPages = Math.max(1, Math.ceil(products.length / limit));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * limit;
    return products.slice(start, start + limit);
  }, [products, page, limit]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const getPaginationItems = (currentPage: number, pages: number) => {
    if (pages <= 5) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }

    const candidates = new Set<number>([1, pages, currentPage - 1, currentPage, currentPage + 1]);
    const visible = Array.from(candidates)
      .filter((item) => item >= 1 && item <= pages)
      .sort((a, b) => a - b);

    const output: Array<number | "ellipsis"> = [];
    visible.forEach((item, index) => {
      const previous = visible[index - 1];
      if (index > 0 && previous !== undefined && item - previous > 1) {
        output.push("ellipsis");
      }
      output.push(item);
    });

    return output;
  };

  const startIndex = products.length === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, products.length);
  const pageItems = getPaginationItems(page, totalPages);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your store catalog and product inventory.</p>
        </div>
        <Button size="lg" className="flex items-center gap-2 px-4!" onClick={() => navigate("/admin/products/new")}>
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Catalog ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3">Product</TableHead>
                  <TableHead className="px-6 py-3">SKU / Slug</TableHead>
                  <TableHead className="px-6 py-3">Original Price</TableHead>
                  <TableHead className="px-6 py-3">Discount(%)</TableHead>
                  <TableHead className="px-6 py-3">Sale Price</TableHead>
                  <TableHead className="px-6 py-3">Stock Count</TableHead>
                  <TableHead className="px-6 py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product: any) => (
                    <TableRow key={product._id} className="hover:bg-muted/30 text-[13px]!">
                      <TableCell className="px-6 py-4">
                        <Link to={PUBLIC_ROUTES.PRODUCT_DETAIL.replace(":slug",product.slug)}
                        
                        className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover border"
                          />
                          <div className="flex flex-col">
                            <p className="font-medium truncate max-w-[280px]">{product.name}</p>
                            <span className="text-xs text-muted-foreground">{product.unit || "unit"}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm font-mono text-muted-foreground truncate max-w-[180px]">
                        {product.slug}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-muted-foreground">
                        ${product.originalPrice.toFixed(2)}
                      </TableCell>
                        <TableCell className="px-6 py-4 font-semibold text-foreground">
                        {product.discountPercent ? `${product.discountPercent}%`: "-"}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-semibold text-foreground">
                        ${product.salePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`font-semibold ${product.stockCount === 0 ? "text-destructive" : "text-foreground"}`}>
                          {product.stockCount}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant={product.stockCount > 0 ? "default" : "destructive"}
                          className={product.stockCount > 0 ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
                        >
                          {product.stockCount > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </div>

          <div className="w-full flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>
        2
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
