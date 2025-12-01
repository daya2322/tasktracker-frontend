import axios from "axios";

export const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Error handler
export function handleError(error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
        console.error("API Error:", error.response.data);

        if (error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return { error: true, data: error.response.data };
    }

    return { error: true, data: { message: "Unknown error" } };
}

// LOGIN
export const login = async (credentials: { email: string; password: string }) => {
    try {
        const res = await API.post("/api/master/auth/login", credentials);
        return { error: false, data: res.data };
    } catch (error: unknown) {
        return handleError(error);
    }
};

// LOGOUT
export const logout = async () => {
    try {
        const res = await API.post("/api/master/auth/logout");
        return { error: false, data: res.data };
    } catch (error: unknown) {
        return handleError(error);
    }
};

// VERIFY TOKEN
export const isVerify = async () => {
    try {
        const res = await API.get("/api/master/auth/me");  // 🔥 FIXED
        return { error: false, data: res.data };
    } catch (error) {
        return handleError(error);
    }
};
