import { z } from "zod";

/**
 * Zod Schema for validating Promotion Date input.
 * Accepts ISO date strings (e.g. "2026-08-17" or "2026-08-17T23:59:59Z") or JS Date objects.
 */
export const PromotionDateSchema = z.object({
  promoEndDate: z.union([
    z.string().min(1, "Promotion end date cannot be empty"),
    z.date(),
  ]),
});

export type PromotionDateInput = z.infer<typeof PromotionDateSchema>;

export interface PromoValidationResult {
  isValid: boolean;
  daysLeft: number;
  displayText: string;
  status: "danger" | "warning" | "safe" | "expired";
  error?: string;
}

/**
 * Validates promotion date using Zod schema and calculates remaining days left.
 *
 * Status rules:
 * - < 5 days left  => "danger"  (Red)
 * - 5-10 days left => "warning" (Yellow)
 * - > 10 days left => "safe"    (Green)
 * - <= 0 days left => "expired" (Inactive)
 */
export function calculatePromoTimeLeft(
  promoEndDate?: string | Date | null,
  fallbackDaysLeft?: string | number
): PromoValidationResult {
  // If promoEndDate is provided, validate with Zod and calculate diff from current date
  if (promoEndDate) {
    const parseResult = PromotionDateSchema.safeParse({ promoEndDate });

    if (!parseResult.success) {
      return {
        isValid: false,
        daysLeft: 0,
        displayText: "Invalid Date",
        status: "expired",
        error: parseResult.error.issues[0]?.message || "Invalid Date",
      };
    }

    const targetDate =
      typeof promoEndDate === "string" ? new Date(promoEndDate) : promoEndDate;

    if (isNaN(targetDate.getTime())) {
      return {
        isValid: false,
        daysLeft: 0,
        displayText: "Invalid Date",
        status: "expired",
        error: "Unparseable date string",
      };
    }

    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return {
        isValid: false,
        daysLeft: 0,
        displayText: "Ended",
        status: "expired",
      };
    }

    let status: "danger" | "warning" | "safe" = "safe";
    if (daysLeft < 5) {
      status = "danger";
    } else if (daysLeft <= 10) {
      status = "warning";
    } else {
      status = "safe";
    }

    return {
      isValid: true,
      daysLeft,
      displayText: `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`,
      status,
    };
  }

  // Fallback calculation if only relative string/number (e.g. "3 days left" or 7) is passed
  if (fallbackDaysLeft !== undefined && fallbackDaysLeft !== null) {
    let days = 3;
    if (typeof fallbackDaysLeft === "number") {
      days = fallbackDaysLeft;
    } else {
      const match = String(fallbackDaysLeft).match(/\d+/);
      if (match) days = parseInt(match[0], 10);
    }

    if (days <= 0) {
      return {
        isValid: false,
        daysLeft: 0,
        displayText: "Ended",
        status: "expired",
      };
    }

    return {
      isValid: true,
      daysLeft: days,
      displayText: `${days} ${days === 1 ? "day" : "days"} left`,
      status: days < 5 ? "danger" : days <= 10 ? "warning" : "safe",
    };
  }

  return {
    isValid: false,
    daysLeft: 0,
    displayText: "No promotion",
    status: "expired",
  };
}
