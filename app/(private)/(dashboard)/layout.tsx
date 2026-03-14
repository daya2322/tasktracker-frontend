"use client";

import { initialLinkData } from "@/app/(private)/data/dashboardLinks";
import LinkDataReducer from "@/app/utils/linkDataReducer";
import { useReducer, useState } from "react";
import { LoadingProvider } from "@/app/services/loadingContext";
import Sidebar from "./sidebar";
import { PermissionProvider } from "@/app/components/contexts/permissionContext";
import useIdleLogout from "@/app/utils/useIdleLogout";

export default function DashboardLayout1({ children }: { children: React.ReactNode }) {

    const [sidebarData, dispatch] = useReducer(LinkDataReducer, initialLinkData);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // ⭐ AUTO LOGOUT (Correct Place)
    useIdleLogout(5 * 60 * 1000);

    const handleLinkClick = (clickedHref: string) => {
        dispatch({ type: "activate", payload: clickedHref });
    };

    return (
        <PermissionProvider>
            <div className="flex h-screen">
                <Sidebar
                    onClickHandler={handleLinkClick}
                    showSidebar={isOpen}
                    setShowSidebar={setIsOpen}
                />

                <div
                    className="w-full p-[20px] pb-[22px] h-screen bg-gray-50 text-black overflow-auto transition-all duration-300 ease-in-out"
                    style={{ display: isOpen ? "none" : "block" }}
                >
                    <LoadingProvider>
                        {children}
                    </LoadingProvider>
                </div>
            </div>
        </PermissionProvider>
    );
}
