"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/contexts/authContect";

export default function LogoutBtn() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
            Logout
        </button>
    );
}
