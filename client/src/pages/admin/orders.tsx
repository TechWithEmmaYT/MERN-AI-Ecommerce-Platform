import { useState } from "react";
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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getStatusColorClass } from "@/utils/status";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminOrdersResponse } from "@/types/order.type";
import { getAdminOrdersQueryFn, updateOrderStatusMutationFn } from "@/lib/api";

const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  assigned: "Assigned",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ALL_STATUS_KEYS = [
  "placed",
  "confirmed",
  "assigned",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: ordersData, isLoading } = useQuery<AdminOrdersResponse>({
    queryKey: ["admin-orders", page, limit],
    queryFn: () => getAdminOrdersQueryFn({ page, limit }),
  });

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatusMutationFn,
    onSuccess: (data) => {
      toast.success(data.message || "Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Failed to update status";
      toast.error(errMsg);
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-1 h-4 w-56" />
        </div>
        <Card className="border-border">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Order ID", "Customer", "Shipping To", "Date", "Items", "Total", "Payment", "Status Update"].map((h) => (
                      <TableHead key={h} className="px-6 py-2">
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full max-w-28" />
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">
          Manage and update customer orders status here.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>All Orders ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-2">Order ID</TableHead>
                  <TableHead className="px-2 py-2">Customer</TableHead>
                  <TableHead className="px-2 py-2">Shipping To</TableHead>
                  <TableHead className="px-2 py-2">Date</TableHead>
                  <TableHead className="px-2 py-2">Items</TableHead>
                  <TableHead className="px-2 py-2">Total</TableHead>
                  <TableHead className="px-2 py-2">Payment</TableHead>
                  <TableHead className="px-2 py-2">Status Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!orders || orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: any) => (
                    <TableRow key={order._id} className="hover:bg-muted/30 text-[13px]!">
                      <TableCell className="px-6 py-2 font-medium">
                        #{order.orderNo}
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.shippingAddress.recipientName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.shippingAddress.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {order.shippingAddress.recipientName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.shippingAddress.street}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.shippingAddress.state}, {order.shippingAddress.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-2 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-sm max-w-[200px] truncate">
                        {order.items.length} Items
                      </TableCell>
                      <TableCell className="px-2 py-2 font-semibold">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            order.paymentStatus === "paid"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          )}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-2">
                        <Select
                          disabled={
                            order.status === "delivered" ||
                            order.status === "cancelled" ||
                            (updateStatusMutation.isPending &&
                              updateStatusMutation.variables?.orderId === order._id)
                          }
                          value={order.status}
                          onValueChange={(val) => handleStatusChange(order._id, val)}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-9 w-[160px] font-medium capitalize",
                              getStatusColorClass(order.status),
                            )}
                          >
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={order.status}>
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </SelectItem>
                            {ALL_STATUS_KEYS.filter(
                              (statusKey) =>
                                statusKey !== order.status &&
                                !order.statusHistory?.some(
                                  (history: any) =>
                                    history.status.toLowerCase() ===
                                    statusKey.toLowerCase(),
                                ),
                            ).map((statusKey) => (
                              <SelectItem key={statusKey} value={statusKey}>
                                {ORDER_STATUS_LABELS[statusKey]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex-1 text-sm text-muted-foreground">
              Page {pagination?.page || 1} of {totalPages} ({pagination?.total || 0} orders)
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
