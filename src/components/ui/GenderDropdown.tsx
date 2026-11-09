"use client";

import { Users } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { SelectMenu } from "@/components/ui/select";
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
  invalid?: boolean;
  className?: string;
  id?: string;
}

/** Gender as a form field, on the shared SelectMenu. */
export function GenderDropdown({
  value,
  onChange,
  placeholder = "Select gender",
  invalid,
  className = "",
  id,
}: GenderDropdownProps) {
  const { t } = useLanguage();
  return (
    <div className={className}>
      <SelectMenu
        id={id}
        value={value}
        options={GENDER_CHOICES}
        onChange={onChange}
        aria-label={t("Gender")}
        placeholder={t(placeholder)}
        invalid={invalid}
        icon={<Users className="h-4 w-4 shrink-0 opacity-60" aria-hidden />}
      />
    </div>
  );
}

export default GenderDropdown;
