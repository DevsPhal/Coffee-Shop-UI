"use client";

import { useCallback, useRef, useState } from "react";

import { useCartStore } from "@/store/useCartStore";
import { apiErrorMessage } from "./baseApi";
import {
  useAddCartItemMutation,
  useCheckoutMutation,
  useClearCartMutation,
} from "./cartApi";
import type { CheckoutRequest, OrderResponse } from "./types";

/**
 * Turns the local guest cart into a real order.
 *
 * The API has no bulk cart endpoint, so the sync is: clear whatever the server cart still
 * holds from an abandoned session, POST each local line, then POST /checkout — which creates
 * a PENDING order and empties the server cart. Payment is a separate step on the order.
 *
 * The local cart is only cleared once the order exists, so a failure part-way leaves the
 * customer's basket intact and they can retry.
 */
export function useCheckout() {
  const items = useCartStore((state) => state.items);
  const clearLocalCart = useCartStore((state) => state.clearCart);

  const [clearServerCart] = useClearCartMutation();
  const [addCartItem] = useAddCartItemMutation();
  const [checkout] = useCheckoutMutation();

  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placingRef = useRef(false);
  // Mirrors `error` for callers that need it in the same tick they await placeOrder.
  const errorRef = useRef<string | null>(null);

  const fail = useCallback((message: string) => {
    errorRef.current = message;
    setError(message);
  }, []);

  const placeOrder = useCallback(
    async (request: CheckoutRequest): Promise<OrderResponse | null> => {
      if (placingRef.current) return null;
      if (items.length === 0) {
        fail("Your cart is empty.");
        return null;
      }

      placingRef.current = true;
      setIsPlacing(true);
      errorRef.current = null;
      setError(null);

      try {
        await clearServerCart().unwrap();

        // Sequential rather than parallel: the server cart is one row per customer and
        // concurrent inserts of the same product race each other.
        for (const item of items) {
          await addCartItem({
            productId: item.productId,
            quantity: item.quantity,
            ...(item.variantId ? { variantId: item.variantId } : {}),
            ...(item.sugarLevel ? { sugarLevel: item.sugarLevel } : {}),
            ...(item.iceLevel ? { iceLevel: item.iceLevel } : {}),
            ...(item.milkType ? { milkType: item.milkType } : {}),
          }).unwrap();
        }

        const order = await checkout(request).unwrap();
        clearLocalCart();
        return order;
      } catch (err) {
        fail(
          apiErrorMessage(
            err as Parameters<typeof apiErrorMessage>[0],
            "Could not place your order. Please try again."
          )
        );
        return null;
      } finally {
        placingRef.current = false;
        setIsPlacing(false);
      }
    },
    [items, clearServerCart, addCartItem, checkout, clearLocalCart, fail]
  );

  return { placeOrder, isPlacing, error, errorRef };
}
