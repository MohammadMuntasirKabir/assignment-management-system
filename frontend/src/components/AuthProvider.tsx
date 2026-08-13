"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthResponse, User } from "@/lib/types";
import { saveAuthData, clearAuthData, getStoredUser, isAuthenticated, roleNumberToRole } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser && isAuthenticated()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/login", { email, password });
    const authResponse = response.data;
    saveAuthData(authResponse);
    setUser({
      id: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: roleNumberToRole(authResponse.role),
      createdAt: new Date().toISOString(),
    });
    return authResponse;
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/register", { name, email, password });
    const authResponse = response.data;
    saveAuthData(authResponse);
    setUser({
      id: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: roleNumberToRole(authResponse.role),
      createdAt: new Date().toISOString(),
    });
    return authResponse;
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
