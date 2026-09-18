import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

import { toast } from "@/components/ui/toast";
import type { IceLevel, MilkType, SugarLevel, UUID } from "@/store/api/types";

/**
 * The guest cart.
 *
 * It stays local so a visitor can shop before signing in — the API's cart requires a customer
 * account. At checkout the lines are pushed to `/api/customer/cart` and turned into an order
 * (see `useCheckout`), so every field here is shaped to be sent as-is: product and size are
 * UUIDs, and the customization levels are the API's enum values, not display labels.
 *
 * Lines are keyed by `lineId`, a "|"-joined composite. The delimiter matters: UUIDs contain
 * hyphens, so the previous "-"-joined key could not be split back apart.
 */

const LINE_DELIMITER = "|";

export const cartItemSchema = z.object({
  /** Composite key identifying this exact configuration of a product. */
  lineId: z.string().min(1),
  productId: z.string().uuid({ message: "Product id must be a UUID from the API." }),
  title: z.string().trim().min(1, { message: "Item title is required." }),
  image: z.string().nullable().optional(),
  /** finalPrice + the chosen size's priceDelta, as the API will charge it. */
  unitPrice: z.number().nonnegative({ message: "Price cannot be negative." }),
  /** Pre-discount unit price, present only while a discount is running. */
  originalUnitPrice: z.number().nonnegative().optional(),
  quantity: z.number().int().positive({ message: "Quantity must be at least 1." }),
  sizeOptionId: z.string().uuid().nullable().optional(),
  sizeName: z.string().nullable().optional(),
  sugarLevel: z
    .enum(["ZERO", "TWENTY_FIVE", "FIFTY", "SEVENTY_FIVE", "HUNDRED"])
    .optional(),
  iceLevel: z
    .enum(["ZERO", "TWENTY_FIVE", "FIFTY", "SEVENTY_FIVE", "HUNDRED"])
    .optional(),
  milkType: z
    .enum([
      "NONE",
      "WHOLE_MILK",
      "SKIM_MILK",
      "OAT_MILK",
      "ALMOND_MILK",
      "SOY_MILK",
      "CONDENSED_MILK",
    ])
    .optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const addItemInputSchema = cartItemSchema
  .omit({ lineId: true })
  .extend({ quantity: z.number().int().positive().optional().default(1) });

export type AddItemInput = z.input<typeof addItemInputSchema>;

/** Two lines merge only when the product *and* every chosen option match. */
export function buildLineId(item: {
  productId: UUID;
  sizeOptionId?: UUID | null;
  sugarLevel?: SugarLevel;
  iceLevel?: IceLevel;
  milkType?: MilkType;
}): string {
  return [
    item.productId,
    item.sizeOptionId ?? "",
    item.sugarLevel ?? "",
    item.iceLevel ?? "",
    item.milkType ?? "",
  ].join(LINE_DELIMITER);
}

interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (
    item: AddItemInput,
    openDrawer?: boolean
  ) => { success: boolean; message?: string };
  updateQuantity: (lineId: string, change: number) => { success: boolean; message?: string };
  updateSize: (
    lineId: string,
    sizeOptionId: UUID | null,
    sizeName: string | null,
    unitPrice: number
  ) => void;
  updateIceLevel: (lineId: string, iceLevel: IceLevel) => void;
  updateSugarLevel: (lineId: string, sugarLevel: SugarLevel) => void;
  updateMilkType: (lineId: string, milkType: MilkType) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getTotalCount: () => number;
}

/** Re-key a line after one of its options changed, merging into a twin if one now exists. */
function rekey(items: CartItem[], lineId: string, patch: Partial<CartItem>): CartItem[] {
  const index = items.findIndex((item) => item.lineId === lineId);
  if (index === -1) return items;

  const updated: CartItem = { ...items[index], ...patch };
  updated.lineId = buildLineId(updated);

  const rest = items.filter((_, i) => i !== index);
  const twin = rest.findIndex((item) => item.lineId === updated.lineId);
  if (twin > -1) {
    const merged = [...rest];
    merged[twin] = {
      ...merged[twin],
      quantity: merged[twin].quantity + updated.quantity,
    };
    return merged;
  }

  const next = [...items];
  next[index] = updated;
  return next;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem, openDrawer = false) => {
        const parsed = addItemInputSchema.safeParse(newItem);
        if (!parsed.success) {
          const message = parsed.error.issues[0]?.message || "Invalid cart item.";
          toast.add({ type: "warning", description: message });
          return { success: false, message };
        }

        const data = parsed.data;
        const lineId = buildLineId(data);

        set((state) => {
          const existing = state.items.findIndex((item) => item.lineId === lineId);
          if (existing > -1) {
            const items = [...state.items];
            items[existing] = {
              ...items[existing],
              quantity: items[existing].quantity + data.quantity,
            };
            return { items, isOpen: openDrawer || state.isOpen };
          }
          return {
            items: [...state.items, { ...data, lineId }],
            isOpen: openDrawer || state.isOpen,
          };
        });

        return { success: true };
      },

      updateQuantity: (lineId, change) => {
        const item = get().items.find((i) => i.lineId === lineId);
        if (!item) return { success: false, message: "Item not found." };

        const next = item.quantity + change;
        if (next <= 0) {
          set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) }));
          return { success: true };
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity: next } : i
          ),
        }));
        return { success: true };
      },

      updateSize: (lineId, sizeOptionId, sizeName, unitPrice) =>
        set((state) => ({
          items: rekey(state.items, lineId, { sizeOptionId, sizeName, unitPrice }),
        })),

      updateIceLevel: (lineId, iceLevel) =>
        set((state) => ({ items: rekey(state.items, lineId, { iceLevel }) })),

      updateSugarLevel: (lineId, sugarLevel) =>
        set((state) => ({ items: rekey(state.items, lineId, { sugarLevel }) })),

      updateMilkType: (lineId, milkType) =>
        set((state) => ({ items: rekey(state.items, lineId, { milkType }) })),

      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),

      getTotalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      // Bumped because the line shape changed from mock ids to API UUIDs: an old persisted
      // cart cannot be checked out, so it is dropped rather than half-migrated.
      version: 2,
      migrate: () => ({ items: [], isOpen: false }),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
