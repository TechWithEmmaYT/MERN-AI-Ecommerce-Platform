import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { orderStatusLabels, type OrderStatus } from "@/constants/orders";

type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

const statusClassNames: Record<OrderStatus, string> = {
  placed: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
  assigned: "bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20",
  packed: "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20",
  out_for_delivery: "bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
};

const OrderStatusBadge = ({ status, className }: OrderStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-7 border-0 px-3 capitalize",
        statusClassNames[status],
        className
      )}
    >
      {orderStatusLabels[status]}
    </Badge>
  );
};

export default OrderStatusBadge;
