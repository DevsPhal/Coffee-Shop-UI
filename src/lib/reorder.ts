import type { AddItemInput } from "@/store/useCartStore";
import type { OrderResponse } from "@/store/api/types";
import { toTitleCase } from "@/lib/utils";

/** Cart lines that recreate a past order: same product, size, sugar/ice/milk, extras and photo. */
export function reorderLines(order: OrderResponse): AddItemInput[] {
  return order.items.map((item) => {
    const selectedExtras = item.extras.map((extra) => ({
      extraId: extra.extraId,
      name: extra.name,
      price: Number(extra.price),
    }));
    // An order line's unit price already includes its extras; the cart adds extras on top.
    const extrasPerUnit = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return {
      productId: item.productId,
      title: toTitleCase(item.productName),
      image: item.productImageUrl,
      unitPrice: Math.max(0, Number(item.unitPrice) - extrasPerUnit),
      quantity: item.quantity,
      variantId: item.variantId,
      variantName: item.variantId ? item.variantName : null,
      iceLevel: item.iceLevel ?? undefined,
      sugarLevel: item.sugarLevel ?? undefined,
      milkType: item.milkType ?? undefined,
      selectedExtras,
    };
  });
}
