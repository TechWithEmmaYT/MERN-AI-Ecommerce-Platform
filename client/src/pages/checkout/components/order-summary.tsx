import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/utils/helper";
import { useCart } from "@/hooks/use-cart";
import { Skeleton } from "@/components/ui/skeleton";

const OrderSummary = () => {
  const { deliveryFee, tax, orderTotal, isCartLoading } = useCart(
    (state) => state,
  );
  const cartCount = useCart((state) => state.cartCount());
  const subtotal = useCart((state) => state.cartTotal());

  const finalTotal = orderTotal || subtotal + deliveryFee + tax;

  return (
    <Card className="h-fit bg-background shadow-xs lg:sticky lg:top-24 pt-5">
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            Subtotal ({cartCount} items)
          </span>
          {isCartLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <span className="font-medium text-foreground">
              {formatPrice(subtotal)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Delivery</span>
          {isCartLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
             <span className="font-medium text-primary">
            {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
          </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Tax</span>
          {isCartLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <span className="font-medium text-foreground">
            {formatPrice(tax)}
          </span>
          )}
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4 text-base font-semibold">
          <span>Total</span>
          {isCartLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
             <span>{formatPrice(finalTotal)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
