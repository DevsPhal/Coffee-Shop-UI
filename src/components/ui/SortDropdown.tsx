"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";

export interface SortOption {
  value: string;
  label: string;
}

export interface SortDropdownProps {
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
  className?: string;
}

/**
 * A styled replacement for a plain `<select>` — browsers render a native select's open menu
 * with their own OS chrome (a plain list, no icon, no rounded panel), which looks visibly out
 * of place next to every other dropdown in the app, all of which are this same custom pattern
 * (CategoryDropdown, GenderDropdown, the language switcher).
 */
export function SortDropdown({ value, options, onChange, className = "" }: SortDropdownProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-800 hover:border-[#A1255B] focus:outline-none focus:ring-1 focus:ring-[#A1255B] cursor-pointer transition-all select-none"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span>{t(selected?.label ?? "")}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#A1255B]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in duration-150"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border-none text-left select-none ${
                  isSelected
                    ? "bg-[#A1255B] text-white font-bold shadow-2xs"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span>{t(option.label)}</span>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SortDropdown;
