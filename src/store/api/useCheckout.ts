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

export function useCheckout() {
  const [clearServerCart] = useClearCartMutation();
  const [addCartItem] = useAddCartItemMutation();
  const [checkout] = useCheckoutMutation();

  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placingRef = useRef(false);
  const errorRef = useRef<string | null>(null);

  const fail = useCallback((message: string) => {
    errorRef.current = message;
    setError(message);
  }, []);

  const placeOrder = useCallback(
    async (request: CheckoutRequest): Promise<OrderResponse | null> => {
      if (placingRef.current) return null;
      const items = useCartStore.getState().items;
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

        for (const item of items) {
          await addCartItem({
            productId: item.productId,
            quantity: item.quantity,
            ...(item.variantId ? { variantId: item.variantId } : {}),
            ...(item.sugarLevel ? { sugarLevel: item.sugarLevel } : {}),
            ...(item.iceLevel ? { iceLevel: item.iceLevel } : {}),
            ...(item.milkType ? { milkType: item.milkType } : {}),
            ...(item.selectedExtras && item.selectedExtras.length > 0
              ? { extraIds: item.selectedExtras.map((extra) => extra.extraId) }
              : {}),
          }).unwrap();
        }

        const order = await checkout(request).unwrap();
        useCartStore.getState().clearCart();
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
    [clearServerCart, addCartItem, checkout, fail]
  );

  return { placeOrder, isPlacing, error, errorRef };
}
