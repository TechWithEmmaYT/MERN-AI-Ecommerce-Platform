import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { PROTECTED_ROUTES } from "@/routes/route";
import { formatPrice } from "@/utils/helper";
import { Minus, Plus, Trash2, X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/use-user";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "./ui/skeleton";

const CartSheet = () => {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { openAuth } = useAuth();
  const {
    isCartOpen,
    setIsCartOpen,
    isCartLoading,
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    freeDeliveryThreshold,
  } = useCart((state) => state);
  const cartCount = useCart((state) => state.cartCount());
  const subtotal = useCart((state) => state.cartTotal());

  const handleCheckout = () => {
    if (!user) {
      openAuth("login");
    } else {
      setIsCartOpen(false);
      navigate(PROTECTED_ROUTES.CHECKOUT);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="w-full! gap-0 p-0 sm:max-w-none!  md:2/3!  lg:w-2/7!"
        showCloseButton={false}
      >
        <SheetHeader
          className="flex-row items-center justify-between 
        border-b border-border px-5 py-4 text-left"
        >
          <SheetTitle className="text-xl font-semibold">Your Cart</SheetTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X />
          </Button>
        </SheetHeader>

        <div className="border-b border-border px-5 py-4">
          <p className="text-base font-semibold text-foreground">Instant</p>
          <p className="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
            <Zap className="size-4 fill-current" />
            Delivery in 30-45 min
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <p className="text-lg font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Add groceries from the product pages and they will show up here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => {
                const hasDiscount = item.originalPrice > item.salePrice;

                return (
                  <div
                    key={item.productId}
                    className="grid grid-cols-[88px_1fr] gap-4 px-5 py-3"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="size-20 object-contain"
                    />

                    <div className="flex min-w-0 flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-[14.5px] font-normal! text-muted-foreground max-w-[350px]">
                            {item.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span className={hasDiscount ? "mark-label" : ""}>
                              {formatPrice(item.salePrice)}
                            </span>
                            {hasDiscount ? (
                              <span className="text-muted-foreground line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            ) : null}
                          </div>
                          {item.discountLabel ? (
                            <p className="mt-1 text-sm font-medium text-primary">
                              {item.discountLabel}
                            </p>
                          ) : item.discountPercent ? (
                            <p className="mt-1 text-sm font-medium text-primary">
                              {item.discountPercent}% off
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center rounded-full border border-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              item.quantity === 1
                                ? removeFromCart(item.productId)
                                : updateQuantity(
                                    item.productId,
                                    item.quantity - 1,
                                  )
                            }
                          >
                            {item.quantity === 1 ? <Trash2 /> : <Minus />}
                          </Button>
                          <span className="min-w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Item total{" "}
                        <span className="font-semibold text-foreground">
                          {formatPrice(item.salePrice * item.quantity)}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border p-4">
          {isCartLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : (
            <>
              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-fit text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear cart
                </button>
              ) : null}

              <div className="flex items-center justify-between text-base font-semibold text-foreground">
                <span>Item subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="h-px!" />
              {freeDeliveryThreshold > 0 && (
                <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                  {subtotal >= freeDeliveryThreshold
                    ? "$0 delivery fee unlocked 🎉"
                    : `Add ${formatPrice(freeDeliveryThreshold - subtotal)} to get $0 delivery fee`}
                </div>
              )}

              <Button
                disabled={cartCount === 0}
                className="h-12 text-base font-semibold 
            disabled:pointer-events-none disabled:bg-neutral-200  disabled:text-neutral-500"
                onClick={handleCheckout}
              >
                <div className="w-full flex items-center justify-between px-4">
                  {cartCount === 0 ? (
                    "Add item to checkout"
                  ) : (
                    <>
                      <span>Go to Checkout</span>
                      <span>{formatPrice(subtotal)}</span>
                    </>
                  )}
                </div>
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
