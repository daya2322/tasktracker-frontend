"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/components/contexts/authContext";
import { logout } from "../services/allApi";

const menus = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Add Task", path: "/tasks/add" },
  { label: "Timesheet", path: "/timesheet" },
  { label: "Your Calendar", path: "/calendar" },
  { label: "Attendance", path: "/attendence" },
  { label: "Reports", path: "/reports" },
  { label: "Item List", path: "/items" },
  { label: "Notice Board", path: "/notice-board" },
];

export default function SubNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };



  return (
    <nav className="bg-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Menus */}
      <div className="flex gap-6 text-sm font-medium">
        {menus.map((menu) => {
          const isActive = pathname === menu.path;

          return (
            <button
              key={menu.label}
              onClick={() => router.push(menu.path)}
              className={`flex items-center gap-1 transition
                ${isActive
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "hover:text-blue-600"
                }`}
            >
              {menu.label}
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Logout
      </button>
    </nav>
  );
}
