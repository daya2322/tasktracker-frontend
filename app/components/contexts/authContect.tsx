"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { isVerify, login as apiLogin, logout as apiLogout } from "@/app/services/allApi";

type User = { id: string; name?: string; email: string } | null;

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        console.log("fetchUser");
        const res = await isVerify();
        console.log(res);
        if (!res.error) setUser(res.data);
        else setUser(null);
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);


    // FIX: use apiLogin instead of login → avoids recursion
    const login = async (credentials: { email: string; password: string }) => {
        const res = await apiLogin(credentials);
        if (!res.error) {
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
        }
        return res;
    };

    const logout = async () => {
        await apiLogout();
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
