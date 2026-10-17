"use client";

import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { useDropdown } from "@/hooks/useDropdown";

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

export function SortDropdown({ value, options, onChange, className = "" }: SortDropdownProps) {
  const { t } = useLanguage();
  const { isOpen, rootRef, toggle, close } = useDropdown();

  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 rounded-full bg-white border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-800 hover:border-[#A1255B] focus:outline-none focus:ring-1 focus:ring-[#A1255B] cursor-pointer transition-all select-none"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span>{t(selected?.label ?? "")}</span>
        <ChevronDown className="dropdown_chevron w-3.5 h-3.5 text-gray-400" aria-hidden />
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
                  close();
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
