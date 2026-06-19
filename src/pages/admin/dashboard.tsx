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
import { DollarSign, ShoppingBag, Package, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getStatusColorClass } from "@/utils/status";
import { starterOrders } from "@/constants/orders";
import { starterProducts } from "@/constants/products";
// import { useQuery } from "@tanstack/react-query";
// import { getAdminAnalyticsQueryFn, getAdminOrdersQueryFn } from "@/lib/api";

export default function AdminDashboardPage() {
  const totalSales = starterOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = starterOrders.length;
  const totalProducts = starterProducts.length;
  const totalOutOfStockProducts = starterProducts.filter(
    (product) => (product.stockCount ?? 0) === 0,
  ).length;
  const recentOrders = starterOrders.slice(0, 7);

  // const { data: analytics, isLoading: analyticsLoading } = useQuery({
  //   queryKey: ["admin-analytics"],
  //   queryFn: getAdminAnalyticsQueryFn,
  // });
  //
  // const { data: ordersData, isLoading: ordersLoading } = useQuery({
  //   queryKey: ["admin-orders", 7],
  //   queryFn: () => getAdminOrdersQueryFn(7),
  // });

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      description: "Total lifetime earnings",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      description: "Lifetime order placements",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      description: "Products in store catalog",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "Out of Stock",
      value: totalOutOfStockProducts,
      icon: AlertTriangle,
      description: "Products with 0 inventory",
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, view store analytics and recent orders.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing up to the last 7 orders.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/orders">View All Orders</Link>
          </Button>
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
                  <TableHead className="px-6 py-2">Total</TableHead>
                  <TableHead className="px-6 py-2">Payment</TableHead>
                  <TableHead className="px-6 py-2">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
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
                            {order.shippingAddress.state},{order.shippingAddress.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
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
                        <Badge
                          className={cn(
                            "capitalize",
                            getStatusColorClass(order.status),
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
