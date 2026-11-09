"use client";

import React from "react";

import { useLanguage } from "@/components/ui/translatetokhmer";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DropdownOption<T extends string> = SelectMenuOption<T>;

export interface OptionDropdownProps<T extends string> {
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  label: string;
  icon?: React.ReactNode;
  variant?: "field" | "compact";
  className?: string;
}

/** A labelled drink option (size, sugar, ice, milk) on the shared SelectMenu. */
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
  // An option the product no longer offers falls back to the first one, as before.
  const current = options.some((option) => option.value === value) ? value : options[0]?.value ?? value;

  if (variant === "compact") {
    return (
      <div className={cn("inline-block max-w-full", className)}>
        <SelectMenu
          variant="compact"
          value={current}
          options={options}
          onChange={onChange}
          aria-label={t(label)}
          prefix={`${t(label)}:`}
        />
      </div>
    );
  }

  return (
    <div className={cn("mb-4", className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
        {icon}
        {t(label)}
      </span>
      <SelectMenu value={current} options={options} onChange={onChange} aria-label={t(label)} />
    </div>
  );
}

export default OptionDropdown;
