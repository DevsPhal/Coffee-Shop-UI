import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import { userLoginSchema, signUpSchema } from "@/lib/authSchema";
import { useCartStore } from "./useCartStore";

export const userDataSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email format." }),
  phone: z.string().optional(),
  gender: z.string().optional(),
  password: z.string().optional(),
  avatarUrl: z.string(),
  capital: z.string().optional(),
  district: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
});

export type UserData = z.infer<typeof userDataSchema>;

const DEFAULT_DEMO_USER: UserData = {
  userId: "00621",
  name: "Ream",
  email: "ream@gmail.com",
  phone: "012345222",
  gender: "Female",
  password: "123",
  avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
  capital: "Phnom Penh",
  district: "Khan Boeng Keng Kang",
  zipCode: "120000",
  address: "St 590, Boeung Keng Kang 1",
};

interface AuthStoreState {
  isLoggedIn: boolean;
  user: UserData | null;
  keepLoggedIn: boolean;
  registeredUsers: UserData[];

  // Actions
  login: (credentials?: { identifier?: string; password?: string; keepLoggedIn?: boolean }) => { success: boolean; message?: string };
  signup: (userData: { name: string; email: string; phone?: string; gender?: string; password?: string }) => { success: boolean; message?: string };
  updateUser: (userData: Partial<UserData>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      keepLoggedIn: false,
      registeredUsers: [DEFAULT_DEMO_USER],

      login: (credentials) => {
        const identifier = (credentials?.identifier || "").trim();
        const password = (credentials?.password || "").trim();
        const shouldKeepLoggedIn = !!credentials?.keepLoggedIn;

        const loginValidation = userLoginSchema.safeParse({
          username: identifier,
          password: password,
        });

        if (!loginValidation.success) {
          const errorMsg = loginValidation.error.issues[0]?.message || "Validation failed.";
          toast.add({ type: "warning", description: errorMsg });
          return { success: false, message: errorMsg };
        }

        const currentAccounts = get().registeredUsers.length > 0 ? get().registeredUsers : [DEFAULT_DEMO_USER];

        const matchedUser = currentAccounts.find(
          (u) =>
            ((u.name || "").toLowerCase() === identifier.toLowerCase() || (u.email || "").toLowerCase() === identifier.toLowerCase()) &&
            (u.password || "") === password
        );

        if (!matchedUser) {
          const msg = "Account not found or password incorrect. Please sign up first!";
          toast.add({ type: "warning", description: msg });
          return { success: false, message: msg };
        }

        set({ isLoggedIn: true, user: matchedUser, keepLoggedIn: shouldKeepLoggedIn });
        useCartStore.getState().clearCart();

        toast.add({
          type: "success",
          description: `Welcome back, ${matchedUser.name}!`,
        });

        return { success: true };
      },

      signup: (userData) => {
        const nameTrim = (userData.name || "").trim();
        const emailTrim = (userData.email || "").trim();
        const phoneTrim = (userData.phone || "").trim();
        const genderTrim = (userData.gender || "").trim();
        const passwordTrim = (userData.password || "").trim();

        const signupValidation = signUpSchema.safeParse({
          username: nameTrim,
          gender: genderTrim,
          email: emailTrim,
          phone: phoneTrim,
          password: passwordTrim,
        });

        if (!signupValidation.success) {
          const errorMsg = signupValidation.error.issues[0]?.message || "Validation failed.";
          toast.add({ type: "warning", description: errorMsg });
          return { success: false, message: errorMsg };
        }

        const currentAccounts = get().registeredUsers;
        const existing = currentAccounts.find(
          (u) => u.name.toLowerCase() === nameTrim.toLowerCase() || u.email.toLowerCase() === emailTrim.toLowerCase()
        );

        if (existing) {
          const msg = "An account with this username or email already exists. Please log in.";
          toast.add({ type: "warning", description: msg });
          return { success: false, message: msg };
        }

        const newUser: UserData = {
          userId: `00${Math.floor(Math.random() * 899 + 100)}`,
          name: nameTrim,
          email: emailTrim,
          phone: phoneTrim,
          gender: genderTrim,
          password: passwordTrim,
          avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
        };

        const updatedAccounts = [...currentAccounts, newUser];

        set({
          registeredUsers: updatedAccounts,
          isLoggedIn: true,
          user: newUser,
          keepLoggedIn: false,
        });
        useCartStore.getState().clearCart();

        toast.add({
          type: "success",
          description: "Account created successfully!",
        });

        return { success: true };
      },

      updateUser: (userData) => {
        const { user, registeredUsers } = get();
        if (!user) return;

        const updatedUser = { ...user, ...userData };
        const updatedAccounts = registeredUsers.map((u) =>
          u.userId === user.userId ? { ...u, ...userData } : u
        );

        set({
          user: updatedUser,
          registeredUsers: updatedAccounts,
        });
      },

      logout: () => {
        set({ isLoggedIn: false, user: null, keepLoggedIn: false });
        useCartStore.getState().clearCart();
        toast.add({
          type: "info",
          description: "You have logged out.",
        });
      },
    }),
    {
      name: "coffee_shop_auth",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        registeredUsers: state.registeredUsers,
        keepLoggedIn: state.keepLoggedIn,
        isLoggedIn: state.keepLoggedIn ? state.isLoggedIn : false,
        user: state.keepLoggedIn ? state.user : null,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.keepLoggedIn) {
            state.isLoggedIn = false;
            state.user = null;
          }
        }
      },
    }
  )
);

