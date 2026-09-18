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
import "@/app/globals.scss";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  description?: string;
  href: string;
}

/**
 * Shown only when the shop has no banners configured yet (or the request fails) — the homepage
 * hero should never render empty. Real banners from /api/banners take priority when present.
 */
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    image: "/images/poster1.jpg",
    title: "590st Cafe Refreshing Drinks",
    description: "Handcrafted iced coffees and sparkling fruit sodas brewed fresh daily",
    href: "/menu",
  },
  {
    id: "fallback-2",
    image: "/images/poster2.jpg",
    title: "Signature Coffee Special",
    description: "Rich espresso layered with creamy foam and single-origin beans",
    href: "/menu",
  },
  {
    id: "fallback-3",
    image: "/images/poster3.jpg",
    title: "Special Season Promotion",
    description: "Limited time seasonal treats and handcrafted specialty lattes",
    href: "/menu",
  },
];

export default function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { data: banners } = useListBannersQuery();

  const activeBanners = (banners ?? []).filter((b) => b.status === "ACTIVE");
  // A banner's own linkUrl is only used when it looks like a real destination — seed/test data
  // can carry a placeholder string, and following that would send customers nowhere useful.
  const bannerHref = (linkUrl: string | null) =>
    linkUrl && (linkUrl.startsWith("/") || linkUrl.startsWith("http")) ? linkUrl : "/menu";

  const slides: HeroSlide[] =
    activeBanners.length > 0
      ? activeBanners.map((banner) => ({
          id: banner.id,
          image: banner.imageUrl || "/images/590st cafe.jpg",
          title: banner.title,
          href: bannerHref(banner.linkUrl),
        }))
      : FALLBACK_SLIDES;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const plugin = React.useRef(
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
    <section className="hero_section">
      <div className="hero_container">
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
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
                  className="hero_carousel_item"
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

                    {/* Overlay with Title, Description, and Buy Now Button */}
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

                      {/* Buy Now Button */}
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

          {/* Bottom Controls */}
          <CarouselControls className="hero_controls_margin" />
        </Carousel>
      </div>
    </section>
  );
}
