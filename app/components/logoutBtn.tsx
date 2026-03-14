"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/contexts/authContext";

export default function LogoutBtn() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();                 // clear token + user
    router.replace("/login"); // prevent back navigation
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
