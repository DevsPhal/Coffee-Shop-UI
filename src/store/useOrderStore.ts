import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().optional(),
});

export const orderRecordSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  customerName: z.string(),
  paymentType: z.string().default("QR Scan"),
  deliveryMethod: z.enum(["pickup", "delivery", "grab"]).default("pickup"),
  location: z.string().default("G01"),
  estimatedTime: z.string().default("15 - 25 mins"),
  items: z.array(orderItemSchema),
  subtotal: z.number(),
  deliveryFee: z.number(),
  grandTotal: z.number(),
  status: z.enum(["Order Confirmed", "Preparing", "On the way", "Completed"]).default("Preparing"),
  createdAt: z.string(),
});

export type OrderItemRecord = z.infer<typeof orderItemSchema>;
export type OrderRecord = z.infer<typeof orderRecordSchema>;

const initialMockOrders: OrderRecord[] = [
  {
    id: "ORD-590-1001",
    userId: "00621",
    customerName: "Ream",
    paymentType: "QR Scan",
    deliveryMethod: "delivery",
    location: "House 30A, St 590, Toul Kork",
    estimatedTime: "15 - 25 mins",
    items: [
      { id: "1", title: "Amacano", price: 1.75, quantity: 2, image: "/images/Amacano.png" },
      { id: "2", title: "Cambodia Beer", price: 1.50, quantity: 1, image: "/images/cambodiabeer.png" },
    ],
    subtotal: 5.00,
    deliveryFee: 1.75,
    grandTotal: 6.75,
    status: "Preparing",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

interface OrderStoreState {
  ordersHistory: OrderRecord[];

  // Actions
  addOrder: (order: Omit<OrderRecord, "id" | "createdAt" | "status"> & { id?: string; status?: OrderRecord["status"] }) => OrderRecord;
  getOrdersForUser: (userId?: string, customerName?: string) => OrderRecord[];
  getOrderById: (orderId: string) => OrderRecord | undefined;
  clearHistory: () => void;
}

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set, get) => ({
      ordersHistory: initialMockOrders,

      addOrder: (input) => {
        const newRecord: OrderRecord = {
          id: input.id || `ORD-590-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: input.userId,
          customerName: input.customerName || "Guest",
          paymentType: input.paymentType || "QR Scan",
          deliveryMethod: input.deliveryMethod || "pickup",
          location: input.location || "G01",
          estimatedTime: input.estimatedTime || (input.deliveryFee > 0 ? "15 - 25 mins" : "5 mins"),
          items: input.items || [],
          subtotal: input.subtotal || 0,
          deliveryFee: input.deliveryFee || 0,
          grandTotal: input.grandTotal || (input.subtotal + input.deliveryFee),
          status: input.status || "Preparing",
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          // Avoid duplicate order IDs or identical order submissions within 10 seconds
          const exists = state.ordersHistory.some(
            (o) =>
              o.id === newRecord.id ||
              (o.grandTotal === newRecord.grandTotal &&
                o.customerName === newRecord.customerName &&
                Math.abs(new Date(o.createdAt).getTime() - new Date(newRecord.createdAt).getTime()) < 10000)
          );
          if (exists) {
            return state;
          }
          return {
            ordersHistory: [newRecord, ...state.ordersHistory],
          };
        });

        return newRecord;
      },

      getOrdersForUser: (userId, customerName) => {
        const { ordersHistory } = get();
        if (!userId && !customerName) return [];

        return ordersHistory.filter((o) => {
          if (userId && o.userId === userId) return true;
          if (customerName && o.customerName && o.customerName.toLowerCase() === customerName.toLowerCase()) return true;
          return false;
        });
      },

      getOrderById: (orderId) => {
        return get().ordersHistory.find((o) => o.id === orderId);
      },

      clearHistory: () => {
        set({ ordersHistory: [] });
      },
    }),
    {
      name: "order_history_store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
