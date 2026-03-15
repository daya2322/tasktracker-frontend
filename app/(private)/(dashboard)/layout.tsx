"use client";

import { initialLinkData } from "@/app/(private)/data/dashboardLinks";
import LinkDataReducer from "@/app/utils/linkDataReducer";
import { useReducer } from "react";
import { LoadingProvider } from "@/app/services/loadingContext";
import { PermissionProvider } from "@/app/components/contexts/permissionContext";
import useIdleLogout from "@/app/utils/useIdleLogout";
import TopNavbar from "./topNavbar";
import { ThemeProvider, useTheme } from "@/app/components/contexts/themeContext";

// ─── Inner layout — consumes theme ───────────────────────────────────────────
function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  const [, dispatch] = useReducer(LinkDataReducer, initialLinkData);

  useIdleLogout(5 * 60 * 1000);

  const handleLinkClick = (clickedHref: string) => {
    dispatch({ type: "activate", payload: clickedHref });
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">

      {/* ── Navbar ── */}
      <TopNavbar
        onClickHandler={handleLinkClick}
        showSidebar={false}
        setShowSidebar={() => {}}
      />

      {/* ── Page content — background switches with theme ── */}
      <div
        className="flex-1 overflow-auto transition-colors duration-300"
        style={{
          background: isDark ? "#06101e" : "#f1f5f9",
          color:      isDark ? "#e2e8f0" : "#0f172a",
        }}
      >
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </div>

    </div>
  );
}

// ─── Root layout — ThemeProvider wraps everything ────────────────────────────
export default function DashboardLayout1({ children }: { children: React.ReactNode }) {
  return (
    <PermissionProvider>
      {/*
        ThemeProvider must be OUTSIDE DashboardInner so both the navbar
        (toggle button) and the content area (background) share the same
        isDark state via context.
      */}
      <ThemeProvider>
        <DashboardInner>{children}</DashboardInner>
      </ThemeProvider>
    </PermissionProvider>
  );
}