"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MAIN_CATEGORIES } from "@/data/products";
import { useLanguage } from "@/components/ui/translatetokhmer";
import {
  Search,
  ChevronRight,
  Layers,
  Flame,
  ArrowUpRight,
  Coffee,
  Wine,
  UtensilsCrossed,
  Filter,
} from "lucide-react";
import "@/app/globals.scss";

const SUBCATEGORY_DETAILS: Record<
  string,
  {
    title: string;
    desc: string;
    img: string;
    tags: string[];
    badge?: string;
  }
> = {
  "iced coffee": {
    title: "Iced Coffee",
    desc: "Our signature 590 Coffee, handcrafted iced espresso blends, and chilled coffee favorites.",
    img: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80",
    tags: ["590 Coffee", "Latte", "Frappe"],
    badge: "590 Signature",
  },
  "ice coffee": {
    title: "Iced Coffee",
    desc: "Our signature 590 Coffee, handcrafted iced espresso blends, and chilled coffee favorites.",
    img: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80",
    tags: ["590 Coffee", "Latte", "Frappe"],
    badge: "590 Signature",
  },
  "hot coffee": {
    title: "Hot Coffee",
    desc: "Aromatic double shot espresso, hot water, cocoa froth & velvety steamed milk.",
    img: "/images/americano.jpg",
    tags: ["Americano", "Hot Chocolate", "Mocha"],
    badge: "Warm Comfort",
  },
  "iced tea": {
    title: "Iced Tea",
    desc: "Chilled premium tea leaves infused with natural passion fruit, lemon slices & ice.",
    img: "/images/greentea.jpg",
    tags: ["Blue Soda", "Passion Juice", "Green Tea"],
    badge: "Refreshing",
  },
  "hot tea": {
    title: "Hot Tea",
    desc: "Aromatic organic tea infusions steeped to perfection for soothing moments.",
    img: "/images/hothoneylemon.jpg",
    tags: ["Jasmine", "Green Tea", "Honey Lemon"],
    badge: "Soothing",
  },
  beer: {
    title: "Beer",
    desc: "Premium Cambodian beer brewed with European hops, crisp & cold.",
    img: "/images/cambodia_beer.jpg",
    tags: ["Cambodia Beer", "Carlsberg Beer", "Angkor Sky"],
    badge: "Party Together",
  },
  "soft drink": {
    title: "Soft Drinks & Sodas",
    desc: "Sparkling soft drinks, Sting energy, blue curaçao soda & fizzy sparklers.",
    img: "/images/coca.jpg",
    tags: ["Coca Cola", "Sting"],
    badge: "Sparkling",
  },
  "pure water": {
    title: "Pure Water",
    desc: "Clean, purified, natural mineral water bottled for crisp daily hydration.",
    img: "/images/water.jpg",
    tags: ["Angkor Water", "Hi-Tech Water", "Cambodia Water"],
    badge: "Pure",
  },
  noddle: {
    title: "Noodle",
    desc: "Indonesian fried noodles tossed with garlic oil, chili & sweet soy sauce.",
    img: "/images/indomie.jpg",
    tags: ["Indomie", "Omachi", "Mie Jeat"],
    badge: "Hot Snack",
  },
  noodle: {
    title: "Noodle",
    desc: "Indonesian fried noodles tossed with garlic oil, chili & sweet soy sauce.",
    img: "/images/indomie.jpg",
    tags: ["Indomie", "Omachi", "Mie Jeat"],
    badge: "Hot Snack",
  },
  topping: {
    title: "Topping",
    desc: "Delicious egg toppings, extra fried eggs, steamed eggs & savory add-ons for all your food & noodle dishes.",
    img: "/images/egg.jpg",
    tags: ["Fried Egg", "Steamed Egg", "Jelly"],
    badge: "Topping",
  },
  eggs: {
    title: "Topping",
    desc: "Delicious egg toppings, extra fried eggs, steamed eggs & savory add-ons for all your food & noodle dishes.",
    img: "/images/egg.jpg",
    tags: ["Fried Egg", "Steamed Egg", "Jelly"],
    badge: "Topping",
  },
};

const MAIN_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  fresh_drink: <Coffee className="w-5 h-5" />,
  beverage: <Wine className="w-5 h-5" />,
  snack: <UtensilsCrossed className="w-5 h-5" />,
};

