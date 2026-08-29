"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MAIN_CATEGORIES } from "@/data/products";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { LayoutGrid, ArrowRight, ChevronRight, Layers } from "lucide-react";
import "@/app/globals.scss";

const SUBCATEGORY_IMAGES: Record<string, string> = {
  beer: "/images/cambodia_beer.jpg",
  "ice coffee": "/images/iced_latte.jpg",
  "hot coffee": "/images/americano.jpg",
  "fresh drink": "/images/passion.jpg",
  "pure water": "/images/water.jpg",
  "pour water": "/images/water.jpg",
  "energy drink": "/images/coca.jpg",
  noodle: "/images/indomie.jpg",
  beverage: "/images/iced_latte.jpg",
  "soft drink": "/images/soda.jpg",
  snack: "/images/indomie.jpg",
};

export function CategorypageView() {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuBaseUrl = isMobile ? "/menuphone" : "/menu";

  return (
    <div className="menu_page_wrapper font-sans min-h-screen pb-20 bg-[#F9FAFC]">
      <div className="menu_page_container max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        
        {/* Header Section */}
        <div className="menu_page_header text-center my-4 sm:my-8">
          <h1 className="menu_page_title text-xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("Our Categories")}
          </h1>
          <p className="menu_page_subtitle text-xs sm:text-base text-gray-500 max-w-xl mx-auto mt-1 sm:mt-2">
            {t("Handcrafted beverages & bites, thoughtfully organized by category.")}
          </p>
        </div>

        {/* Main Categories Section Blocks */}
        <div className="space-y-8 sm:space-y-12">
          {MAIN_CATEGORIES.map((main) => {
            const mainImg = SUBCATEGORY_IMAGES[main.name.toLowerCase()] || "/images/iced_latte.jpg";

            return (
              <section key={main.id} className="space-y-3 sm:space-y-4">
                
                {/* Main Category Header Row with Icon & "View All >" Link */}
                <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#A1255B] shrink-0">
                      <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <h2 className="text-base sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                      {t(main.name)}
                    </h2>
                  </div>

                  {/* "View All >" Link to Menu/Menuphone Page */}
                  <Link
                    href={`${menuBaseUrl}?category=${encodeURIComponent(main.name)}`}
                    className="group flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-bold text-[#A1255B] hover:text-[#881d52] transition-colors py-1 px-1.5 rounded-lg active:bg-pink-50"
                  >
                    <span>{t("View All")}</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Subcategory Category Cards Grid (2-Cols on Mobile Phone Screens, 4-Cols on Desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                  
                  {/* Card 1: "All [Main Category]" Card */}
                  <Link
                    href={`${menuBaseUrl}?category=${encodeURIComponent(main.name)}`}
                    className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 hover:border-[#A1255B] p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98]"
                  >
                    <div>
                      {/* Image Box */}
                      <div className="relative w-full aspect-square bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden mb-2.5 sm:mb-3 flex items-center justify-center border border-gray-100">
                        <Image
                          src={mainImg}
                          alt={main.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#A1255B] shadow-2xs">
                          <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                      </div>

                      {/* Card Title */}
                      <h3 className="font-extrabold text-xs sm:text-base text-[#A1255B] group-hover:text-[#881d52] transition-colors truncate">
                        {t("All")} {t(main.name)}
                      </h3>
                    </div>

                    {/* Subtitle / Action Link */}
                    <div className="mt-2 sm:mt-3 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-500 group-hover:text-[#A1255B] transition-colors">
                      <span className="truncate">{t("Browse collection")}</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>

                  {/* Cards 2+: Subcategory Cards */}
                  {main.subCategories.map((sub) => {
                    const subImg = SUBCATEGORY_IMAGES[sub.name.toLowerCase()] || mainImg;

                    return (
                      <Link
                        key={sub.id}
                        href={`${menuBaseUrl}?category=${encodeURIComponent(sub.name)}`}
                        className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 hover:border-[#A1255B] p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98]"
                      >
                        <div>
                          {/* Image Box */}
                          <div className="relative w-full aspect-square bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden mb-2.5 sm:mb-3 flex items-center justify-center border border-gray-100">
                            <Image
                              src={subImg}
                              alt={sub.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Card Title */}
                          <h3 className="font-extrabold text-xs sm:text-base text-gray-900 group-hover:text-[#A1255B] transition-colors truncate">
                            {t(sub.name)}
                          </h3>
                        </div>

                        {/* Subtitle / Action Link */}
                        <div className="mt-2 sm:mt-3 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-500 group-hover:text-[#A1255B] transition-colors">
                          <span className="truncate">{t("View products")}</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default CategorypageView;
