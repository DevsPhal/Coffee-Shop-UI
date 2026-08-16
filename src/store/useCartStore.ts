import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";
import { toast } from "@/components/ui/toast";

// Zod Schema for Cart Item validation
export const cartItemSchema = z.object({
  id: z.string().trim().min(1, { message: "Cart item ID is required." }),
  title: z.string().trim().min(1, { message: "Item title is required." }),
  price: z.number().nonnegative({ message: "Price cannot be negative." }),
  quantity: z.number().int().positive({ message: "Quantity must be at least 1." }),
  image: z.string().optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Zod Schema for Adding an Item to Cart
export const addItemInputSchema = z.object({
  id: z.string().trim().min(1, { message: "Invalid product ID." }),
  title: z.string().trim().min(1, { message: "Product title is required." }),
  price: z.number().nonnegative({ message: "Price must be a valid positive number." }),
  quantity: z.number().int().positive({ message: "Quantity must be at least 1." }).optional().default(1),
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

        // Validate input using Zod Schema
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

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === validData.id);
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + qtyToAdd,
            };
            return { items: updated, ...(openDrawer ? { isOpen: true } : {}) };
          }

          return {
            items: [
              ...state.items,
              {
                id: validData.id,
                title: validData.title,
                price: validData.price,
                quantity: qtyToAdd,
                image: validData.image,
              },
            ],
            ...(openDrawer ? { isOpen: true } : {}),
          };
        });

        return { success: true };
      },

      updateQuantity: (id: string, change: number) => {
        // Validate update quantity using Zod Schema
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
          // Filter rehydrated items using Zod schema to ensure valid storage state
          state.items = state.items.filter((item) => cartItemSchema.safeParse(item).success);
        }
      },
    }
  )
);
