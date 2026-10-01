"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselControls,
  type CarouselApi,
} from "@/components/ui";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { useListBannersQuery } from "@/store/api/catalogApi";
import { LoadingRegion, Skeleton } from "@/components/ui/states";
import "@/app/globals.scss";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  description?: string;
  href: string;
}

export default function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { data: banners, isLoading } = useListBannersQuery();

  const activeBanners = (banners ?? []).filter((b) => b.status === "ACTIVE");
  const bannerHref = (linkUrl: string | null) =>
    linkUrl && (linkUrl.startsWith("/") || linkUrl.startsWith("http")) ? linkUrl : "/menu";

  const slides: HeroSlide[] = activeBanners.map((banner) => ({
    id: banner.id,
    image: banner.imageUrl || "/images/590st cafe.jpg",
    title: banner.title,
    href: bannerHref(banner.linkUrl),
  }));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [plugin] = useState(() =>
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    })
  );

  const onSelect = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const count = slides.length;

  const getSlideDistance = (index: number) => {
    if (count === 0) return 0;
    const diff = Math.abs(index - selectedIndex);
    const loopDiff = count - diff;
    return Math.min(diff, loopDiff);
  };

  if (isLoading) {
    return (
      <section className="hero_section">
        <div className="hero_container">
          <LoadingRegion label="Loading banners...">
            <Skeleton className="aspect-video w-full min-h-55 rounded-none" />
          </LoadingRegion>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="hero_section">
      <div className="hero_container">
        <Carousel
          setApi={setApi}
          plugins={[plugin]}
          opts={{
            align: "center",
            loop: true,
            skipSnaps: false,
          }}
          className="hero_carousel"
        >
          <CarouselContent className="hero_carousel_content">
            {slides.map((slide, index) => {
              const distance = getSlideDistance(index);

              let scaleClass = "hero_scale_distant";
              if (distance === 0) {
                scaleClass = "hero_scale_active";
              } else if (distance === 1) {
                scaleClass = "hero_scale_adjacent";
              }

              return (
                <CarouselItem
                  key={slide.id}
                  className="hero_carousel_item cursor-pointer"
                  onClick={() => api?.scrollTo(index)}
                >
                  <div className={cn("hero_slide_card", scaleClass)}>
                    <Image
                      src={slide.image}
                      alt={slide.title || `Slide ${index + 1}`}
                      fill
                      loading="eager"
                      className="hero_slide_image"
                    />

                    <div className="hero_slide_overlay">
                      <div className="hero_slide_text_wrapper">
                        <h3 className="hero_slide_title">
                          {slide.title}
                        </h3>
                        
                        {slide.description && (
                          <p className="hero_slide_description">
                            {slide.description}
                          </p>
                        )}
                      </div>

                      <Link
                        href={isMobile && slide.href === "/menu" ? "/menuphone" : slide.href}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="unstyled" className="hero_buy_btn">
                          Buy Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselControls className="hero_controls_margin" />
        </Carousel>
      </div>
    </section>
  );
}
