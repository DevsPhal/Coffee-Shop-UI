import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "button",
  {
    variants: {
      variant: {
        default: "button_default",
        outline: "button_outline",
        secondary: "button_secondary",
        ghost: "button_ghost",
        destructive: "button_destructive",
        link: "button_link",
        primary: "button_pill_primary",
        pillPrimary: "button_pill_primary",
        pillSecondary: "button_pill_secondary",
        addCart: "button_add_cart",
        buyNow: "button_buy_now",
        navLogin: "button_nav_login",
        unstyled: "",
      },
      size: {
        default: "button_size_default",
        xs: "button_size_xs",
        sm: "button_size_sm",
        lg: "button_size_lg",
        icon: "button_size_icon",
        "icon-xs": "button_size_icon_xs",
        "icon-sm": "button_size_icon_sm",
        "icon-lg": "button_size_icon_lg",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const hasCustomPillOrBrandClass =
    className?.includes("button_pill") ||
    className?.includes("button_add_cart") ||
    className?.includes("button_buy_now") ||
    className?.includes("button_nav_login") ||
    className?.includes("btn-");

  const selectedVariant = variant ?? (hasCustomPillOrBrandClass ? "unstyled" : "default");
  const selectedSize = size ?? (hasCustomPillOrBrandClass ? "none" : "default");

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant: selectedVariant, size: selectedSize, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
