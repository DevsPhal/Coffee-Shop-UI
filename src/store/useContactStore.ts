import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";
import { toast } from "@/components/ui/toast";

export const contactMessageSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Please enter your full name." })
    .min(2, { message: "Full Name must be at least 2 characters." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email address." })
    .email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[0-9+\s-]{8,15}$/.test(val), {
      message: "Phone / Telegram must be valid (8-15 digits).",
    }),
  topic: z.string().trim().min(1, { message: "Please select a topic." }),
  message: z
    .string()
    .trim()
    .min(1, { message: "Please enter your message." })
    .min(5, { message: "Message must be at least 5 characters long." }),
  userId: z.string().optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export interface ContactMessageRecord extends ContactMessageInput {
  id: string;
  createdAt: string;
  status: "Received" | "In Review" | "Resolved";
}

const initialFormData: ContactMessageInput = {
  fullName: "",
  email: "",
  phone: "",
  topic: "General Inquiry",
  message: "",
  userId: undefined,
};

interface ContactStoreState {
  formData: ContactMessageInput;
  isSubmitting: boolean;
  isSubmitted: boolean;
  errors: Partial<Record<keyof ContactMessageInput, string>>;
  messagesHistory: ContactMessageRecord[];

  // Actions
  setField: <K extends keyof ContactMessageInput>(field: K, value: ContactMessageInput[K]) => void;
  setTopic: (topic: string) => void;
  prefillUser: (user: { userId?: string; name?: string; email?: string; phone?: string } | null) => void;
  validateField: <K extends keyof ContactMessageInput>(field: K, value: ContactMessageInput[K]) => void;
  resetForm: () => void;
  submitMessage: (currentUser?: { userId?: string; name?: string; email?: string } | null) => Promise<{ success: boolean; message?: string }>;
  clearHistory: () => void;
}

export const useContactStore = create<ContactStoreState>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      isSubmitting: false,
      isSubmitted: false,
      errors: {},
      messagesHistory: [],

      setField: (field, value) => {
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          errors: { ...state.errors, [field]: undefined },
        }));
      },

      setTopic: (topic) => {
        set((state) => ({
          formData: { ...state.formData, topic },
          errors: { ...state.errors, topic: undefined },
        }));
      },

      prefillUser: (user) => {
        if (!user) return;
        set((state) => ({
          formData: {
            ...state.formData,
            fullName: state.formData.fullName ? state.formData.fullName : (user.name || ""),
            email: state.formData.email ? state.formData.email : (user.email || ""),
            phone: state.formData.phone ? state.formData.phone : (user.phone || ""),
            userId: user.userId || state.formData.userId,
          },
        }));
      },

      validateField: (field, value) => {
        const shape = contactMessageSchema.shape[field];
        if (!shape) return;
        const res = shape.safeParse(value);
        if (!res.success) {
          const msg = res.error.issues[0]?.message;
          set((state) => ({ errors: { ...state.errors, [field]: msg } }));
        } else {
          set((state) => ({ errors: { ...state.errors, [field]: undefined } }));
        }
      },

      resetForm: () => {
        set({
          formData: initialFormData,
          isSubmitting: false,
          isSubmitted: false,
          errors: {},
        });
      },

      submitMessage: async (currentUser) => {
        const { formData } = get();

        const dataToValidate = {
          ...formData,
          userId: currentUser?.userId || formData.userId,
        };

        const validationResult = contactMessageSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
          const fieldErrors = validationResult.error.flatten().fieldErrors;
          const newErrors: Partial<Record<keyof ContactMessageInput, string>> = {
            fullName: fieldErrors.fullName?.[0],
            email: fieldErrors.email?.[0],
            phone: fieldErrors.phone?.[0],
            topic: fieldErrors.topic?.[0],
            message: fieldErrors.message?.[0],
          };

          set({ errors: newErrors });

          const firstErr =
            newErrors.fullName ||
            newErrors.email ||
            newErrors.phone ||
            newErrors.topic ||
            newErrors.message ||
            "Please fill in all required fields.";

          toast.add({
            type: "warning",
            description: firstErr,
          });

          return { success: false, message: firstErr };
        }

        const validData = validationResult.data;
        set({ isSubmitting: true, errors: {} });

        await new Promise((resolve) => setTimeout(resolve, 800));

        const newRecord: ContactMessageRecord = {
          ...validData,
          id: `msg_${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: "Received",
        };

        set((state) => ({
          isSubmitting: false,
          isSubmitted: true,
          messagesHistory: [newRecord, ...state.messagesHistory],
        }));

        toast.add({
          type: "success",
          description: "Your message has been sent successfully!",
        });

        return { success: true };
      },

      clearHistory: () => {
        set({ messagesHistory: [] });
      },
    }),
    {
      name: "contact_store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        messagesHistory: state.messagesHistory,
      }),
    }
  )
);
