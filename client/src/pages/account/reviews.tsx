import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MessageSquareText, PackageCheck, Star } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReviewMutationFn, getReviewableOrderItemsQueryFn, getUserReviewsQueryFn } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};


type SubmittedEntry = {
  _id: string;
  productId: {
    slug: string;
    images: string[];
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};



const AccountReviewsPage = () => {
  const { data: reviewableData, isLoading: loadingReviewable } = useQuery({
    queryKey: ["reviewable-items"],
    queryFn: getReviewableOrderItemsQueryFn,
  });
  
  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ["user-reviews"],
    queryFn: getUserReviewsQueryFn,
  });

  const reviewableList = (reviewableData?.orders || []).flatMap(
    (order:any) => order.items
      .filter((i:any) => !i.isReviewed)
      .map((item:any) => ({
        item:item,
        orderId:order._id,
        orderNo: order.orderNo,
        orderDate: order.createdAt
      }))
    )

  const submittedList = reviewsData?.reviews || []

  if (loadingReviewable || loadingReviews) {
    return (
      <div className="flex w-full max-w-5xl flex-col gap-4 py-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="bg-background shadow-xs">
            <CardContent className="grid gap-4 p-4 md:grid-cols-[76px_1fr]">
              <Skeleton className="size-18 rounded-xl" />
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-24 w-full" />
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-32 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 py-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Ratings & reviews
        </h1>
        <p className="text-sm text-muted-foreground">
          Rate recent groceries and manage reviews from past orders.
        </p>
      </div>

      <Tabs defaultValue="to-review" className="gap-5">
        <TabsList>
          <TabsTrigger value="to-review">
            To review ({reviewableList.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({submittedList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="to-review" className="flex flex-col gap-4">
          {reviewableList.length > 0 ? (
            reviewableList.map((entry:any) => (
              <ReviewPromptCard
                key={`${entry.orderId}-${entry.item._id}`}
                item={entry.item}
                orderId={entry.orderId}
                orderDate={entry.orderDate}
                orderNo={entry.orderNo}
              />
            ))
          ) : (
            <Empty className="border border-border">
              <EmptyMedia variant="icon">
                <MessageSquareText />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>All caught up</EmptyTitle>
                <EmptyDescription>
                  Products ready for review will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="flex flex-col gap-4">
          {submittedList.length > 0 ? (
            submittedList.map((review:any) => (
              <SubmittedReviewCard key={review._id} review={review} />
            ))
          ) : (
            <Empty className="border border-border">
              <EmptyMedia variant="icon">
                <MessageSquareText />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No reviews yet</EmptyTitle>
                <EmptyDescription>
                  Reviews you submit will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StarRating = ({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;
        const isActive = rating <= value;

        return (
          <button
            key={rating}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(rating)}
            className={cn(
              "rounded-sm text-muted-foreground transition-colors",
              !readOnly && "cursor-pointer hover:text-secondary",
              isActive && "text-secondary",
            )}
            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
          >
            <Star className="size-5 fill-current stroke-current" />
          </button>
        );
      })}
    </div>
  );
};

const ReviewPromptCard = ({
  item,
  orderId,
  orderDate,
  orderNo
}: {
  item: {
    _id: string;
    image: string;
    name: string;
    slug: string;
  };
  orderId: string;
  orderNo:string;
  orderDate: string;
}) => {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: createReviewMutationFn,
    onSuccess: (data) => {
      toast.success(data.message || "Review submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviewable-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
    },
    onError: (err: any) => {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit review";
      toast.error(errMsg);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) return;
    createReviewMutation.mutate({
      orderId,
      orderItemId: item._id,
      rating,
      comment: body,
    });
  };

  return (
    <Card className="bg-background shadow-xs">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[76px_1fr]">
        <div className="grid size-18 place-items-center rounded-xl border border-border bg-background">
          <img src={item.image} alt={item.name} className="size-14 object-contain" />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="line-clamp-2 text-base font-semibold text-foreground">
              {item.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Ordered on {formatDate(orderDate)}
            </p>
          </div>

          <StarRating value={rating} onChange={setRating} />

          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share what other shoppers should know."
            className="min-h-20"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Order #{orderNo}
            </p>
            <Button
              size="lg"
              disabled={rating === 0 || createReviewMutation.isPending}
              onClick={handleSubmit}
            >
              {createReviewMutation.isPending && <Spinner />}
              Submit review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SubmittedReviewCard = ({ review }: { review: SubmittedEntry }) => {
  const productUrl = `/products/${review.productId.slug}`;

  return (
    <Card className="bg-background shadow-xs">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[76px_1fr]">
        <Link
          to={productUrl}
          className="grid size-18 place-items-center rounded-xl border border-border bg-background transition-colors hover:border-primary/50"
        >
          <img
            src={review.productId.images[0] || "/placeholder.png"}
            alt={review.productId.name}
            className="size-14 object-contain"
          />
        </Link>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-base font-semibold text-foreground transition-colors hover:text-primary">
                <Link to={productUrl}>{review.productId.name}</Link>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reviewed on {formatDate(review.createdAt)}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-primary"
            >
              <PackageCheck className="mr-1 size-3.5" />
              Verified purchase
            </Badge>
          </div>

          <StarRating value={review.rating} readOnly />
          <p className="text-sm leading-6 text-muted-foreground">{review.comment}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountReviewsPage;
