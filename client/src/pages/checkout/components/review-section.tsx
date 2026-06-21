import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CartItem } from "@/hooks/use-cart";
import { formatPrice } from "@/utils/helper";
import { MapPin, PackageCheck } from "lucide-react";
import { CheckoutPaymentMethod } from "@/constants/checkout";
import type { AddressType } from "@/types/auth.type";

type ReviewSectionProps = {
  items: CartItem[];
  selectedAddress?: AddressType;
  paymentMethod: CheckoutPaymentMethod | "";
  total: number;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
};

const ReviewSection = ({
  items,
  selectedAddress,
  paymentMethod,
  total,
  onPlaceOrder,
  isPlacingOrder,
}: ReviewSectionProps) => {
  const buttonText =
    paymentMethod === CheckoutPaymentMethod.CARD
      ? "Continue to payment"
      : "Place order";

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-muted/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="size-4 text-primary" />
          Delivery address
        </div>
        {selectedAddress ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedAddress.street},{" "}
            {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.postalCode}, {selectedAddress.country}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Select a delivery address.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const hasDiscount = item.originalPrice > item.salePrice;

          return (
            <div
              key={item.productId}
              className="grid grid-cols-[64px_1fr_auto] items-center gap-4"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="size-14 object-contain"
              />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={
                      hasDiscount
                        ? "mark-label text-sm font-semibold text-foreground"
                        : "text-sm font-semibold text-foreground"
                    }
                  >
                    {formatPrice(item.salePrice * item.quantity)}
                  </span>
                  {hasDiscount ? (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(item.originalPrice * item.quantity)}
                    </span>
                  ) : null}
                </div>
                {item.discountLabel ? (
                  <span className="text-xs font-medium text-primary">
                    {item.discountLabel}
                  </span>
                ) : item.discountPercent ? (
                  <span className="text-xs font-medium text-primary">
                    {item.discountPercent}% off
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <Button
        size="lg"
        type="button"
        className="h-11 rounded-full text-base font-semibold"
        disabled={!selectedAddress || !paymentMethod || items.length === 0 || isPlacingOrder}
        onClick={onPlaceOrder}
      >
        <PackageCheck data-icon="inline-start" />
        {isPlacingOrder ? "Placing order..." : `${buttonText} - ${formatPrice(total)}`}
      </Button>
    </div>
  );
};

export default ReviewSection;
