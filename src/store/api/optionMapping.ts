import type { IceLevel, MilkType, SugarLevel, VariantName } from "./types";

/**
 * Translation between the labels the storefront shows and the enum values the API accepts.
 *
 * Re-checked against the live /v3/api-docs — ice, sugar and milk all moved from the old
 * percentage scale (ZERO/TWENTY_FIVE/.../HUNDRED) to the same qualitative LESS/NORMAL/EXTRA
 * shape (ice and milk each also keep their own "none" value: NO_ICE, NONE).
 */

export const ICE_LABELS: Record<IceLevel, string> = {
  NO_ICE: "No Ice",
  LESS_ICE: "Less Ice",
  NORMAL: "Normal Ice",
  EXTRA_ICE: "Extra Ice",
};

export const SUGAR_LABELS: Record<SugarLevel, string> = {
  ZERO: "No Sugar",
  LESS: "Less Sugar",
  NORMAL: "Normal Sugar",
  EXTRA: "Extra Sugar",
};

export const MILK_LABELS: Record<MilkType, string> = {
  NONE: "No Milk",
  LESS: "Less Milk",
  NORMAL: "Normal Milk",
  EXTRA: "Extra Milk",
};

/** Display order for the selectors — "Normal" first, since it is the common choice. */
export const ICE_CHOICES: IceLevel[] = ["NORMAL", "LESS_ICE", "EXTRA_ICE", "NO_ICE"];
export const SUGAR_CHOICES: SugarLevel[] = ["NORMAL", "LESS", "EXTRA", "ZERO"];
export const MILK_CHOICES: MilkType[] = ["NORMAL", "LESS", "EXTRA", "NONE"];

/** The same choices as {value, label} pairs, ready for OptionDropdown. */
export const ICE_OPTIONS = ICE_CHOICES.map((value) => ({ value, label: ICE_LABELS[value] }));
export const SUGAR_OPTIONS = SUGAR_CHOICES.map((value) => ({ value, label: SUGAR_LABELS[value] }));
export const MILK_OPTIONS = MILK_CHOICES.map((value) => ({ value, label: MILK_LABELS[value] }));

/** A product variant's `name` is one of these three fixed sizes, not free text. */
export const VARIANT_LABELS: Record<VariantName, string> = {
  MEDIUM: "Medium",
  LARGE: "Large",
  PIECE: "Piece",
};

/** A product's sizes as dropdown options, each with its own price. */
export function variantOptions(
  variants: readonly { id: string; name: VariantName; finalPrice: string | number }[]
) {
  return variants.map((variant) => ({
    value: variant.id,
    label: VARIANT_LABELS[variant.name],
    hint: `$${Number(variant.finalPrice).toFixed(2)}`,
  }));
}
