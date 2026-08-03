"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselControls,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

export interface SlideItem {
  id: string | number;
  image: string;
  alt?: string;
  title?: string;
}

interface CoverflowCarouselProps {
  slides: SlideItem[];
  autoplay?: boolean;
  className?: string;
}

export function CoverflowCarousel({
  slides,
  autoplay = true,
  className,
}: CoverflowCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const onSelect = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  const count = slides.length;

  const getSlideDistance = (index: number) => {
    if (count === 0) return 0;
    let diff = Math.abs(index - selectedIndex);
    const loopDiff = count - diff;
    return Math.min(diff, loopDiff);
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto py-4 overflow-hidden", className)}>
      <Carousel
        setApi={setApi}
        plugins={autoplay ? [plugin.current] : []}
        opts={{
          align: "center",
          loop: true,
          skipSnaps: false,
        }}
        className="w-full relative"
        onMouseEnter={() => autoplay && plugin.current.stop()}
        onMouseLeave={() => autoplay && plugin.current.reset()}
      >
        {/* Negative margins & spacing to create card overlap */}
        <CarouselContent className="-ml-12 sm:-ml-24 md:-ml-32 lg:-ml-40 items-center py-6">
          {slides.map((slide, index) => {
            const distance = getSlideDistance(index);

            // Distance based scaling, opacity, and z-index to match picture depth
            let styleClasses = "scale-[0.70] opacity-40 z-10 blur-[0.5px]";
            if (distance === 0) {
              styleClasses = "scale-100 opacity-100 z-30 shadow-2xl blur-0";
            } else if (distance === 1) {
              styleClasses = "scale-[0.85] opacity-75 z-20 blur-0";
            }

            return (
              <CarouselItem
                key={slide.id}
                className="pl-12 sm:pl-24 md:pl-32 lg:pl-40 basis-[70%] sm:basis-[55%] md:basis-[50%] lg:basis-[45%] transition-all duration-500 ease-out cursor-pointer select-none"
                onClick={() => api?.scrollTo(index)}
              >
                <div
                  className={cn(
                    "relative aspect-[16/9] w-full rounded-[24px] sm:rounded-[32px] overflow-hidden bg-gray-900 border border-black/10 transition-all duration-500 ease-out shadow-xl",
                    styleClasses
                  )}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt || slide.title || `Slide ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {slide.title && (
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white">
                      <h3 className="text-sm sm:text-lg font-bold tracking-tight">
                        {slide.title}
                      </h3>
                    </div>
                  )}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Bottom Controls (Left Arrow, Interactive Dots, Right Arrow) */}
        <CarouselControls className="mt-4 sm:mt-6" />
      </Carousel>
    </div>
  );
}

export default CoverflowCarousel;
