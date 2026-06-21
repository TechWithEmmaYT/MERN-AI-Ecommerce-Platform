import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Banknote, CreditCard, ShieldCheck } from "lucide-react";
import { CheckoutPaymentMethod } from "@/constants/checkout";

type PaymentSectionProps = {
  paymentMethod: CheckoutPaymentMethod | "";
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  disabled?: boolean;
};

const paymentOptions = [
  {
    value: CheckoutPaymentMethod.CARD,
    title: "Card / Debit card",
    description: "Pay securely with card.",
    icon: CreditCard,
  },
  {
    value: CheckoutPaymentMethod.CASH_ON_DELIVERY,
    title: "Cash on delivery",
    description: "Pay when your groceries arrive.",
    icon: Banknote,
  },
];

const PaymentSection = ({
  paymentMethod,
  onPaymentMethodChange,
  disabled = false,
}: PaymentSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        value={paymentMethod}
        disabled={disabled}
        onValueChange={(value) =>
          onPaymentMethodChange(value as CheckoutPaymentMethod)
        }
      >
        {paymentOptions.map((option) => {
          const isSelected = paymentMethod === option.value;
          const Icon = option.icon;

          return (
            <Label
              key={option.value}
              htmlFor={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 transition-colors",
                disabled && "cursor-not-allowed opacity-50",
                isSelected && "border-primary bg-primary/5"
              )}
            >
              <RadioGroupItem
                id={option.value}
                value={option.value}
                className="mt-1"
              />
              <span className="flex min-w-0 flex-1 gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-medium text-foreground">{option.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </span>
            </Label>
          );
        })}
      </RadioGroup>

      {paymentMethod === CheckoutPaymentMethod.CARD ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Stripe card payment
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            The backend will create the checkout session, then redirect the
            customer to Stripe to finish payment.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default PaymentSection;
