"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import "@/app/globals.scss";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const EMPTY_SNAPSHOT = "0|0|0|0";

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      align: "center",
      containScroll: false,
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!api) return () => {};
      api.on("select", onChange);
      api.on("reInit", onChange);
      return () => {
        api.off("select", onChange);
        api.off("reInit", onChange);
      };
    },
    [api]
  );
  const snapshot = React.useSyncExternalStore(
    subscribe,
    () =>
      api
        ? `${api.selectedScrollSnap()}|${Number(api.canScrollPrev())}|${Number(api.canScrollNext())}|${api.scrollSnapList().length}`
        : EMPTY_SNAPSHOT,
    () => EMPTY_SNAPSHOT
  );
  const [selectedIndex, prevFlag, nextFlag, snapCount] = snapshot.split("|").map(Number);
  const canScrollPrev = prevFlag === 1;
  const canScrollNext = nextFlag === 1;
  const scrollSnaps = React.useMemo(() => Array.from({ length: snapCount }, (_, i) => i), [snapCount]);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);


  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("carousel_root", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="carousel_content_wrapper"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          orientation === "horizontal"
            ? "carousel_content_flex_horizontal"
            : "carousel_content_flex_vertical",
          className
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        orientation === "horizontal"
          ? "carousel_item_horizontal"
          : "carousel_item_vertical",
        className
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "carousel_prev_btn_base",
        orientation === "horizontal"
          ? "carousel_prev_btn_horizontal"
          : "carousel_prev_btn_vertical",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="carousel_icon" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "carousel_next_btn_base",
        orientation === "horizontal"
          ? "carousel_next_btn_horizontal"
          : "carousel_next_btn_vertical",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="carousel_icon" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

function CarouselControls({ className }: { className?: string }) {
  const { scrollPrev, scrollNext, scrollTo, canScrollPrev, canScrollNext, selectedIndex, scrollSnaps } = useCarousel();

  const hasMultipleSlides = scrollSnaps.length > 1;

  const handlePrev = () => {
    if (canScrollPrev) {
      scrollPrev();
    } else if (hasMultipleSlides) {
      scrollTo(scrollSnaps.length - 1);
    }
  };

  const handleNext = () => {
    if (canScrollNext) {
      scrollNext();
    } else if (hasMultipleSlides) {
      scrollTo(0);
    }
  };

  return (
    <div className={cn("carousel_controls", className)}>
      <button
        type="button"
        onClick={handlePrev}
        disabled={!hasMultipleSlides}
        aria-label="Previous slide"
        className="carousel_arrow_btn"
      >
        <ArrowLeft className="carousel_arrow_icon" />
      </button>

      <div className="carousel_dots_wrapper">
        {scrollSnaps.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              "carousel_dot",
              idx === selectedIndex ? "carousel_dot_active" : "carousel_dot_inactive"
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!hasMultipleSlides}
        aria-label="Next slide"
        className="carousel_arrow_btn"
      >
        <ArrowRight className="carousel_arrow_icon" />
      </button>
    </div>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselControls,
  useCarousel,
};