export function CategorypageView() {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMainFilter, setSelectedMainFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuBaseUrl = isMobile ? "/menuphone" : "/menu";

  // Filter main categories based on active tab and search query
  const filteredMainCategories = useMemo(() => {
    return MAIN_CATEGORIES.filter((main) => {
      // Main filter check
      if (selectedMainFilter !== "all" && main.id !== selectedMainFilter) {
        return false;
      }
      // Search query check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchMain = main.name.toLowerCase().includes(q);
      const matchSub = main.subCategories.some(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          (SUBCATEGORY_DETAILS[sub.name.toLowerCase()]?.title || "").toLowerCase().includes(q)
      );
      return matchMain || matchSub;
    });
  }, [selectedMainFilter, searchQuery]);

  return (
    <div className="menu_page_wrapper font-sans min-h-screen pb-32 sm:pb-24 bg-[#F8FAFC]">
      <div className="menu_page_container max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-8 space-y-6 sm:space-y-10">
        
        {/* Clean Light Page Header */}
        <div className="text-center my-3 sm:my-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("Our Categories")}
          </h1>
          <p className="text-xs sm:text-base text-gray-500 max-w-xl mx-auto mt-1 sm:mt-2 px-2">
            {t("Handcrafted beverages & bites, thoughtfully organized by category.")}
          </p>
        </div>

        {/* Category Quick Filter Pills Navigation (Horizontal Edge-to-Edge Touch Scroll on Phone) */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 ">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
            </span>

            {/* All Tab */}
            <button
              type="button"
              onClick={() => setSelectedMainFilter("all")}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none border whitespace-nowrap ${
                selectedMainFilter === "all"
                  ? "bg-[#A1255B] text-white border-[#A1255B] shadow-md scale-[1.02]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("All Categories")}
            </button>

            {/* Main Category Tabs */}
            {MAIN_CATEGORIES.map((main) => {
              const isSelected = selectedMainFilter === main.id;
              return (
                <button
                  key={main.id}
                  type="button"
                  onClick={() => setSelectedMainFilter(main.id)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none border flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? "bg-[#A1255B] text-white border-[#A1255B] shadow-md scale-[1.02]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className={isSelected ? "text-white" : "text-[#f0383e]"}>
                    {MAIN_CATEGORY_ICONS[main.id]}
                  </span>
                  <span>{t(main.name)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Category Sections & Professional Subcategory Cards */}
        <div className="space-y-8 sm:space-y-16">
          {filteredMainCategories.map((main) => {
            return (
              <section key={main.id} className="space-y-4 sm:space-y-6">
                
                {/* Main Category Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-gray-100">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 flex items-center justify-center text-[#f0383e] shrink-0">
                      {MAIN_CATEGORY_ICONS[main.id] || <Layers className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                          {t(main.name)}
                        </h2>
                      </div>
                      <p className="text-xs text-gray-500 hidden sm:block mt-0.5">
                        {t(`Handcrafted selection of ${main.name.toLowerCase()} items`)}
                      </p>
                    </div>
                  </div>

                  {/* View All Menu Link */}
                  <Link
                    href={`${menuBaseUrl}?category=${encodeURIComponent(main.name)}`}
                    className="group flex items-center gap-1 text-xs sm:text-sm font-bold text-[#f0383e] hover:text-[#881d52] transition-colors shrink-0"
                  >
                    <span>{t("View All")}</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Modern 2-Column Subcategory Cards Grid on Phone (3-Column on Desktop) */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {main.subCategories.map((sub) => {
                    const meta = SUBCATEGORY_DETAILS[sub.name.toLowerCase()] || {
                      title: sub.name,
                      desc: `Fresh ${sub.name.toLowerCase()} handcrafted for you.`,
                      img: "/images/iced_latte.jpg",
                      tags: [sub.name],
                    };

                    return (
                      <Link
                        key={sub.id}
                        href={`${menuBaseUrl}?category=${encodeURIComponent(sub.name)}`}
                        className="group bg-white  border border-gray-200/80 hover:border-[#A1255B]/40 shadow-2xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                      >
                        <div>
                          {/* Image Box Container with Dark Gradient Overlay */}
                          <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden border-b border-gray-100">
                            <Image
                              src={meta.img}
                              alt={sub.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                            {/* Bottom Title Tag inside Image */}
                            <div className="absolute bottom-2 left-2 right-2 sm:bottom-5 sm:left-5 sm:right-5 text-white">
                              <h3 className="font-extrabold text-xs sm:text-lg text-white drop-shadow-sm group-hover:text-pink-200 transition-colors truncate">
                                {t(meta.title)}
                              </h3>
                            </div>
                          </div>

                          {/* Card Body Content */}
                          <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3.5">
                            <p className="text-[11px] sm:text-sm text-gray-500 line-clamp-2 leading-relaxed font-normal">
                              {t(meta.desc)}
                            </p>

                            {/* Tag Pills (Single horizontal line, max 3) */}
                            <div className="flex flex-nowrap items-center gap-1 pt-0.5 overflow-x-auto scrollbar-none">
                              {meta.tags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-[8px] sm:text-xs font-medium border border-gray-200/60 whitespace-nowrap shrink-0"
                                >
                                  {t(tag)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer Button */}
                        <div className="px-2.5 sm:px-5 pb-2.5 sm:pb-5 pt-2 sm:pt-3 flex items-center justify-between border-t border-gray-100/60 mt-1">
                          <span className="text-[10px] sm:text-xs font-extrabold text-[#A1255B] group-hover:text-[#881d52] transition-colors truncate">
                            {t("Explore Category")}
                          </span>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-50 group-hover:bg-[#A1255B] text-[#A1255B] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs shrink-0">
                            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {filteredMainCategories.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8 space-y-3">
              <Search className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">{t("No Categories Found")}</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {t("We couldn't find any categories matching your search query.")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedMainFilter("all");
                }}
                className="px-4 py-2 bg-[#A1255B] text-white text-xs font-bold hover:bg-[#881d52] transition-colors cursor-pointer"
              >
                {t("Reset Filters")}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CategorypageView;
