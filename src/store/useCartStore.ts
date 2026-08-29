import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import { getItemCustomizationConfig, getProductByIdOrTitle } from "@/data/products";

export function calculateSizePrice(basePrice: number, size?: string): number {
  if (!size) return basePrice;
  const s = size.trim().toUpperCase();
  if (s === "CAN") {
    return 0.75;
  }
  if (s === "BOTTLE") {
    return 1.25;
  }
  if (s === "CARTON") {
    return 28.00;
  }
  if (s === "DOUBLE") {
    return Math.round(basePrice * 2 * 100) / 100; // x2 price double
  }
  if (s === "L" || s === "1500ML") {
    return Math.round(basePrice * 1.20 * 100) / 100; // +20% for Large size
  }
  return basePrice; // M, S, 1, 1000ML, etc.
}

// Zod Schema for Cart Item validation
export const cartItemSchema = z.object({
  id: z.string().trim().min(1, { message: "Cart item ID is required." }),
  productId: z.string().optional(),
  title: z.string().trim().min(1, { message: "Item title is required." }),
  price: z.number().nonnegative({ message: "Price cannot be negative." }),
  originalPrice: z.number().nonnegative().optional(),
  basePrice: z.number().nonnegative().optional(),
  quantity: z.number().int().positive({ message: "Quantity must be at least 1." }),
  size: z.string().optional().default("M"),
  iceLevel: z.string().optional().default("Normal"),
  sugarLevel: z.string().optional().default("Normal"),
  milkType: z.string().optional().default("Normal"),
  image: z.string().optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Zod Schema for Adding an Item to Cart
export const addItemInputSchema = z.object({
  id: z.string().trim().min(1, { message: "Invalid product ID." }),
  title: z.string().trim().min(1, { message: "Product title is required." }),
  price: z.number().nonnegative({ message: "Price must be a valid positive number." }),
  originalPrice: z.number().nonnegative().optional(),
  quantity: z.number().int().positive({ message: "Quantity must be at least 1." }).optional().default(1),
  size: z.string().optional(),
  iceLevel: z.string().optional().default("Normal"),
  sugarLevel: z.string().optional().default("Normal"),
  milkType: z.string().optional().default("Normal"),
  image: z.string().optional(),
});

export type AddItemInput = z.input<typeof addItemInputSchema>;

// Zod Schema for updating item quantity
export const updateQuantitySchema = z.object({
  id: z.string().trim().min(1, { message: "Item ID is required for quantity update." }),
  change: z.number().int({ message: "Quantity change must be an integer." }),
});

interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    item: AddItemInput,
    openDrawer?: boolean,
    isLoggedIn?: boolean
  ) => { success: boolean; message?: string };
  updateQuantity: (id: string, change: number) => { success: boolean; message?: string };
  updateSize: (id: string, size: string) => void;
  updateIceLevel: (id: string, iceLevel: string) => void;
  updateSugarLevel: (id: string, sugarLevel: string) => void;
  updateMilkType: (id: string, milkType: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;

  // Computed values / Selectors
  getSubtotal: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem, openDrawer = false, isLoggedIn = true) => {
        if (!isLoggedIn) {
          const msg = "Please log in to your account first.";
          toast.add({
            type: "warning",
            description: msg,
          });
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return { success: false, message: msg };
        }

        const validationResult = addItemInputSchema.safeParse(newItem);
        if (!validationResult.success) {
          const errorMsg = validationResult.error.issues[0]?.message || "Invalid cart item data.";
          toast.add({
            type: "warning",
            description: errorMsg,
          });
          return { success: false, message: errorMsg };
        }

        const validData = validationResult.data;
        const qtyToAdd = validData.quantity;
        const config = getItemCustomizationConfig(validData.title);
        let resolvedSize = validData.size;
        if (config.hasSize) {
          if (!resolvedSize || !config.sizeOptions.includes(resolvedSize)) {
            resolvedSize = config.sizeOptions[0] || "M";
          }
        } else {
          resolvedSize = "";
        }

        const matchedProd = getProductByIdOrTitle(validData.id, validData.title);
        const productId = matchedProd?.id || validData.id;
        const resolvedOrigPrice = validData.originalPrice ?? matchedProd?.originalPrice;
        const basePrice = validData.price;
        const adjustedPrice = calculateSizePrice(basePrice, resolvedSize);
        const iceLevel = validData.iceLevel || "Normal";
        const sugarLevel = validData.sugarLevel || "Normal";
        const milkType = validData.milkType || "Normal";

        const compositeId = `${productId}-${resolvedSize || "default"}-${iceLevel}-${sugarLevel}-${milkType}`;

        set((state) => {
          const existingIndex = state.items.findIndex((i) => {
            const itemProdId = i.productId || i.id.split("-")[0];
            return (
              itemProdId === productId &&
              (i.size || "") === (resolvedSize || "") &&
              (i.iceLevel || "Normal") === iceLevel &&
              (i.sugarLevel || "Normal") === sugarLevel &&
              (i.milkType || "Normal") === milkType
            );
          });

          if (existingIndex > -1) {
            const updated = [...state.items];
            const currentItem = updated[existingIndex];
            const currentBase = currentItem.basePrice ?? basePrice;
            const updatedPrice = calculateSizePrice(currentBase, resolvedSize);

            updated[existingIndex] = {
              ...currentItem,
              id: compositeId,
              productId: productId,
              quantity: currentItem.quantity + qtyToAdd,
              size: resolvedSize,
              basePrice: currentBase,
              price: updatedPrice,
              originalPrice: resolvedOrigPrice ?? currentItem.originalPrice,
            };
            return { items: updated, ...(openDrawer ? { isOpen: true } : {}) };
          }

          return {
            items: [
              ...state.items,
              {
                id: compositeId,
                productId: productId,
                title: validData.title,
                basePrice: basePrice,
                price: adjustedPrice,
                originalPrice: resolvedOrigPrice,
                quantity: qtyToAdd,
                size: resolvedSize,
                iceLevel: iceLevel,
                sugarLevel: sugarLevel,
                milkType: milkType,
                image: validData.image,
              },
            ],
            ...(openDrawer ? { isOpen: true } : {}),
          };
        });

        return { success: true };
      },

      updateQuantity: (id: string, change: number) => {
        const validationResult = updateQuantitySchema.safeParse({ id, change });
        if (!validationResult.success) {
          const errorMsg = validationResult.error.issues[0]?.message || "Invalid quantity update input.";
          toast.add({
            type: "warning",
            description: errorMsg,
          });
          return { success: false, message: errorMsg };
        }

        const { id: validId, change: validChange } = validationResult.data;

        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id === validId) {
                const newQty = item.quantity + validChange;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        }));

        return { success: true };
      },

      updateSize: (id: string, size: string) => {
        set((state) => {
          const targetIndex = state.items.findIndex((item) => item.id === id);
          if (targetIndex === -1) return state;

          const currentItem = state.items[targetIndex];
          if ((currentItem.size || "") === (size || "")) return state;

          const currentBase = currentItem.basePrice ?? currentItem.price;
          const newPrice = calculateSizePrice(currentBase, size);
          const prodId = currentItem.productId || currentItem.id.split("-")[0];
          const newCompositeId = `${prodId}-${size || "default"}-${currentItem.iceLevel || "Normal"}-${currentItem.sugarLevel || "Normal"}-${currentItem.milkType || "Normal"}`;

          if (currentItem.quantity > 1) {
            const updated = [...state.items];
            updated[targetIndex] = {
              ...currentItem,
              quantity: currentItem.quantity - 1,
            };

            const existingOtherIndex = updated.findIndex((item) => item.id === newCompositeId);
            if (existingOtherIndex > -1) {
              updated[existingOtherIndex] = {
                ...updated[existingOtherIndex],
                quantity: updated[existingOtherIndex].quantity + 1,
              };
            } else {
              updated.push({
                ...currentItem,
                id: newCompositeId,
                productId: prodId,
                size,
                basePrice: currentBase,
                price: newPrice,
                quantity: 1,
              });
            }
            return { items: updated };
          }

          const existingOtherIndex = state.items.findIndex((item, idx) => idx !== targetIndex && item.id === newCompositeId);
          if (existingOtherIndex > -1) {
            const updated = [...state.items];
            updated[existingOtherIndex] = {
              ...updated[existingOtherIndex],
              quantity: updated[existingOtherIndex].quantity + 1,
            };
            updated.splice(targetIndex, 1);
            return { items: updated };
          }

          const updated = [...state.items];
          updated[targetIndex] = {
            ...currentItem,
            id: newCompositeId,
            productId: prodId,
            size,
            basePrice: currentBase,
            price: newPrice,
          };
          return { items: updated };
        });
      },

      updateIceLevel: (id: string, iceLevel: string) => {
        set((state) => {
          const targetIndex = state.items.findIndex((item) => item.id === id);
          if (targetIndex === -1) return state;

          const currentItem = state.items[targetIndex];
          if ((currentItem.iceLevel || "Normal") === (iceLevel || "Normal")) return state;

          const prodId = currentItem.productId || currentItem.id.split("-")[0];
          const newCompositeId = `${prodId}-${currentItem.size || "default"}-${iceLevel || "Normal"}-${currentItem.sugarLevel || "Normal"}-${currentItem.milkType || "Normal"}`;

          if (currentItem.quantity > 1) {
            const updated = [...state.items];
            updated[targetIndex] = {
              ...currentItem,
              quantity: currentItem.quantity - 1,
            };

            const existingOtherIndex = updated.findIndex((item) => item.id === newCompositeId);
            if (existingOtherIndex > -1) {
              updated[existingOtherIndex] = {
                ...updated[existingOtherIndex],
                quantity: updated[existingOtherIndex].quantity + 1,
              };
            } else {
              updated.push({
                ...currentItem,
                id: newCompositeId,
                productId: prodId,
                iceLevel,
                quantity: 1,
              });
            }
            return { items: updated };
          }

          const existingOtherIndex = state.items.findIndex((item, idx) => idx !== targetIndex && item.id === newCompositeId);
          if (existingOtherIndex > -1) {
            const updated = [...state.items];
            updated[existingOtherIndex] = {
              ...updated[existingOtherIndex],
              quantity: updated[existingOtherIndex].quantity + 1,
            };
            updated.splice(targetIndex, 1);
            return { items: updated };
          }

          const updated = [...state.items];
          updated[targetIndex] = {
            ...currentItem,
            id: newCompositeId,
            productId: prodId,
            iceLevel,
          };
          return { items: updated };
        });
      },

      updateSugarLevel: (id: string, sugarLevel: string) => {
        set((state) => {
          const targetIndex = state.items.findIndex((item) => item.id === id);
          if (targetIndex === -1) return state;

          const currentItem = state.items[targetIndex];
          if ((currentItem.sugarLevel || "Normal") === (sugarLevel || "Normal")) return state;

          const prodId = currentItem.productId || currentItem.id.split("-")[0];
          const newCompositeId = `${prodId}-${currentItem.size || "default"}-${currentItem.iceLevel || "Normal"}-${sugarLevel || "Normal"}-${currentItem.milkType || "Normal"}`;

          if (currentItem.quantity > 1) {
            const updated = [...state.items];
            updated[targetIndex] = {
              ...currentItem,
              quantity: currentItem.quantity - 1,
            };

            const existingOtherIndex = updated.findIndex((item) => item.id === newCompositeId);
            if (existingOtherIndex > -1) {
              updated[existingOtherIndex] = {
                ...updated[existingOtherIndex],
                quantity: updated[existingOtherIndex].quantity + 1,
              };
            } else {
              updated.push({
                ...currentItem,
                id: newCompositeId,
                productId: prodId,
                sugarLevel,
                quantity: 1,
              });
            }
            return { items: updated };
          }

          const existingOtherIndex = state.items.findIndex((item, idx) => idx !== targetIndex && item.id === newCompositeId);
          if (existingOtherIndex > -1) {
            const updated = [...state.items];
            updated[existingOtherIndex] = {
              ...updated[existingOtherIndex],
              quantity: updated[existingOtherIndex].quantity + 1,
            };
            updated.splice(targetIndex, 1);
            return { items: updated };
          }

          const updated = [...state.items];
          updated[targetIndex] = {
            ...currentItem,
            id: newCompositeId,
            productId: prodId,
            sugarLevel,
          };
          return { items: updated };
        });
      },

      updateMilkType: (id: string, milkType: string) => {
        set((state) => {
          const targetIndex = state.items.findIndex((item) => item.id === id);
          if (targetIndex === -1) return state;

          const currentItem = state.items[targetIndex];
          if ((currentItem.milkType || "Normal") === (milkType || "Normal")) return state;

          const prodId = currentItem.productId || currentItem.id.split("-")[0];
          const newCompositeId = `${prodId}-${currentItem.size || "default"}-${currentItem.iceLevel || "Normal"}-${currentItem.sugarLevel || "Normal"}-${milkType || "Normal"}`;

          if (currentItem.quantity > 1) {
            const updated = [...state.items];
            updated[targetIndex] = {
              ...currentItem,
              quantity: currentItem.quantity - 1,
            };

            const existingOtherIndex = updated.findIndex((item) => item.id === newCompositeId);
            if (existingOtherIndex > -1) {
              updated[existingOtherIndex] = {
                ...updated[existingOtherIndex],
                quantity: updated[existingOtherIndex].quantity + 1,
              };
            } else {
              updated.push({
                ...currentItem,
                id: newCompositeId,
                productId: prodId,
                milkType,
                quantity: 1,
              });
            }
            return { items: updated };
          }

          const existingOtherIndex = state.items.findIndex((item, idx) => idx !== targetIndex && item.id === newCompositeId);
          if (existingOtherIndex > -1) {
            const updated = [...state.items];
            updated[existingOtherIndex] = {
              ...updated[existingOtherIndex],
              quantity: updated[existingOtherIndex].quantity + 1,
            };
            updated.splice(targetIndex, 1);
            return { items: updated };
          }

          const updated = [...state.items];
          updated[targetIndex] = {
            ...currentItem,
            id: newCompositeId,
            productId: prodId,
            milkType,
          };
          return { items: updated };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "coffee_shop_cart",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.items)) {
          state.items = state.items
            .filter((item) => cartItemSchema.safeParse(item).success)
            .map((item) => {
              const config = getItemCustomizationConfig(item.title);
              let size = item.size;
              if (config.hasSize && (!size || !config.sizeOptions.includes(size))) {
                size = config.sizeOptions[0] || "1";
              }

              let sugarLevel = item.sugarLevel || "Normal";
              if (sugarLevel.includes("Less") || sugarLevel.includes("50%") || sugarLevel.includes("25%") || sugarLevel.includes("0%")) {
                sugarLevel = "Less";
              } else {
                sugarLevel = "Normal";
              }

              let iceLevel = item.iceLevel || "Normal";
              if (iceLevel.includes("Normal")) iceLevel = "Normal";
              else if (iceLevel.includes("Less")) iceLevel = "Less";
              else if (iceLevel.includes("No")) iceLevel = "No Ice";
              else iceLevel = "Normal";

              let milkType = item.milkType || "Normal";
              if (milkType.includes("Less")) milkType = "Less Milk";
              else if (milkType.includes("No")) milkType = "No Milk";
              else milkType = "Normal";

              const prod = getProductByIdOrTitle(item.productId || item.id, item.title);
              const prodId = item.productId || prod?.id || item.id.split("-")[0];
              const compositeId = `${prodId}-${size || "default"}-${iceLevel}-${sugarLevel}-${milkType}`;

              return { ...item, id: compositeId, productId: prodId, size, sugarLevel, iceLevel, milkType };
            });
        }
      },
    }
  )
);
