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
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminProductsQueryFn } from "@/lib/api";

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products", page, limit],
    queryFn: () => getAdminProductsQueryFn({ page, limit }),
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-1 h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Card className="border-border">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Product", "Slug", "Original Price", "Discount(%)", "Sale Price", "Stock Count", "Status"].map((h) => (
                      <TableHead key={h} className="px-6 py-2">
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full max-w-32" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your store catalog and product inventory.</p>
        </div>
        <Button size="lg" className="flex items-center gap-2 px-4!" onClick={() => navigate("/admin/products/new")}>
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Catalog ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-2">Product</TableHead>
                  <TableHead className="px-2 py-2">Slug</TableHead>
                  <TableHead className="px-2 py-2">Original Price</TableHead>
                  <TableHead className="px-2 py-2">Discount(%)</TableHead>
                  <TableHead className="px-2 py-2">Sale Price</TableHead>
                  <TableHead className="px-2 py-2">Stock Count</TableHead>
                  <TableHead className="px-2 py-2">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product: any) => (
                    <TableRow key={product._id} className="hover:bg-muted/30 text-[13px]!">
                      <TableCell className="px-4 py-2">
                        <Link
                          to={PUBLIC_ROUTES.PRODUCT_DETAIL.replace(":slug", product.slug)}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover border"
                          />
                          <div className="flex flex-col">
                            <p className="font-medium truncate max-w-[270px]">{product.name}</p>
                            <span className="text-xs text-muted-foreground">{product.unit || "unit"}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="px-2 py-2 text-sm font-mono text-muted-foreground truncate max-w-[170px]">
                        {product.slug}
                      </TableCell>
                      <TableCell className="px-2 py-2 font-medium text-muted-foreground">
                        ${product.originalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-2 py-2 font-semibold text-foreground">
                        {product.discountPercent ? `${product.discountPercent}%` : "-"}
                      </TableCell>
                      <TableCell className="px-2 py-2 font-semibold text-foreground">
                        ${product.salePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <span className={`font-semibold ${product.stockCount === 0 ? "text-destructive" : "text-foreground"}`}>
                          {product.stockCount}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-2">
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

          <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex-1 text-sm text-muted-foreground">
              Page {pagination?.page || 1} of {totalPages} ({pagination?.total || 0} products)
            </p>
                    <Pagination className="flex-1 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination?.hasPrevPage) setPage(page - 1);
                    }}
                    className={!pagination?.hasPrevPage ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="flex h-9 w-9 items-center justify-center text-sm font-medium">
                    {page}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination?.hasNextPage) setPage(page + 1);
                    }}
                    className={!pagination?.hasNextPage ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
