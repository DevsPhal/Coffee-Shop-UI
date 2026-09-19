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

/** A product variant's `name` is one of these three fixed sizes, not free text. */
export const VARIANT_LABELS: Record<VariantName, string> = {
  MEDIUM: "Medium",
  LARGE: "Large",
  PIECE: "Piece",
};
