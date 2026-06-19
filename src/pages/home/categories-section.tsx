import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import bakeryImage from "@/assets/cats-img/Bakery.png";
import babyCareImage from "@/assets/cats-img/Baby Care.png";
import beveragesImage from "@/assets/cats-img/Beverages.png";
import frozenFoodsImage from "@/assets/cats-img/Frozen Foods.png";
import fruitsAndVegetablesImage from "@/assets/cats-img/Fruits & Vegetables.png";
import meatAndSeafoodImage from "@/assets/cats-img/Meat & Seafood.png";
import pantryStaplesImage from "@/assets/cats-img/Pantry Staples.png";
import personalCareImage from "@/assets/cats-img/Personal Care.png";
import snacksImage from "@/assets/cats-img/Snacks.png";
// import { useQuery } from "@tanstack/react-query";
// import { getAllCategoriesQueryFn } from "@/lib/api";

type CategoryItem = {
  _id: string;
  name: string;
  imageUrl: string;
};

const categories: CategoryItem[] = [
  { _id: "bakery", name: "Bakery", imageUrl: bakeryImage },
  { _id: "baby-care", name: "Baby Care", imageUrl: babyCareImage },
  { _id: "beverages", name: "Beverages", imageUrl: beveragesImage },
  { _id: "frozen-foods", name: "Frozen Foods", imageUrl: frozenFoodsImage },
  {
    _id: "fruits-vegetables",
    name: "Fruits & Vegetables",
    imageUrl: fruitsAndVegetablesImage,
  },
  { _id: "meat-seafood", name: "Meat & Seafood", imageUrl: meatAndSeafoodImage },
  { _id: "pantry-staples", name: "Pantry Staples", imageUrl: pantryStaplesImage },
  { _id: "personal-care", name: "Personal Care", imageUrl: personalCareImage },
  { _id: "snacks", name: "Snacks", imageUrl: snacksImage },
];

const CategoriesSection = () => {
  // const { data, isLoading } = useQuery({
  //   queryKey: ["categories"],
  //   queryFn: getAllCategoriesQueryFn,
  // });
  //
  // const categories = data?.categories ?? [];

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
