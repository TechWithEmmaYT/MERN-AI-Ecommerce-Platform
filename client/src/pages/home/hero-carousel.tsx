import carouselImageThree from "@/assets/images/carosuel-img-3.png";
import carouselImageOne from "@/assets/images/carousel-img-1.png";
import carouselImageTwo from "@/assets/images/carousel-img-2.png";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PUBLIC_ROUTES } from "@/routes/route";
import { Link } from "react-router-dom";

const heroSlides = [
  
  {
    id: "carousel-2",
    subtitle: "New customers",
    title: (
      <>
        <span className="mark-label">$0 delivery fees</span> <br /> on above $20
        orders
      </>
    ),
    action: "Shop now",
    note: "Min spend $20. No delivery or service fees apply.",
    image: carouselImageTwo,
  },
  
  {
    id: "carousel-3",
    subtitle: "Fresh picks daily",
    title: "Build your week around produce that tastes better",
    action: "Explore recipes",
    note: "Seasonal groceries delivered when you need them.",
    image: carouselImageThree,
  },
  {
    id: "carousel-1",
    subtitle: "Feeding Everyone x instant",
    title: "For 21M kids, summer break means no lunch",
    action: "Donate groceries",
    note: "Help families get fresh food this season.",
    image: carouselImageOne,
  },
];

const HeroCarousel = () => {
  return (
    <section className="w-full py-5">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {heroSlides.map((slide) => (
            <CarouselItem
              key={slide.id}
              className="basis-full pl-4 lg:basis-1/2"
            >
              <article className="relative h-[250px] overflow-hidden shadow-xs rounded-xl border
               border-border bg-card md:h-[260px]">
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />

                <div className="relative z-10 flex h-full sm:max-w-[50%] flex-col justify-center gap-5 p-7 md:p-9">
                  {slide.subtitle && (
                    <p className="text-sm font-bold uppercase text-primary">
                      {slide.subtitle}
                    </p>
                  )}
                  <h1 className="text-2xl font-bold leading-tight md:text-2xl text-black">
                    {slide.title}
                  </h1>
                  <Button asChild variant="secondary" className="h-10 w-fit rounded-full px-7 text-base"
                  >
                   <Link to={PUBLIC_ROUTES.PRODUCTS}>
                    {slide.action}
                   </Link>
                  </Button>
                </div>

                {/* <p className="absolute bottom-3 left-7 right-7 z-10
                 truncate text-center text-sm text-muted-foreground">
                  {slide.note}
                </p> */}
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="-left-4 size-10! hidden bg-background shadow-lg lg:inline-flex" />
        <CarouselNext className="-right-4 size-10! bg-background shadow-lg" />
      </Carousel>
    </section>
  );
};

export default HeroCarousel;
