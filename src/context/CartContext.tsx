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
    removeItem: store.removeItem,
    clearCart: store.clearCart,
    subtotal: store.getSubtotal(),
    totalCount: store.getTotalCount(),
  };
}
