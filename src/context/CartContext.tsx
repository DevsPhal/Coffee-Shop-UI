"use client";

import React from "react";
import { useCartStore, type AddItemInput, type CartItem } from "@/store/useCartStore";

export type { CartItem, AddItemInput };

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useCart() {
  const store = useCartStore();

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
