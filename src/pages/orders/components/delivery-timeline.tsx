import { cn } from "@/lib/utils";
import { orderStatusLabels, type OrderStatus } from "@/constants/orders";
import { Check, CircleX, Clock3, Package, PackageCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const steps: Array<{
  status: OrderStatus;
  icon: LucideIcon;
}> = [
  { status: "placed", icon: Clock3 },
  { status: "confirmed", icon: Check },
  { status: "assigned", icon: Truck },
  { status: "packed", icon: Package },
  { status: "out_for_delivery", icon: Truck },
  { status: "delivered", icon: PackageCheck },
];

type DeliveryTimelineProps = {
  status: string;
  placedAt: string;
};

const DeliveryTimeline = ({ status, placedAt }: DeliveryTimelineProps) => {
  const normStatus = (status.toLowerCase()) as OrderStatus;
  const displaySteps =
    normStatus === "cancelled"
      ? [
          { status: "placed" as const, icon: Clock3 },
          { status: "cancelled" as const, icon: CircleX },
        ]
      : steps;
  const currentIndex = displaySteps.findIndex((step) => step.status === normStatus);
  const placedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(placedAt));

  return (
    <div className="rounded-xl bg-background p-6 shadow-xs ring-1 ring-foreground/10">
      <h2 className="text-lg font-semibold text-foreground">Delivery Tracking</h2>

      <div className="mt-6 flex flex-col">
        {displaySteps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isMuted = index > currentIndex;
          const isCancelled = step.status === "cancelled";
          const isLast = index === displaySteps.length - 1;
          const lineIsActive = index < currentIndex;
          const lineIsCancelled = normStatus === "cancelled" && index === 0;

          return (
            <div
              key={step.status}
              className="grid min-h-24 grid-cols-[44px_1fr] gap-4 last:min-h-0"
            >
              <div className="relative flex justify-center">
                {!isLast ? (
                  <span className="absolute left-1/2 top-8 h-full w-1 -translate-x-1/2 rounded-full bg-border" />
                ) : null}
                {!isLast && (lineIsActive || lineIsCancelled) ? (
                  <span
                    className={cn(
                      "absolute left-1/2 top-8 h-full w-1 -translate-x-1/2 rounded-full bg-primary",
                      lineIsCancelled && "bg-destructive"
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 grid size-9 place-items-center rounded-full border-2 border-border bg-background text-muted-foreground",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    isCurrent &&
                      !isCancelled &&
                      "border-primary ring-4 ring-primary/15",
                    isCancelled &&
                      "border-destructive bg-destructive text-destructive-foreground ring-4 ring-destructive/10"
                  )}
                >
                  <Icon className="size-4" />
                </span>
              </div>

              <div className={cn("pb-6 pt-1", isMuted && "text-muted-foreground")}>
                <p
                  className={cn(
                    "font-semibold text-foreground",
                    isCancelled && "text-destructive"
                  )}
                >
                  {orderStatusLabels[step.status]}
                </p>
                {step.status === "placed" ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {placedDate}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryTimeline;
