"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";

export interface CategoryCardProps {
  id?: string;
  title: string;
  editTag?: string;
  description?: string;
  image: string;
  href: string;
  className?: string;
}

export function CategoryCard({
  title,
  editTag,
  description,
  image,
  href,
  className = "",
}: CategoryCardProps) {
  const { t } = useLanguage();

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 sm:gap-4.5 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-gray-100/80 hover:border-gray-300 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer shrink-0 select-none min-w-[260px] sm:min-w-[320px] max-w-[360px] ${className}`}
    >
      {/* Left Square Thumbnail */}
      <div className="relative w-24 sm:w-32 aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-center space-y-1 sm:space-y-1.5 min-w-0 flex-1 pr-1">
        {/* Bullet Edit Tag */}
        {editTag && (
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] font-bold tracking-wider text-gray-500 uppercase font-serif truncate">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0" />
            <span className="truncate">{t(editTag)}</span>
          </div>
        )}

        {/* High-Contrast Serif Title */}
        <h3 className="font-serif text-sm sm:text-lg font-bold text-gray-900 leading-tight group-hover:text-[#A1255B] transition-colors line-clamp-2">
          {t(title)}
        </h3>

        {/* Optional Italic Subtitle */}
        {description && (
          <p className="text-[10px] sm:text-xs italic text-gray-400 truncate leading-snug">
            {t(description)}
          </p>
        )}

        {/* Discover > Link */}
        <div className="pt-0.5 sm:pt-1 inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
          <span>{t("Discover")}</span>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;
