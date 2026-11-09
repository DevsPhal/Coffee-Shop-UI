"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  /** Marks the field invalid (red border via aria-invalid); show the message with TooltipAlert. */
  invalid?: boolean;
};

/**
 * The plain dropdown: a native <select> (keyboard, screen reader and phone pickers come for free),
 * 16px text so iOS doesn't zoom, at least 44px tall, token colours.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...rest },
  ref
) {
  return (
    <span className="relative block">
      <select ref={ref} aria-invalid={invalid || undefined} className={cn("ui_select", className)} {...rest}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)"
      />
    </span>
  );
});

export interface SelectMenuOption<T extends string> {
  value: T;
  label: string;
  /** Shown on the right, e.g. a price "+$0.50". */
  hint?: string;
}

export interface SelectMenuProps<T extends string> {
  value: T | "";
  options: readonly SelectMenuOption<T>[];
  onChange: (value: T) => void;
  "aria-label": string;
  /** Shown while nothing is chosen. */
  placeholder?: string;
  /** An icon before the value. */
  icon?: React.ReactNode;
  /** Text before the value, e.g. "Size:" on a compact chip. */
  prefix?: React.ReactNode;
  /** field: a full-width form field; compact: a small brand chip; pill: a toolbar pill (sort, filter). */
  variant?: "field" | "compact" | "pill";
  /** Which edge of the trigger the list lines up with. */
  align?: "start" | "end";
  id?: string;
  invalid?: boolean;
  className?: string;
}

/**
 * The styled dropdown, for choices that need more than a native <select> shows (a price beside each option,
 * an icon, a chip look). Built on Base UI's Select: keyboard, type-ahead and screen readers work. Labels go
 * through the translator. One look for every such dropdown: sizes, drink options, gender, sort.
 */
export function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
  placeholder,
  icon,
  prefix,
  variant = "field",
  align = "start",
  id,
  invalid,
  className,
}: SelectMenuProps<T>) {
  const { t } = useLanguage();
  const selected = options.find((option) => option.value === value);

  return (
    <BaseSelect.Root<T>
      value={selected?.value ?? null}
      onValueChange={(next) => {
        if (next != null) onChange(next);
      }}
      items={options.map((option) => ({ value: option.value, label: t(option.label) }))}
    >
      <BaseSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn("ui_select_trigger", `is_${variant}`, className)}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          {prefix ? <span className="ui_select_prefix">{prefix}</span> : null}
          <span className={cn("truncate", !selected && "ui_select_placeholder")}>
            {selected ? t(selected.label) : placeholder}
          </span>
          {variant === "field" && selected?.hint ? <span className="ui_select_hint">{selected.hint}</span> : null}
        </span>
        <ChevronDown aria-hidden className="dropdown_chevron h-4 w-4 shrink-0 opacity-60" />
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          className="isolate z-[2100] outline-none"
          sideOffset={6}
          align={align}
          alignItemWithTrigger={false}
        >
          <BaseSelect.Popup
            className={cn(
              "ui_select_popup origin-[var(--transform-origin)] transition-[opacity,transform] duration-150",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
            )}
          >
            {options.map((option) => (
              <BaseSelect.Item key={option.value} value={option.value} className="ui_select_option">
                <BaseSelect.ItemText>{t(option.label)}</BaseSelect.ItemText>
                <span className="flex shrink-0 items-center gap-2">
                  {option.hint ? <span className="text-xs font-bold opacity-80">{option.hint}</span> : null}
                  <BaseSelect.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </BaseSelect.ItemIndicator>
                </span>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
