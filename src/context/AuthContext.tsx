"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("isLoggedIn");
      if (stored === "true") {
        setIsLoggedIn(true);
      }
    } catch {
      // fallback if localStorage disabled
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem("isLoggedIn", "true");
    } catch {
      // fallback
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem("isLoggedIn", "false");
    } catch {
      // fallback
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
