import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useCart } from "@/hooks/use-cart";
import { PUBLIC_ROUTES } from "@/routes/route";
import { ArrowLeft, CreditCard, MapPin, PackageCheck, ShoppingCart } from "lucide-react";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddressSection from "./components/address-section";
import OrderSummary from "./components/order-summary";
import PaymentSection from "./components/payment-section";
import ReviewSection from "./components/review-section";
import { CheckoutPaymentMethod } from "@/constants/checkout";
import {
  type AddressFormValues,
} from "@/constants/address";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAddressesQueryFn,
  createAddressMutationFn,
  createOrderMutationFn,
} from "@/lib/api";
import { toast } from "sonner";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {items, orderTotal, resetCart} = useCart((state) => state);
  const cartCount = useCart((state) => state.cartCount());

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod | "">("");
  const [openPanel, setOpenPanel] = useState("address");

 
  const { data: addressData, isLoading: isAddressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddressesQueryFn,
  });
  const addresses = addressData?.addresses || [];


  // Auto-select default address if available
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else {
        setSelectedAddressId(addresses[0]._id);
      }
    }
  }, [addresses, selectedAddressId]);


  const selectedAddress = useMemo(
    () => addresses.find((address) => address._id === selectedAddressId),
    [addresses, selectedAddressId]
  );

 const createAddressMutation = useMutation({
    mutationFn: createAddressMutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setSelectedAddressId(data.address._id);
      setOpenPanel("payment");
      toast.success("Address saved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add address");
    },
  });


  const createOrderMutation = useMutation({
    mutationFn: createOrderMutationFn,
    onSuccess: (data) => {
      if (data.stripeUrl) {
        window.location.href = data.stripeUrl;
      } else {
        resetCart();
        navigate(`/orders/${data.order._id}?success=true`);
      }
      toast.success("Order placed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to place order");
    },
  });


  const handleAddAddress = (values: AddressFormValues) => {
    createAddressMutation.mutate(values);
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setOpenPanel("payment");
  };

  const handleSelectPaymentMethod = (method: CheckoutPaymentMethod) => {
    setPaymentMethod(method);
    setOpenPanel("review");
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId || !paymentMethod) return;
    createOrderMutation.mutate({
      addressId: selectedAddressId,
      paymentMethod,
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[520px] items-center justify-center py-12">
        <Empty className="border border-border">
          <EmptyMedia variant="icon">
            <ShoppingCart />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyDescription>
              Add groceries to your cart before checkout.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="lg" asChild>
              <Link to={PUBLIC_ROUTES.PRODUCTS}>Shop products</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }


  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Review delivery, payment, and order details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Accordion
          type="single"
          collapsible
          value={openPanel}
          onValueChange={(value) => setOpenPanel(value || "")}
          className="gap-4"
        >
          <CheckoutPanel
            value="address"
            icon={<MapPin className="size-4" />}
            title="Delivery address"
            description={
              selectedAddress
                ? `${selectedAddress.street}, ${selectedAddress.city}`
                : "Select delivery address"
            }
          >
            <AddressSection
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={handleSelectAddress}
              onAddAddress={handleAddAddress}
              isAdding={createAddressMutation.isPending}
              isLoading={isAddressesLoading}
            />
          </CheckoutPanel>

          <CheckoutPanel
            value="payment"
            icon={<CreditCard className="size-4" />}
            title="Payment method"
            description={
              !selectedAddress
                ? "Select delivery address first"
                : paymentMethod === CheckoutPaymentMethod.CARD
                ? "Card / Debit card"
                : paymentMethod === CheckoutPaymentMethod.CASH_ON_DELIVERY
                ? "Cash on delivery"
                : "Choose payment option"
            }
          >
            <PaymentSection
              paymentMethod={paymentMethod}
              onPaymentMethodChange={handleSelectPaymentMethod}
              disabled={!selectedAddress}
            />
          </CheckoutPanel>

          <CheckoutPanel
            value="review"
            icon={<PackageCheck className="size-4" />}
            title="Review order"
            description={`${cartCount} item${cartCount === 1 ? "" : "s"}`}
          >
            <ReviewSection
              items={items}
              total={orderTotal}
              selectedAddress={selectedAddress}
              paymentMethod={paymentMethod}
              onPlaceOrder={handlePlaceOrder}
              isPlacingOrder={createOrderMutation.isPending}
            />
          </CheckoutPanel>
        </Accordion>

        <OrderSummary />
      </div>
    </div>
  );
};

type CheckoutPanelProps = {
  value: string;
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

const CheckoutPanel = ({
  value,
  icon,
  title,
  description,
  children,
}: CheckoutPanelProps) => {
  return (
    <AccordionItem
      value={value}
      className="rounded-xl border-0 bg-background px-4 shadow-xs ring-1 ring-foreground/10"
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            {icon}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-base font-semibold text-foreground">
              {title}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {description}
            </span>
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
};

export default CheckoutPage;
