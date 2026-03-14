"use client";

import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ================= ERROR HANDLER ================= */
export function handleError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    console.error("API Error:", error.response.data);

    if (
      error.response.status === 401 &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return { error: true, data: error.response.data };
  }

  return {
    error: true,
    data: { message: "Unknown error occurred" },
  };
}

/* ================= AUTH ================= */

// LOGIN
export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const res = await API.post("/api/auth/login", credentials);
    return { error: false, data: res.data };
  } catch (error: unknown) {
    return handleError(error);
  }
};

// LOGOUT (frontend-controlled)
export const logout = async () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }
    return { error: false };
  } catch (error) {
    return handleError(error);
  }
};

// VERIFY TOKEN
export const isVerify = async () => {
  try {
    const res = await API.get("/api/auth/me");
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error);
  }
};

/* ================= ATTENDANCE ================= */

export const punchInApi = async (address: string) => {
  try {
    const res = await API.post("/api/attendance/punch-in", { address });
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error);
  }
};

export const punchOutApi = async (address: string) => {
  try {
    const res = await API.post("/api/attendance/punch-out", { address });
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getTodayAttendanceApi = async () => {
  try {
    const res = await API.get("/api/attendance/today");
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error);
  }
};

/* ================= LOCATION ================= */

export const getAddressFromCoords = async (
  latitude: number,
  longitude: number
) => {
  try {
    const res = await API.post("/api/location/reverse", {
      latitude,
      longitude,
    });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
