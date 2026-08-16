import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserData } from "./useAuthStore";

export interface UserPreferences {
  theme: "light" | "dark";
  notificationsEnabled: boolean;
  preferredCategory?: string;
}

interface UserStoreState {
  preferences: UserPreferences;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: "light",
  notificationsEnabled: true,
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      setPreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs },
        })),
      resetPreferences: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: "coffee_shop_user_prefs",
    }
  )
);

// Re-export auth store user types for convenience
export type { UserData };
