import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrderType } from "@/types/order.type";
import { formatPrice } from "@/utils/helper";
import { MapPin } from "lucide-react";

type OrderDetailSidebarProps = {
  order: OrderType;
};

const OrderDetailSidebar = ({ order }: OrderDetailSidebarProps) => {
  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
      <Card className="bg-background shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            Delivery address
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{order.shippingAddress.recipientName}</p>
          <p>{order.shippingAddress.street}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.phone}</p>
        </CardContent>
      </Card>

      <Card className="bg-background shadow-xs">
        <CardHeader>
          <CardTitle>Items ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="grid grid-cols-[48px_1fr_auto] items-center gap-3"
            >
              <img
                src={item.image}
                alt={item.name}
                className="size-11 object-contain"
              />
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  x{item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatPrice(item.salePrice * item.quantity)}
              </p>
            </div>
          ))}

          <Separator />

          <div className="flex flex-col gap-3 text-sm">
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
            <div className="flex items-center justify-between gap-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default OrderDetailSidebar;
