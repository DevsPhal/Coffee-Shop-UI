import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A plain surface: token background, border, radius and shadow. The product card is a separate component
 * (components/cards/card.tsx).
 */
export function Card({
  className,
  padded = true,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return <div className={cn("ui_card", padded && "p-4 sm:p-6", className)} {...rest} />;
}
