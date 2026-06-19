import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  PackageSearch, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  CreditCard, 
  Calendar,
  ShoppingBag
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import { getOrderByIdQueryFn } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import OrderStatusBadge from "./components/order-status-badge";
import { formatPrice } from "@/utils/helper";
import { getStarterOrderById } from "@/constants/orders";

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const STEP_CONFIG = [
  { status: "placed", label: "Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: Clock },
  { status: "packed", label: "Packed", icon: Package },
  { status: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const OrderTrackingPage = () => {
  const { orderId } = useParams();

  // const { data, isLoading } = useQuery({
  //   queryKey: ["order", orderId],
  //   queryFn: () => getOrderByIdQueryFn(orderId!),
  //   enabled: !!orderId,
  // });
  //
  // const order = data?.order;
  const isLoading = false;
  const order = orderId ? getStarterOrderById(orderId) : undefined;

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-2">
        <Button variant="link" className="w-fit px-0 text-muted-foreground animate-pulse" asChild>
          <Link to="/orders">
            <ArrowLeft data-icon="inline-start" />
            Back to orders
          </Link>
        </Button>
        <div className="flex flex-wrap gap-4 animate-pulse">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] animate-pulse">
          <div className="flex min-w-0 flex-col gap-6">
            <Skeleton className="h-[100px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-5">
            <Skeleton className="h-[150px] w-full rounded-xl" />
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[520px] items-center justify-center py-12">
        <Empty className="border border-border">
          <EmptyMedia variant="icon">
            <PackageSearch />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Order not found</EmptyTitle>
            <EmptyDescription>
              This order may have been removed or the link is incorrect.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="lg" asChild>
              <Link to="/orders">Back to orders</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const normalizedStatus = order.status.toLowerCase();
  const isCancelled = normalizedStatus === "cancelled";
  const currentStepIndex = STEP_CONFIG.findIndex(s => s.status === normalizedStatus) === -1 
    ? (normalizedStatus === "assigned" ? 1 : 0)
    : STEP_CONFIG.findIndex(s => s.status === normalizedStatus);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-2">
      <Button variant="link" className="w-fit px-0 text-muted-foreground" asChild>
        <Link to="/orders">
          <ArrowLeft data-icon="inline-start" />
          Back to orders
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">
            Order #{order.orderNo}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status as any} />
      </div>

      {/* Horizontal Stepper */}
      <Card className="bg-primary/5 border border-primary/10 shadow-xs rounded-2xl">
        <CardContent className="p-6">
          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
              <XCircle className="size-5 shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">Order Cancelled</h3>
                <p className="text-xs opacity-90">This order has been cancelled and cannot be tracked further.</p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-between w-full">
              {/* Connector line behind the steps */}
              <div className="absolute left-[10%] right-[10%] top-4 h-1.5 bg-muted-foreground/10 rounded-full -translate-y-1/2">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${(currentStepIndex / (STEP_CONFIG.length - 1)) * 100}%` 
                  }}
                />
              </div>

              {STEP_CONFIG.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isActive = idx <= currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center z-10 flex-1">
                    {/* Circle icon */}
                    <div 
                      className={`grid size-9 place-items-center rounded-full border-2 transition-all duration-300 ${
                        isCompleted 
                          ? "border-primary bg-primary text-primary-foreground shadow-md" 
                          : isCurrent 
                          ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 font-bold shadow-md" 
                          : "border-muted-foreground/30 text-muted-foreground bg-background"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span className={`mt-2 text-[10px] md:text-xs font-semibold ${
                      isCurrent 
                        ? "text-primary font-bold" 
                        : isActive 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Details Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Items */}
        <div className="flex flex-col gap-6">
          <Card className="bg-background shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShoppingBag className="size-4 text-primary" />
                Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="grid grid-cols-[48px_1fr_auto] items-center gap-4 py-2 first:pt-0 last:pb-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-12 rounded-lg object-contain border border-border"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} · {formatPrice(item.salePrice)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {formatPrice(item.salePrice * item.quantity)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card className="bg-background shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div className="relative border-l border-border pl-4 ml-2 space-y-6 py-2">
                  {order.statusHistory.map((history, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border border-background bg-primary" />
                      <div>
                        <p className="text-sm font-semibold capitalize text-foreground">
                          {history.status}
                        </p>
                        {history.note && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {history.note}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDate(history.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No history records found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar (Address & Totals) */}
        <aside className="flex flex-col gap-6">
          {/* Shipping Address */}
          <Card className="bg-background shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Delivery address
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                {order.shippingAddress.recipientName}
              </p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="mt-1">{order.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          {/* Payment & Summary */}
          <Card className="bg-background shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                Payment summary
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground capitalize">
                    {order.paymentMethod.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="font-medium capitalize text-primary">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-primary">
                    {order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(order.tax)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4 text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
