"use client";

import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Image from "next/image";
import { useState, useMemo } from "react";
import { initialLinkData, LinkDataType, SidebarDataType } from "../data/dashboardLinks";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/app/services/allApi";
import ResetPasswordSidebar from "@/app/components/ResetPasswordSidebar";
import { useTheme } from "@/app/components/contexts/themeContext";
import { IconifyIcon } from "@iconify-icon/react";

type LogoutResponse = { error: boolean; data?: { code?: number }; code?: number };

// ─── Theme toggle button ──────────────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        display: "flex", alignItems: "center",
        width: 52, height: 28, borderRadius: 99,
        padding: "3px",
        border: `1px solid ${isDark
          ? hov ? "rgba(250,204,21,0.5)"  : "rgba(250,204,21,0.2)"
          : hov ? "rgba(59,130,246,0.6)"  : "rgba(59,130,246,0.3)"
        }`,
        background: isDark
          ? hov ? "rgba(250,204,21,0.12)" : "rgba(250,204,21,0.06)"
          : hov ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
    >
      {/* Sliding circle */}
      <span style={{
        position: "absolute",
        width: 20, height: 20, borderRadius: "50%",
        left: isDark ? "calc(100% - 23px)" : "3px",
        transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        background: isDark
          ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
          : "linear-gradient(135deg, #60a5fa, #3b82f6)",
        boxShadow: isDark
          ? "0 0 8px rgba(251,191,36,0.7)"
          : "0 0 8px rgba(96,165,250,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11,
      }}>
        {isDark ? "☀️" : "🌙"}
      </span>

      {/* Track icons */}
      <span style={{
        position: "absolute", left: 5, fontSize: 10,
        opacity: isDark ? 0 : 0.5, transition: "opacity 0.2s",
      }}>🌙</span>
      <span style={{
        position: "absolute", right: 5, fontSize: 10,
        opacity: isDark ? 0.5 : 0, transition: "opacity 0.2s",
      }}>☀️</span>
    </button>
  );
}

// ─── Nav pill ─────────────────────────────────────────────────────────────────
function NavPill({
  icon, label, isActive, onClick,
}: {
  icon: string | IconifyIcon; label: string; isActive: boolean; onClick: () => void;
}) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 7,
        padding: "5px 13px", borderRadius: 8,
        fontSize: 13, fontWeight: 500, fontFamily: "inherit",
        border: "none", cursor: "pointer", whiteSpace: "nowrap",
        transition: "background 0.15s, color 0.15s",
        background: isActive
          ? isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)"
          : hov
          ? isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
          : "transparent",
        color: isActive
          ? isDark ? "#93c5fd" : "#2563eb"
          : hov
          ? isDark ? "#e2e8f0" : "#1e293b"
          : isDark ? "#94a3b8" : "#64748b",
      }}
    >
      <Icon icon={icon} width={15} style={{ flexShrink: 0 }} />
      <span>{label}</span>
      {isActive && (
        <span style={{
          position: "absolute", bottom: 1, left: "20%", right: "20%",
          height: 2, borderRadius: 99,
          background: isDark
            ? "linear-gradient(90deg, transparent, #3b82f6, transparent)"
            : "linear-gradient(90deg, transparent, #2563eb, transparent)",
          boxShadow: isDark ? "0 0 6px #3b82f6" : "0 0 6px #2563eb88",
        }} />
      )}
    </button>
  );
}

