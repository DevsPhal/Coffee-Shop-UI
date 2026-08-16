"use client";

import React from "react";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export type { CartItem };

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useCart() {
  const store = useCartStore();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return {
    items: store.items,
    isOpen: store.isOpen,
    openCart: store.openCart,
    closeCart: store.closeCart,
    toggleCart: store.toggleCart,
    addItem: (
      newItem: { id: string; title: string; price: number; image?: string; quantity?: number },
      openDrawer?: boolean
    ) => store.addItem(newItem, openDrawer, isLoggedIn),
    updateQuantity: store.updateQuantity,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
    subtotal: store.getSubtotal(),
    totalCount: store.getTotalCount(),
  };
}
