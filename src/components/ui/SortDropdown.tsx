"use client";

import { ArrowUpDown } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { SelectMenu } from "@/components/ui/select";

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

/** The menu's sort order, as a toolbar pill on the shared SelectMenu. */
export function SortDropdown({ value, options, onChange, className = "" }: SortDropdownProps) {
  const { t } = useLanguage();
  const current = options.some((option) => option.value === value) ? value : options[0]?.value ?? "";
  return (
    <div className={className}>
      <SelectMenu
        variant="pill"
        align="end"
        value={current}
        options={options}
        onChange={onChange}
        aria-label={t("Sort by")}
        icon={<ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
      />
    </div>
  );
}

export default SortDropdown;
