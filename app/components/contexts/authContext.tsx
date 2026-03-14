"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isVerify, login as loginApi } from "@/app/services/allApi";

/* ================= TYPES ================= */

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  message: string[];
};

type LoginCredentials = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ error: boolean; data?: User }>;
  logout: () => void;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ✅ Verify user on page refresh */
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await isVerify();

        if (!res?.error) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  /* ================= LOGIN ================= */

  const login = async (credentials: LoginCredentials) => {
    const res = await loginApi(credentials);

    if (!res?.error) {
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    }

    return res;
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
