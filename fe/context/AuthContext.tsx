"use client";

import { AuthData, User } from "@/types/api";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fix: Make children optional to resolve JSX children missing error in index.tsx
export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("ally_user");
    const token = localStorage.getItem("ally_access_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Auth: Failed to parse user data.");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (data: AuthData) => {
    setUser(data.user);
    localStorage.setItem("ally_user", JSON.stringify(data.user));
    localStorage.setItem("ally_access_token", data.session.access_token);
    localStorage.setItem("ally_refresh_token", data.session.refresh_token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ally_user");
    localStorage.removeItem("ally_access_token");
    localStorage.removeItem("ally_refresh_token");
  };

  return <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
};
