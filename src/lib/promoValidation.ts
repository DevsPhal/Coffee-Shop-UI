import { z } from "zod";

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

export function calculatePromoTimeLeft(
  promoEndDate?: string | Date | null,
  fallbackDaysLeft?: string | number
): PromoValidationResult {
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
        displayText: "Promotion ended",
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
        displayText: "Promotion ended",
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

export interface DiscountInfo {
  hasDiscount: boolean;
  badgeText: string | null;
  discountType: "percentage" | "fixed";
  discountAmount: number;
}

export function formatDiscountBadge(
  price?: number,
  originalPrice?: number,
  discountType?: "percentage" | "fixed",
  discountAmount?: number
): DiscountInfo {
  if (originalPrice && price && originalPrice > price) {
    const diff = originalPrice - price;
    if (discountType === "fixed") {
      const fixedVal = discountAmount !== undefined ? discountAmount : diff;
      return {
        hasDiscount: true,
        badgeText: `-$${fixedVal.toFixed(2)} OFF`,
        discountType: "fixed",
        discountAmount: fixedVal,
      };
    } else {
      const percent =
        discountAmount !== undefined
          ? discountAmount
          : Math.round((diff / originalPrice) * 100);
      return {
        hasDiscount: percent > 0,
        badgeText: percent > 0 ? `-${percent}% OFF` : null,
        discountType: "percentage",
        discountAmount: percent,
      };
    }
  }

  if (discountType === "fixed" && discountAmount && discountAmount > 0) {
    return {
      hasDiscount: true,
      badgeText: `-$${discountAmount.toFixed(2)} OFF`,
      discountType: "fixed",
      discountAmount,
    };
  }

  return {
    hasDiscount: false,
    badgeText: null,
    discountType: "percentage",
    discountAmount: 0,
  };
}

