"use client";

import React from "react";
import { useCartStore, type AddItemInput, type CartItem } from "@/store/useCartStore";

export type { CartItem, AddItemInput };

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Thin accessor over the local cart store.
 *
 * Adding to the cart no longer requires being signed in: the catalogue is public, so a guest
 * can fill a basket and is only asked to log in at checkout, where the API needs a customer
 * account to create the order.
 */
export function useCart() {
  const store = useCartStore();

  // Derived from `store.items` directly rather than the store's own getSubtotal()/
  // getTotalCount(), which read through Zustand's get() — a call that bypasses the reactive
  // snapshot React subscribed to. On a cold load, persist's rehydration can land inside the
  // same tick as the initial hydration render: getSubtotal() would then see the already-
  // rehydrated cart while `store.items` (the subscribed snapshot) still reflects the
  // pre-hydration empty cart for that same render, so the two silently disagree. Deriving
  // both numbers from `store.items` itself means they can never tear apart from what's
  // actually being rendered.
  const subtotal = store.items.reduce((sum, item) => {
    const extrasPerUnit = (item.selectedExtras ?? []).reduce((s, extra) => s + extra.price, 0);
    return sum + (item.unitPrice + extrasPerUnit) * item.quantity;
  }, 0);
  const totalCount = store.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: store.items,
    isOpen: store.isOpen,
    openCart: store.openCart,
    closeCart: store.closeCart,
    toggleCart: store.toggleCart,
    addItem: (item: AddItemInput, openDrawer?: boolean) =>
      store.addItem(item, openDrawer),
    updateQuantity: store.updateQuantity,
    updateVariant: store.updateVariant,
    updateIceLevel: store.updateIceLevel,
    updateSugarLevel: store.updateSugarLevel,
    updateMilkType: store.updateMilkType,
    updateExtras: store.updateExtras,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
    subtotal,
    totalCount,
  };
}
