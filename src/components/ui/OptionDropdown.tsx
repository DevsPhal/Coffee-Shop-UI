"use client";

import React from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { useLanguage } from "@/components/ui/translatetokhmer";
import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export interface OptionDropdownProps<T extends string> {
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  label: string;
  icon?: React.ReactNode;
  variant?: "field" | "compact";
  className?: string;
}

export function OptionDropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  icon,
  variant = "field",
  className,
}: OptionDropdownProps<T>) {
  const { t } = useLanguage();
  const selected = options.find((option) => option.value === value) ?? options[0];
  const compact = variant === "compact";

  const control = (
    <Select.Root<T>
      value={selected?.value ?? null}
      onValueChange={(next) => {
        if (next != null) onChange(next);
      }}
      items={options.map((option) => ({ value: option.value, label: t(option.label) }))}
    >
      <Select.Trigger
        aria-label={t(label)}
        className={cn(
          "group flex items-center justify-between gap-2 cursor-pointer select-none transition-all outline-none",
          "focus-visible:ring-2 focus-visible:ring-[#A1255B]/30",
          compact
            ? "rounded-full border border-pink-200 bg-pink-50/80 hover:bg-pink-100/80 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-[#A1255B] whitespace-nowrap"
            : "w-full rounded-xl border border-gray-200 bg-white hover:border-[#A1255B]/50 data-[popup-open]:border-[#A1255B] px-3 py-2.5 text-sm font-semibold text-gray-900"
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {compact && <span className="font-medium text-[#A1255B]/70">{t(label)}:</span>}
          <span className="truncate">{selected ? t(selected.label) : ""}</span>
          {!compact && selected?.hint && (
            <span className="text-xs font-bold text-[#A1255B]">{selected.hint}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "shrink-0 transition-transform duration-200 group-data-[popup-open]:rotate-180",
            compact ? "h-3.5 w-3.5 text-[#A1255B]" : "h-4 w-4 text-gray-400 group-data-[popup-open]:text-[#A1255B]"
          )}
        />
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner
          className="isolate z-[2100] outline-none"
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          <Select.Popup
            className={cn(
              "max-h-[min(20rem,var(--available-height))] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl outline-none",
              "min-w-[var(--anchor-width)] origin-[var(--transform-origin)] transition-[opacity,transform] duration-150",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
              compact && "min-w-[9rem]"
            )}
          >
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-gray-800 outline-none transition-colors",
                  "data-[highlighted]:bg-pink-50",
                  "data-[selected]:bg-[#A1255B] data-[selected]:text-white"
                )}
              >
                <Select.ItemText>{t(option.label)}</Select.ItemText>
                <span className="flex shrink-0 items-center gap-2">
                  {option.hint && <span className="text-xs font-bold opacity-80">{option.hint}</span>}
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </span>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );

  if (compact) return <div className={cn("inline-block", className)}>{control}</div>;

  return (
    <div className={cn("mb-4", className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
        {icon}
        {t(label)}
      </span>
      {control}
    </div>
  );
}

export default OptionDropdown;
