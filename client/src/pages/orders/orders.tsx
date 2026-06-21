import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { PUBLIC_ROUTES } from "@/routes/route";
import { formatPrice } from "@/utils/helper";
import { ChevronRight, PackageSearch, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import OrderStatusBadge from "./components/order-status-badge";
import { useQuery } from "@tanstack/react-query";
import { getOrdersQueryFn } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const OrdersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrdersQueryFn,
  });
  
  const ordersList = data?.orders || [];


  return (
    <div className="flex w-full max-w-4xl flex-col gap-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Order history</h1>
        <p className="text-sm text-muted-foreground">
          Track deliveries and review past grocery orders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="bg-background shadow-xs">
              <CardContent className="p-4 flex gap-4 animate-pulse">
                <Skeleton className="size-14 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : ordersList.length === 0 ? (
        <div className="flex min-h-[520px] items-center justify-center py-12">
          <Empty className="border border-border">
              <PackageSearch className="size-8" />
            <EmptyHeader>
              <EmptyTitle className="text-base">No orders yet</EmptyTitle>
              <EmptyDescription className="text-sm -mt-px">
                Your grocery orders will show up here after checkout.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="lg" asChild>
                <Link to={PUBLIC_ROUTES.PRODUCTS}>Shop products</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ordersList.map((order) => (
            <Card key={order._id} className="bg-background shadow-xs">
              <CardContent className="p-4 py-1!">
                <Link
                  to={`/orders/${order._id}`}
                  className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <span
                          key={idx}
                          className="grid size-14 place-items-center rounded-xl border border-border bg-background"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-10 object-contain"
                          />
                        </span>
                      ))}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">
                          Order #{order.orderNo}
                        </h2>
                        <OrderStatusBadge status={order.status as any} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                      <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"} -{" "}
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <span className="grid size-9 place-items-center rounded-full bg-muted text-foreground">
                      <ChevronRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button variant="outline" className="w-fit" asChild>
        <Link to={PUBLIC_ROUTES.PRODUCTS}>
          <ShoppingBasket data-icon="inline-start" />
          Continue shopping
        </Link>
      </Button>
    </div>
  );
};

export default OrdersPage;
