"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/toast";

export interface UserData {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  login: (userData?: Partial<UserData>) => void;
  signup: (userData: { name: string; email: string; phone?: string }) => void;
  updateUser: (userData: Partial<UserData>) => void;
  logout: () => void;
}

const DEFAULT_USER: UserData = {
  userId: "001",
  name: "Ream",
  email: "Ream123@gmail.com",
  avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("isLoggedIn");
      const storedUser = localStorage.getItem("user_data");

      if (storedAuth === "true") {
        setIsLoggedIn(true);
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (storedAuth === "true") {
        setUser(DEFAULT_USER);
      }
    } catch {
      // fallback if localStorage is disabled
    }
  }, []);

  const login = (userData?: Partial<UserData>) => {
    setIsLoggedIn(true);
    const updatedUser = {
      ...DEFAULT_USER,
      ...(user || {}),
      ...(userData || {}),
    };
    setUser(updatedUser);

    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
    } catch {
      // fallback
    }

    toast.add({
      type: "success",
      description: "Successfully logged in!",
    });
  };

  const signup = (userData: { name: string; email: string; phone?: string }) => {
    const newUser: UserData = {
      userId: `00${Math.floor(Math.random() * 899 + 100)}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
    };

    setIsLoggedIn(true);
    setUser(newUser);

    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user_data", JSON.stringify(newUser));
    } catch {
      // fallback
    }

    toast.add({
      type: "success",
      description: "Account created successfully!",
    });
  };

  const updateUser = (userData: Partial<UserData>) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    setUser(updated);
    try {
      localStorage.setItem("user_data", JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    try {
      localStorage.setItem("isLoggedIn", "false");
      localStorage.removeItem("user_data");
    } catch {
      // fallback
    }

    toast.add({
      type: "info",
      description: "You have logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, signup, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