// ─── Action icon button ───────────────────────────────────────────────────────
function ActionBtn({ icon, title, onClick }: { icon: string; title: string; onClick?: () => void }) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, display: "flex", alignItems: "center",
        justifyContent: "center", borderRadius: 7,
        border: "none", cursor: "pointer", fontFamily: "inherit",
        background: hov
          ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"
          : "transparent",
        color: hov
          ? isDark ? "#cbd5e1" : "#334155"
          : isDark ? "#475569" : "#94a3b8",
        transition: "all 0.14s",
      }}
    >
      <Icon icon={icon} width={17} />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TopNavbar({
  onClickHandler,
}: Readonly<{
  onClickHandler: (href: string) => void;
  showSidebar: boolean;
  setShowSidebar: (value: boolean) => void;
}>) {
  const { isDark } = useTheme();
  const filteredMenu = initialLinkData;

  const data: SidebarDataType[] = (() => {
    if (!filteredMenu) return [];
    if (Array.isArray(filteredMenu) && filteredMenu.length > 0 && "data" in filteredMenu[0]) {
      return filteredMenu as unknown as SidebarDataType[];
    }
    return [{ name: undefined, data: filteredMenu as unknown as LinkDataType[] }];
  })();

  const [showResetPasswordSidebar, setShowResetPasswordSidebar] = useState(false);
  const [resetPasswordValues, setResetPasswordValues] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const activeHref = pathname ?? "";
  const allNavLinks = data.flatMap(g => g.data);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) { console.warn("Fullscreen failed:", err); }
  };

  const isLinkActive = (link: LinkDataType): boolean => {
    if (link.href === activeHref) return true;
    return link.children?.some(ch =>
      ch.href === activeHref || ch.children?.some(g => g.href === activeHref)
    ) ?? false;
  };

  const handleLinkClick = (link: LinkDataType) => {
    onClickHandler(link.href);
    if (link.href && link.href !== "" && link.href !== "#") {
      router.push(link.href);
    }
    setMobileOpen(false);
  };

  // ── Navbar colors based on theme ───────────────────────────────────────────
  const navBg      = isDark ? "#0b1525"                           : "#ffffff";
  const navBorder  = isDark ? "rgba(255,255,255,0.06)"            : "rgba(0,0,0,0.08)";
  const navShadow  = isDark ? "0 1px 12px rgba(0,0,0,0.5)"       : "0 1px 12px rgba(0,0,0,0.08)";
  const dividerCol = isDark ? "rgba(255,255,255,0.08)"            : "rgba(0,0,0,0.1)";
  const profileBorder = isDark ? "rgba(59,130,246,0.3)"          : "rgba(59,130,246,0.4)";
  const profileBg  = isDark ? "rgba(255,255,255,0.04)"           : "rgba(0,0,0,0.03)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .tnav-root { font-family: 'DM Sans', sans-serif; }
        @keyframes tnav-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes tnav-fadein {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: none; }
        }
        .tnav-root button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 6px;
        }
      `}</style>

      <div className="tnav-root" style={{ width: "100%", position: "relative", zIndex: 50 }}>

        {/* ── Main bar ── */}
        <header style={{
          height: 48,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", gap: 8,
          background: navBg,
          borderBottom: `1px solid ${navBorder}`,
          boxShadow: navShadow,
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}>

          {/* Left: Logo + Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, flex: 1 }}>
            {/* Logo */}
            <div
              onClick={() => router.push("/")}
              style={{
                display: "flex", alignItems: "center", cursor: "pointer",
                flexShrink: 0, marginRight: 8, paddingRight: 12,
                borderRight: `1px solid ${dividerCol}`,
              }}
            >
              <Image
                src={isDark ? "/logoWhite2.jpg" : "/logoWhite2.jpg"}
                width={90} height={24} alt="logo"
                style={{ height: 22, width: "auto", display: "block" }}
              />
            </div>

            {/* Nav links — desktop only */}
            <nav
              className="hidden md:flex"
              style={{ alignItems: "center", gap: 2, flexWrap: "nowrap", overflow: "hidden" }}
            >
              {allNavLinks.map((link, i) => (
                <NavPill
                  key={i}
                  icon={link.leadingIcon}
                  label={link.label}
                  isActive={isLinkActive(link)}
                  onClick={() => handleLinkClick(link)}
                />
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>

            {/* ── Theme toggle ── */}
            <ThemeToggle />

            <div style={{ width: 1, height: 18, background: dividerCol, margin: "0 4px" }} />

            {/* Fullscreen */}
            <ActionBtn
              icon={isFullscreen ? "mdi:fullscreen-exit" : "humbleicons:maximize"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={toggleFullscreen}
            />

            {/* Settings */}
            <ActionBtn
              icon="mi:settings"
              title="Settings"
              onClick={() => router.push("/settings")}
            />

            <div style={{ width: 1, height: 18, background: dividerCol, margin: "0 4px" }} />

            {/* Profile */}
            {/* ── Profile dropdown (fully custom — no external component) ── */}
            <div style={{ position: "relative" }}>
              {/* Trigger pill */}
              <button
                onClick={() => setShowDropdown(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "3px 8px 3px 3px", borderRadius: 20,
                  border: `1px solid ${showDropdown ? "rgba(59,130,246,0.55)" : profileBorder}`,
                  background: showDropdown ? "rgba(59,130,246,0.12)" : profileBg,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1.5px solid rgba(59,130,246,0.4)" }}>
                  <Image src="/dummyuser.jpg" alt="Profile" width={24} height={24} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <Icon icon="mdi:chevron-down" width={13} style={{ color: isDark ? "#475569" : "#94a3b8", transform: showDropdown ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>

              {/* Dropdown panel */}
              {showDropdown && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div onClick={() => setShowDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 58 }} />

                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    zIndex: 60, minWidth: 200,
                    background: isDark ? "#0f1c30" : "#ffffff",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: 12,
                    boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" : "0 8px 32px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    animation: "tnav-fadein 0.14s ease",
                  }}>
                    {/* User info header */}
                    <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(59,130,246,0.35)", flexShrink: 0 }}>
                          <Image src="/dummyuser.jpg" alt="Profile" width={34} height={34} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#e2e8f0" : "#0f172a" }}>My Account</div>
                          <div style={{ fontSize: 11, color: isDark ? "#475569" : "#94a3b8" }}>Manage settings</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "6px" }}>
                      {[
                        { icon: "mdi:account-circle-outline", label: "My Profile",       color: "#3b82f6", onClick: () => { setShowDropdown(false); router.push("/profile"); } },
                      ].map((item, i) => (
                        <button key={i} onClick={item.onClick}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 12px", borderRadius: 8, border: "none",
                            background: "transparent", cursor: "pointer", fontFamily: "inherit",
                            fontSize: 13, fontWeight: 500, color: isDark ? "#94a3b8" : "#475569",
                            transition: "all 0.13s", textAlign: "left",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.06)";
                            (e.currentTarget as HTMLButtonElement).style.color = isDark ? "#e2e8f0" : "#0f172a";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                            (e.currentTarget as HTMLButtonElement).style.color = isDark ? "#94a3b8" : "#475569";
                          }}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: item.color + "15", border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon icon={item.icon} width={15} style={{ color: item.color }} />
                          </div>
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Logout — separated */}
                    <div style={{ padding: "0 6px 6px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`, paddingTop: 6 }}>
                      <button
                        onClick={() => {
                          if (isLoggingOut) return;
                          setIsLoggingOut(true);
                          (logout() as Promise<LogoutResponse>)
                            .then(res => {
                              const code = res?.data?.code ?? (res as { code?: number })?.code;
                              if (code === 200 || code === 401) {
                                localStorage.removeItem("token");
                                setShowDropdown(false);
                                router.push("/");
                              } else { setIsLoggingOut(false); }
                            })
                            .catch(err => { console.error("Logout:", err); setIsLoggingOut(false); });
                        }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 12px", borderRadius: 8, border: "none",
                          background: "transparent", cursor: isLoggingOut ? "not-allowed" : "pointer",
                          fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                          color: "#f43f5e", opacity: isLoggingOut ? 0.6 : 1,
                          transition: "all 0.13s", textAlign: "left",
                        }}
                        onMouseEnter={e => { if (!isLoggingOut) (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,63,94,0.08)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isLoggingOut
                            ? <span style={{ width: 13, height: 13, border: "2px solid rgba(244,63,94,0.3)", borderTopColor: "#f43f5e", borderRadius: "50%", animation: "tnav-spin .7s linear infinite", display: "inline-block" }} />
                            : <Icon icon="tabler:logout" width={14} style={{ color: "#f43f5e" }} />
                          }
                        </div>
                        {isLoggingOut ? "Logging out…" : "Logout"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger — hidden on md+ screens */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(v => !v)}
              style={{
                width: 32, height: 32, marginLeft: 4,
                /* ✅ NO display:"flex" here — inline style always beats Tailwind */
                /* Instead, use alignItems/justifyContent only, let className control visibility */
                alignItems: "center", justifyContent: "center",
                borderRadius: 7, fontFamily: "inherit",
                border: `1px solid ${mobileOpen ? "rgba(59,130,246,0.4)" : dividerCol}`,
                background: mobileOpen
                  ? "rgba(59,130,246,0.1)"
                  : isDark ? "transparent" : "rgba(0,0,0,0.03)",
                color: isDark ? "#64748b" : "#94a3b8",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <Icon
                icon={mobileOpen ? "heroicons-outline:x-mark" : "heroicons-outline:menu-alt-1"}
                width={17}
              />
            </button>
          </div>
        </header>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div
            className="md:hidden"
            style={{
              background: isDark ? "#0b1525" : "#ffffff",
              borderBottom: `1px solid ${navBorder}`,
              padding: "8px 12px 12px",
              /* ✅ flexDirection here is fine since display is controlled by className */
              flexDirection: "column", gap: 2,
              animation: "tnav-fadein 0.16s ease",
              transition: "background 0.3s",
            }}
          >
            {allNavLinks.map((link, i) => {
              const isActive = isLinkActive(link);
              return (
                <button
                  key={i}
                  onClick={() => handleLinkClick(link)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 8,
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                    border: "none", cursor: "pointer", textAlign: "left",
                    background: isActive
                      ? isDark ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.08)"
                      : "transparent",
                    color: isActive
                      ? isDark ? "#93c5fd" : "#2563eb"
                      : isDark ? "#94a3b8" : "#64748b",
                    transition: "all 0.13s",
                  }}
                >
                  <Icon icon={link.leadingIcon} width={16} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ResetPasswordSidebar
        show={showResetPasswordSidebar}
        onClose={() => setShowResetPasswordSidebar(false)}
        setFieldValue={(field, value) =>
          setResetPasswordValues(prev => ({ ...prev, [field]: value }))
        }
        values={resetPasswordValues}
      />
    </>
  );
}