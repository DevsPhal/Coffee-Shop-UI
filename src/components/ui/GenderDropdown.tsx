"use client";

import { useDropdown } from "@/hooks/useDropdown";
import { ChevronDown, Check, Users } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import type { Gender } from "@/store/api/types";

const GENDER_CHOICES: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export interface GenderDropdownProps {
  value: Gender | "";
  onChange: (value: Gender) => void;
  placeholder?: string;
  triggerClassName?: string;
  className?: string;
  id?: string;
}

export function GenderDropdown({
  value,
  onChange,
  placeholder = "Select gender",
  triggerClassName,
  className = "",
  id,
}: GenderDropdownProps) {
  const { t } = useLanguage();
  const { isOpen, rootRef, toggle, close } = useDropdown();

  const selected = GENDER_CHOICES.find((g) => g.value === value);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={
          triggerClassName ??
          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#94a3b8] bg-white text-xs sm:text-sm font-medium text-gray-900 hover:border-[#A1255B] focus:outline-none focus:border-[#475569] transition-all cursor-pointer select-none text-left"
        }
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Users className="w-4 h-4 text-gray-400 shrink-0" />
          <span className={selected ? "text-gray-900 font-semibold" : "text-gray-400"}>
            {selected ? selected.label : t(placeholder)}
          </span>
        </div>
        <ChevronDown className="dropdown_chevron w-4 h-4 text-gray-400" aria-hidden />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-full bg-white border border-gray-100 rounded-2xl shadow-lg p-1.5 space-y-0.5 animate-in fade-in duration-150"
        >
          {GENDER_CHOICES.map(({ value: choiceValue, label }) => {
            const isSelected = value === choiceValue;
            return (
              <button
                key={choiceValue}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(choiceValue);
                  close();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border-none text-left select-none ${
                  isSelected
                    ? "bg-[#A1255B] text-white font-bold shadow-2xs"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span>{label}</span>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GenderDropdown;
