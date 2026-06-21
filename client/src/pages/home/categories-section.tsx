import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllCategoriesQueryFn } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";



const CategoriesSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategoriesQueryFn,
  });
  
  const categories = data?.categories ?? [];

   if (isLoading) {
    return (
      <section className="py-4 mb-7">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-4 overflow-hidden pl-1">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3 basis-1/4 sm:basis-1/5 md:basis-[10.5%] shrink-0"
              >
                <Skeleton className="size-20 rounded-xl sm:size-24" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-4 mb-7">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-foreground">Shop by category</h2>

        <Carousel
          opts={{
            align: "start",
          }}
          className="group w-full"
        >
          <CarouselContent className="-ml-4">
            
            {categories.map((category) => (
              <CarouselItem
                key={category._id}
                className="basis-1/4 pl-4 sm:basis-1/5 md:basis-[10.5%]"
              >
                <Link
                  className="flex w-full flex-col items-center gap-3 text-center"
                  to={`/products?category=${category._id}`}
                >
                  <span className="flex size-20 items-center justify-center rounded-xl p-0.5 transition hover:bg-muted group-hover:scale-105 sm:size-24">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="size-full object-contain"
                    />
                  </span>
                  <span className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
                    {category.name}
                  </span>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 size-10! hidden bg-background shadow-lg lg:inline-flex" />
          <CarouselNext className="-right-4 size-10! bg-background shadow-lg" />
        </Carousel>
      </div>
    </section>
  );
};

export default CategoriesSection;
