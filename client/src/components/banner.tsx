import { Truck, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const BANNER_STORAGE_KEY = "instant-promo-banner-dismissed";

const Banner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(sessionStorage.getItem(BANNER_STORAGE_KEY) !== "true");
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(BANNER_STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative flex min-h-9 w-full items-center justify-center bg-primary px-10 text-primary-foreground">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm font-semibold">
        <span className="inline-flex items-center gap-2">
          <Truck className="size-4" />
          Free delivery on orders above $20
        </span>
        <span className="hidden h-5 w-px bg-primary-foreground/40 sm:block" />
        <span className="inline-flex items-center gap-2">
          <Zap className="size-4 fill-current" />
          Farm-fresh produce delivered daily
        </span>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-primary-foreground/90 transition hover:bg-primary-foreground/15 hover:text-primary-foreground"
        aria-label="Dismiss promotion banner"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};

export default Banner;
