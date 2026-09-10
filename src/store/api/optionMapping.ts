import type { IceLevel, MilkType, SugarLevel } from "./types";

/**
 * Translation between the labels the storefront shows and the enum values the API accepts.
 *
 * Ice and sugar line up cleanly — the API models them as percentage levels, so "Less" is
 * FIFTY and "No Ice" is ZERO. Milk does not: the UI historically offered a *quantity*
 * ("Less Milk") while the API models a *kind* of milk (oat, soy, condensed…). Rather than
 * invent a mapping for a distinction the server cannot store, the milk selector now offers
 * the API's actual types, which is also more useful to a customer.
 */

export const ICE_LABELS: Record<IceLevel, string> = {
  ZERO: "No Ice",
  TWENTY_FIVE: "Little Ice",
  FIFTY: "Less Ice",
  SEVENTY_FIVE: "More Ice",
  HUNDRED: "Normal",
};

export const SUGAR_LABELS: Record<SugarLevel, string> = {
  ZERO: "No Sugar",
  TWENTY_FIVE: "25% Sugar",
  FIFTY: "Less Sugar",
  SEVENTY_FIVE: "75% Sugar",
  HUNDRED: "Normal",
};

export const MILK_LABELS: Record<MilkType, string> = {
  NONE: "No Milk",
  WHOLE_MILK: "Whole Milk",
  SKIM_MILK: "Skim Milk",
  OAT_MILK: "Oat Milk",
  ALMOND_MILK: "Almond Milk",
  SOY_MILK: "Soy Milk",
  CONDENSED_MILK: "Condensed Milk",
};

/** Display order for the selectors — "Normal" first, since it is the common choice. */
export const ICE_CHOICES: IceLevel[] = ["HUNDRED", "FIFTY", "TWENTY_FIVE", "ZERO"];
export const SUGAR_CHOICES: SugarLevel[] = ["HUNDRED", "FIFTY", "TWENTY_FIVE", "ZERO"];
export const MILK_CHOICES: MilkType[] = [
  "WHOLE_MILK",
  "SKIM_MILK",
  "OAT_MILK",
  "ALMOND_MILK",
  "SOY_MILK",
  "CONDENSED_MILK",
  "NONE",
];

function invert<T extends string>(labels: Record<T, string>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(labels).map(([value, label]) => [label as string, value as T])
  ) as Record<string, T>;
}

const ICE_BY_LABEL = invert(ICE_LABELS);
const SUGAR_BY_LABEL = invert(SUGAR_LABELS);
const MILK_BY_LABEL = invert(MILK_LABELS);

/**
 * Cart lines persisted before this mapping existed hold the old vocabulary, so the legacy
 * labels are accepted alongside the current ones and fall back to the sensible default.
 */
export function toIceLevel(label?: string | null): IceLevel | undefined {
  if (!label) return undefined;
  if (ICE_BY_LABEL[label]) return ICE_BY_LABEL[label];
  if (label === "Less") return "FIFTY";
  if (label === "Normal") return "HUNDRED";
  return undefined;
}

export function toSugarLevel(label?: string | null): SugarLevel | undefined {
  if (!label) return undefined;
  if (SUGAR_BY_LABEL[label]) return SUGAR_BY_LABEL[label];
  if (label === "Less") return "FIFTY";
  if (label === "Normal") return "HUNDRED";
  return undefined;
}

export function toMilkType(label?: string | null): MilkType | undefined {
  if (!label) return undefined;
  if (MILK_BY_LABEL[label]) return MILK_BY_LABEL[label];
  // Legacy quantity labels: the closest the API can express is "there is milk" / "there isn't".
  if (label === "Normal" || label === "Less Milk") return "WHOLE_MILK";
  return undefined;
}
