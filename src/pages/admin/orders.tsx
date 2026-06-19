import { useEffect, useMemo, useState } from "react";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { starterOrders } from "@/constants/orders";
import type { OrderType } from "@/types/order.type";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { getAdminOrdersQueryFn, updateOrderStatusMutationFn } from "@/lib/api";

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

const getPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  const items = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const output: Array<number | "ellipsis"> = [];

  items.forEach((page, index) => {
    const previous = items[index - 1];
    if (index > 0 && previous !== undefined && page - previous > 1) {
      output.push("ellipsis");
    }
    output.push(page);
  });

  return output;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>(starterOrders);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1);

  // const { data: ordersData, isLoading } = useQuery({
  //   queryKey: ["admin-orders", page, limit],
  //   queryFn: () => getAdminOrdersQueryFn({ page, limit }),
  // });
  //
  // const orders = ordersData?.orders || [];
  const isLoading = false;

  // const updateStatusMutation = useMutation({
  //   mutationFn: updateOrderStatusMutationFn,
  //   onSuccess: (data) => {
  //     toast.success(data.message || "Order status updated successfully");
  //     queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  //     queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
  //   },
  //   onError: (err: any) => {
  //     const errMsg = err.response?.data?.message || err.message || "Failed to update status";
  //     toast.error(errMsg);
  //   },
  // });

  const updateStatusMutation = {
    isPending: false,
    variables: undefined as { orderId: string } | undefined,
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / limit));
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return orders.slice(start, start + limit);
  }, [orders, page, limit]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((current) =>
      current.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    toast.success("Order status updated locally");
  };

  const startIndex = orders.length === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, orders.length);
  const pageItems = getPaginationItems(page, totalPages);

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">
          Manage and update customer orders status here.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>All Orders ({orders.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-2">Order ID</TableHead>
                  <TableHead className="px-6 py-2">Customer</TableHead>
                  <TableHead className="px-6 py-2">Shipping To</TableHead>
                  <TableHead className="px-6 py-2">Date</TableHead>
                  <TableHead className="px-6 py-2">Items</TableHead>
                  <TableHead className="px-6 py-2">Total</TableHead>
                  <TableHead className="px-6 py-2">Payment</TableHead>
                  <TableHead className="px-6 py-2">Status Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!paginatedOrders || paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-muted/30">
                      <TableCell className="px-6 py-4 font-medium">
                        #{order.orderNo}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.shippingAddress.recipientName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.shippingAddress.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
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
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm max-w-[200px] truncate">
                        {order.items.length} Items
                      </TableCell>
                      <TableCell className="px-6 py-4 font-semibold">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
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
                      <TableCell className="px-6 py-4">
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
                                  (history) =>
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
