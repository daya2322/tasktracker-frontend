"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/components/contexts/themeContext";
import { useAuth } from "@/app/components/contexts/authContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "Admin" | "Company" | "Employee";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  department: string;
  location: string;
  bio: string;
  joinDate: string;
  role: Role;
  company: string;
  website: string;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function useT(role: Role) {
  const { isDark } = useTheme();

  // Each role gets its own accent palette
  const accents: Record<Role, { main: string; light: string; dark: string; glow: string }> = {
    Admin:    { main: "#f59e0b", light: "#fbbf24", dark: "#d97706", glow: "rgba(245,158,11,0.35)"   },
    Company:  { main: "#14b8a6", light: "#2dd4bf", dark: "#0d9488", glow: "rgba(20,184,166,0.35)"   },
    Employee: { main: "#6366f1", light: "#818cf8", dark: "#4f46e5", glow: "rgba(99,102,241,0.35)"   },
  };

  const acc = accents[role];
  return {
    isDark,
    bg:          isDark ? "#060c18"   : "#f0f4f8",
    surface:     isDark ? "linear-gradient(145deg,#0f1e35,#080f1e)" : "linear-gradient(145deg,#fff,#f8fafc)",
    surface2:    isDark ? "#0a1525"   : "#f8fafc",
    border:      isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    shadow:      isDark ? "0 4px 32px rgba(0,0,0,0.55)" : "0 2px 16px rgba(0,0,0,0.07)",
    text:        isDark ? "#f1f5f9"   : "#0f172a",
    textSub:     isDark ? "#94a3b8"   : "#475569",
    textMuted:   isDark ? "#475569"   : "#94a3b8",
    textUpper:   isDark ? "#2d3d55"   : "#94a3b8",
    divider:     isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    inputBg:     isDark ? "#060c18"   : "#f8fafc",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1",
    tagBg:       isDark ? "#0f1e35"   : "#f1f5f9",
    ...acc,
    // hero gradient uses role accent
    heroBg: isDark
      ? `linear-gradient(135deg, #060c18 0%, ${acc.dark}22 50%, #060c18 100%)`
      : `linear-gradient(135deg, #e0f2fe 0%, ${acc.main}15 50%, #f0f4f8 100%)`,
  };
}

// ─── GCard ─────────────────────────────────────────────────────────────────────
function GCard({ children, style, accent }: { children: React.ReactNode; style?: React.CSSProperties; accent?: string }) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);
  const surface = isDark ? "linear-gradient(145deg,#0f1e35,#080f1e)" : "linear-gradient(145deg,#fff,#f8fafc)";
  const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const shadow  = isDark ? "0 4px 32px rgba(0,0,0,0.55)" : "0 2px 16px rgba(0,0,0,0.07)";
  const shadowH = isDark ? "0 8px 40px rgba(0,0,0,0.7)" : "0 6px 24px rgba(0,0,0,0.1)";
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: surface, borderRadius: 16, border: `1px solid ${hov && accent ? accent + "35" : border}`, boxShadow: hov ? shadowH : shadow, overflow: "hidden", transition: "all 0.22s ease", ...style }}>
      {children}
    </div>
  );
}

// ─── Section Label ─────────────────────────────────────────────────────────────
function SLabel({ children, accent }: { children: React.ReactNode; accent: string }) {
  const { isDark } = useTheme();
  const textUpper = isDark ? "#2d3d55" : "#94a3b8";
  const divider   = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 16px" }}>
      <div style={{ width: 3, height: 13, borderRadius: 99, background: accent, boxShadow: `0 0 8px ${accent}` }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: textUpper, textTransform: "uppercase", letterSpacing: "0.12em" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${divider},transparent)` }} />
    </div>
  );
}

// ─── Editable Field ────────────────────────────────────────────────────────────
function EditField({
  label, value, onChange, type = "text", placeholder, accent,
  multiline = false, readOnly = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; accent: string;
  multiline?: boolean; readOnly?: boolean;
}) {
  const { isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  const inputBg     = isDark ? "#060c18" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1";
  const textColor   = isDark ? "#e2e8f0" : "#0f172a";
  const labelColor  = isDark ? "#475569" : "#94a3b8";

  const sharedStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    background: readOnly ? "transparent" : inputBg,
    border: `1px solid ${focused ? accent : inputBorder}`,
    color: readOnly ? (isDark ? "#94a3b8" : "#475569") : textColor,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxShadow: focused ? `0 0 0 3px ${accent}18` : "none",
    resize: "none" as const,
    cursor: readOnly ? "default" : "text",
  };

  return (
    <div>
      <label style={{ fontSize: 11, color: labelColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{label}</label>
      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3} readOnly={readOnly}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={sharedStyle}
        />
      ) : (
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} readOnly={readOnly}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={sharedStyle}
        />
      )}
    </div>
  );
}

// ─── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon, value, label, accent }: { icon: string; value: string; label: string; accent: string }) {
  const { isDark } = useTheme();
  const textMuted = isDark ? "#475569" : "#94a3b8";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 16px", borderRadius: 12, background: `${accent}10`, border: `1px solid ${accent}22` }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}

// ─── Activity Item ─────────────────────────────────────────────────────────────
function ActivityItem({ icon, title, sub, time, color, isLast }: { icon: string; title: string; sub: string; time: string; color: string; isLast: boolean }) {
  const { isDark } = useTheme();
  const divider  = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const textSub  = isDark ? "#94a3b8" : "#475569";
  const textMuted = isDark ? "#475569" : "#94a3b8";
  const text     = isDark ? "#f1f5f9" : "#0f172a";
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: isLast ? "none" : `1px solid ${divider}` }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{icon}</div>
        {!isLast && <div style={{ width: 1, flex: 1, background: divider, marginTop: 4 }} />}
      </div>
      <div style={{ paddingTop: 5 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: text }}>{title}</div>
        <div style={{ fontSize: 11, color: textSub, marginTop: 2 }}>{sub}</div>
        <div style={{ fontSize: 10, color: textMuted, marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>{time}</div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const role: Role = (user?.role as Role) ?? "Employee";
  const tk = useT(role);

  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "security" | "activity">("overview");

  const [profile, setProfile] = useState<ProfileData>({
    name:       user?.name ?? "Ravi Sharma",
    email:      user?.email ?? "ravi.sharma@acme.com",
    phone:      user?.phone ?? "+91 98765 43210",
    department: user?.department ?? "Engineering",
    location:   user?.location ?? "Mumbai, India",
    bio:        user?.bio ?? "Passionate frontend developer building scalable web applications. Love clean code and great UX.",
    joinDate:   user?.joinDate ?? "January 2024",
    role:       role,
    company:    user?.company ?? "Acme Corp",
    website:    user?.website ?? "https://worksphere.io",
  });

  const [draft, setDraft] = useState<ProfileData>({ ...profile });

  const initials = profile.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const roleColors: Record<Role, string> = { Admin: "#f59e0b", Company: "#14b8a6", Employee: "#6366f1" };
  const roleLabels: Record<Role, string> = { Admin: "Platform Admin", Company: "Company Manager", Employee: "Employee" };

  const handleSave = () => {
    setProfile({ ...draft });
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditMode(false);
  };

  const activities = role === "Admin" ? [
    { icon:"🏢", title:"Registered TechNova Solutions",    sub:"New company added to platform",        time:"Today, 11:02 AM", color:"#f59e0b" },
    { icon:"🔐", title:"Two-factor authentication enabled", sub:"Security setting updated",             time:"Yesterday, 3:45 PM", color:"#10b981" },
    { icon:"⚙️", title:"System maintenance scheduled",      sub:"Downtime window: Mar 16, 2–4 AM",     time:"Yesterday, 10:20 AM", color:"#3b82f6" },
    { icon:"💰", title:"Invoice generated for FinEdge",     sub:"₹22,000 — Pro plan renewal",           time:"Mar 12, 9:00 AM", color:"#10b981" },
    { icon:"🗑️", title:"Deleted EduSpark Academy",          sub:"Company removed on admin request",     time:"Mar 10, 2:15 PM", color:"#f43f5e" },
  ] : role === "Company" ? [
    { icon:"👤", title:"Added new employee: Karan Joshi",   sub:"Mobile Developer — Engineering dept", time:"Today, 10:30 AM", color:"#14b8a6" },
    { icon:"🎯", title:"Assigned task: UI Review",          sub:"Assigned to Divya Nair",              time:"Yesterday, 4:00 PM", color:"#6366f1" },
    { icon:"📢", title:"Posted company notice",             sub:"Q1 Performance Review reminder",      time:"Mar 12, 9:15 AM", color:"#f59e0b" },
    { icon:"✅", title:"Approved leave request",             sub:"Sneha Pillai — 2 days casual leave",  time:"Mar 11, 11:30 AM", color:"#10b981" },
    { icon:"📊", title:"Viewed attendance report",          sub:"Weekly summary — 91% attendance",     time:"Mar 10, 3:00 PM", color:"#3b82f6" },
  ] : [
    { icon:"✅", title:"Completed task",                    sub:"Fix login page redirect bug",         time:"Today, 11:02 AM", color:"#10b981" },
    { icon:"📝", title:"Submitted daily update",            sub:"Work summary for today sent",         time:"Today, 10:45 AM", color:"#6366f1" },
    { icon:"⚡", title:"Punched in",                        sub:"9:18 AM — On time",                  time:"Today, 9:18 AM",  color:"#14b8a6" },
    { icon:"📌", title:"New task assigned",                 sub:"UI review for employee dashboard v2", time:"Yesterday, 5:32 PM", color:"#f59e0b" },
    { icon:"🔴", title:"Punched out",                       sub:"6:10 PM — Total: 8h 52m",            time:"Yesterday, 6:10 PM", color:"#f43f5e" },
  ];

  const stats = role === "Admin"
    ? [{ icon:"🏢", value:"47",   label:"Companies" }, { icon:"👥", value:"4.8K", label:"Users" },    { icon:"💰", value:"₹285K", label:"Revenue" }, { icon:"⚡", value:"99.97%", label:"Uptime" }]
    : role === "Company"
    ? [{ icon:"👥", value:"148",  label:"Employees" }, { icon:"✅", value:"68%",  label:"Tasks Done" }, { icon:"📅", value:"91%",  label:"Attendance" }, { icon:"⭐", value:"4.2",   label:"Mood Score" }]
    : [{ icon:"⏱️", value:"34h",  label:"This Week" }, { icon:"✅", value:"8/12", label:"Tasks Done" }, { icon:"📅", value:"96%",  label:"Attendance" }, { icon:"🔥", value:"10",    label:"Day Streak" }];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .pp-root * { box-sizing: border-box; }
        .pp-root   { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes pp-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes pp-fade { from{opacity:0} to{opacity:1} }
        @keyframes pp-ring { 0%,100%{box-shadow:0 0 0 0 ${tk.glow}} 50%{box-shadow:0 0 0 8px transparent} }
        .pp-a1{animation:pp-up .5s ease both .05s} .pp-a2{animation:pp-up .5s ease both .10s}
        .pp-a3{animation:pp-up .5s ease both .15s} .pp-a4{animation:pp-up .5s ease both .20s}
        .pp-a5{animation:pp-up .5s ease both .25s} .pp-a6{animation:pp-up .5s ease both .30s}
        .pp-tab { transition: all 0.18s; cursor: pointer; }
        .pp-tab:hover { color: ${tk.main} !important; }
        .pp-btn { transition: all 0.18s; cursor: pointer; }
        .pp-btn:hover { opacity: 0.87; transform: translateY(-1px); }
        .pp-btn:active { transform: scale(0.97); }
        .pp-avatar-ring { animation: pp-ring 3s ease-in-out infinite; }
      `}</style>

      <div className="pp-root" style={{ background: tk.bg, minHeight: "100%", display: "flex", flexDirection: "column", transition: "background 0.3s" }}>

        {/* ── Hero Banner ── */}
        <div className="pp-a1" style={{
          position: "relative", overflow: "hidden",
          background: tk.heroBg,
          borderBottom: `1px solid ${tk.border}`,
          padding: "40px 32px 0",
        }}>
          {/* Mesh decoration */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 20% 50%, ${tk.main}10 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${tk.dark}15 0%, transparent 50%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${tk.main}50, transparent)` }} />

          {/* Dots pattern */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}>
            <defs>
              <pattern id="pp-dots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill={tk.main} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pp-dots)" />
          </svg>

          {/* Avatar + info row */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap", paddingBottom: 0 }}>

            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                className="pp-avatar-ring"
                style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${tk.main}, ${tk.dark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 800, color: "#fff",
                  border: `3px solid ${tk.main}`,
                  marginBottom: -20,
                  position: "relative",
                }}>
                {initials}
                {/* Online dot */}
                <div style={{ position: "absolute", bottom: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "#10b981", border: `2px solid ${tk.isDark ? "#060c18" : "#f0f4f8"}`, boxShadow: "0 0 8px #10b981" }} />
              </div>

              {/* Edit avatar button */}
              {editMode && (
                <button className="pp-btn" style={{
                  position: "absolute", bottom: -16, right: -4, width: 28, height: 28, borderRadius: "50%",
                  background: `linear-gradient(135deg,${tk.main},${tk.dark})`, border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer",
                  boxShadow: `0 0 12px ${tk.glow}`,
                }}>✏️</button>
              )}
            </div>

            {/* Name + role + company */}
            <div style={{ flex: 1, paddingBottom: 24, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: tk.text, letterSpacing: "-0.3px" }}>{profile.name}</div>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: `${tk.main}18`, color: tk.main, border: `1px solid ${tk.main}30` }}>
                  {roleLabels[role]}
                </span>
              </div>
              <div style={{ fontSize: 13, color: tk.textSub, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span>🏢 {profile.company}</span>
                <span>📍 {profile.location}</span>
                <span>📅 Since {profile.joinDate}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ paddingBottom: 24, display: "flex", gap: 10 }}>
              {editMode ? (
                <>
                  <button className="pp-btn" onClick={handleCancel}
                    style={{ padding: "8px 18px", borderRadius: 10, background: "transparent", border: `1px solid ${tk.border}`, color: tk.textSub, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                    Cancel
                  </button>
                  <button className="pp-btn" onClick={handleSave}
                    style={{ padding: "8px 20px", borderRadius: 10, background: `linear-gradient(135deg,${tk.main},${tk.dark})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", boxShadow: `0 0 16px ${tk.glow}` }}>
                    {saved ? "✓ Saved!" : "Save Changes"}
                  </button>
                </>
              ) : (
                <button className="pp-btn" onClick={() => setEditMode(true)}
                  style={{ padding: "8px 20px", borderRadius: 10, background: `${tk.main}14`, border: `1px solid ${tk.main}30`, color: tk.main, fontSize: 13, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 4, marginTop: 20 }}>
            {(["overview", "activity", "security"] as const).map(tab => (
              <button key={tab} className="pp-tab"
                onClick={() => setActiveTab(tab)}
                style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab ? tk.main : "transparent"}`, color: activeTab === tab ? tk.main : tk.textSub, marginBottom: -1, textTransform: "capitalize" }}>
                {tab === "overview" ? "👤 Overview" : tab === "activity" ? "⚡ Activity" : "🔐 Security"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <>
              {/* Stats row */}
              <div className="pp-a2" style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length},minmax(0,1fr))`, gap: 12 }}>
                {stats.map((s, i) => <StatChip key={i} {...s} accent={tk.main} />)}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>

                {/* Personal info card */}
                <div className="pp-a3" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <GCard accent={tk.main} style={{ padding: "20px 24px" }}>
                    <SLabel accent={tk.main}>Personal Information</SLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <EditField label="Full Name" value={draft.name} onChange={v => setDraft(p => ({ ...p, name: v }))} placeholder="Your full name" accent={tk.main} readOnly={!editMode} />
                      <EditField label="Email Address" value={draft.email} onChange={v => setDraft(p => ({ ...p, email: v }))} type="email" placeholder="your@email.com" accent={tk.main} readOnly={!editMode} />
                      <EditField label="Phone Number" value={draft.phone} onChange={v => setDraft(p => ({ ...p, phone: v }))} type="tel" placeholder="+91 98765 43210" accent={tk.main} readOnly={!editMode} />
                      <EditField label="Location" value={draft.location} onChange={v => setDraft(p => ({ ...p, location: v }))} placeholder="City, Country" accent={tk.main} readOnly={!editMode} />
                      <EditField label="Department" value={draft.department} onChange={v => setDraft(p => ({ ...p, department: v }))} placeholder="e.g. Engineering" accent={tk.main} readOnly={!editMode} />
                      <EditField label="Website" value={draft.website} onChange={v => setDraft(p => ({ ...p, website: v }))} type="url" placeholder="https://..." accent={tk.main} readOnly={!editMode} />
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <EditField label="Bio" value={draft.bio} onChange={v => setDraft(p => ({ ...p, bio: v }))} multiline placeholder="Tell us about yourself..." accent={tk.main} readOnly={!editMode} />
                    </div>
                  </GCard>
                </div>

                {/* Right column */}
                <div className="pp-a4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Role card */}
                  <GCard accent={tk.main} style={{ padding: "20px 24px" }}>
                    <SLabel accent={tk.main}>Role & Permissions</SLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                      {/* Role pill */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: `${tk.main}10`, border: `1px solid ${tk.main}22` }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${tk.main},${tk.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                          {role === "Admin" ? "👑" : role === "Company" ? "🏢" : "👤"}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: tk.main }}>{roleLabels[role]}</div>
                          <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 2 }}>{profile.company}</div>
                        </div>
                        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                      </div>

                      {/* Permissions list */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(role === "Admin"
                          ? ["Manage all companies", "View platform analytics", "System configuration", "Billing management", "User access control"]
                          : role === "Company"
                          ? ["Manage employees", "Assign tasks", "View reports", "Post notices", "Attendance oversight"]
                          : ["Submit daily updates", "View own tasks", "Punch in/out", "View own reports", "Request leave"]
                        ).map((perm, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: tk.textSub }}>
                            <span style={{ color: "#10b981", fontSize: 12 }}>✓</span> {perm}
                          </div>
                        ))}
                      </div>
                    </div>
                  </GCard>

                  {/* Quick info card */}
                  <GCard style={{ padding: "20px 24px" }}>
                    <SLabel accent={tk.main}>Account Details</SLabel>
                    {[
                      { label: "Member Since", value: profile.joinDate, icon: "📅" },
                      { label: "Account Status", value: "Active", icon: "🟢" },
                      { label: "Last Login", value: "Today, 9:15 AM", icon: "🔐" },
                      { label: "Sessions", value: "1 active device", icon: "💻" },
                    ].map((item, i, arr) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < arr.length - 1 ? `1px solid ${tk.divider}` : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14 }}>{item.icon}</span>
                          <span style={{ fontSize: 12, color: tk.textSub, fontWeight: 500 }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: 12, color: tk.text, fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </GCard>
                </div>
              </div>
            </>
          )}

          {/* ── Activity Tab ── */}
          {activeTab === "activity" && (
            <div className="pp-a3" style={{ display: "grid", gridTemplateColumns: "1fr 0.7fr", gap: 20 }}>
              <GCard accent={tk.main} style={{ padding: "20px 24px" }}>
                <SLabel accent={tk.main}>Recent Activity</SLabel>
                {activities.map((act, i) => (
                  <ActivityItem key={i} {...act} isLast={i === activities.length - 1} />
                ))}
              </GCard>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Weekly summary */}
                <GCard style={{ padding: "20px 24px" }}>
                  <SLabel accent={tk.main}>This Week</SLabel>
                  {(role === "Employee" ? [
                    { label:"Hours worked",   value:"34h 10m", pct:85, color:tk.main },
                    { label:"Tasks completed",value:"8 / 12",  pct:67, color:"#10b981" },
                    { label:"Attendance",     value:"5 / 5",   pct:100,color:"#6366f1" },
                    { label:"Updates submitted", value:"5",    pct:100,color:"#f59e0b" },
                  ] : role === "Company" ? [
                    { label:"Active employees", value:"112 / 148", pct:76, color:tk.main },
                    { label:"Tasks assigned",   value:"34",         pct:70, color:"#10b981" },
                    { label:"Tasks completed",  value:"28",         pct:82, color:"#6366f1" },
                    { label:"Notices posted",   value:"3",          pct:60, color:"#f59e0b" },
                  ] : [
                    { label:"Companies active", value:"44 / 47", pct:93, color:tk.main },
                    { label:"Revenue collected",value:"₹38.4K",  pct:80, color:"#10b981" },
                    { label:"Support resolved",  value:"12 / 15", pct:80, color:"#6366f1" },
                    { label:"API uptime",        value:"99.97%",  pct:100,color:"#f59e0b" },
                  ]).map((item, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                        <span style={{ color: tk.textSub, fontWeight: 500 }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
                      </div>
                      <div style={{ height: 4, background: tk.isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 99, boxShadow: `0 0 6px ${item.color}60`, transition: "width 1s cubic-bezier(.34,1.56,.64,1)" }} />
                      </div>
                    </div>
                  ))}
                </GCard>

                {/* Achievements */}
                <GCard style={{ padding: "20px 24px" }}>
                  <SLabel accent={tk.main}>Achievements</SLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(role === "Employee" ? [
                      { icon:"🔥", label:"10-day streak",     color:"#f59e0b" },
                      { icon:"⭐", label:"Top performer",      color:"#f59e0b" },
                      { icon:"✅", label:"100 tasks done",     color:"#10b981" },
                      { icon:"📅", label:"Perfect attendance", color:"#6366f1" },
                    ] : role === "Company" ? [
                      { icon:"🏆", label:"50+ employees",      color:"#f59e0b" },
                      { icon:"📈", label:"90%+ productivity",   color:"#10b981" },
                      { icon:"⭐", label:"4.5+ team rating",   color:"#6366f1" },
                      { icon:"🚀", label:"Enterprise plan",    color:tk.main   },
                    ] : [
                      { icon:"👑", label:"Platform admin",     color:"#f59e0b" },
                      { icon:"🏢", label:"40+ companies",      color:"#10b981" },
                      { icon:"💰", label:"₹250K+ revenue",     color:"#6366f1" },
                      { icon:"🔒", label:"Security badge",     color:"#f43f5e" },
                    ]).map((ach, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, background: `${ach.color}10`, border: `1px solid ${ach.color}20` }}>
                        <span style={{ fontSize: 18 }}>{ach.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: ach.color }}>{ach.label}</span>
                        <span style={{ marginLeft: "auto", fontSize: 12 }}>✓</span>
                      </div>
                    ))}
                  </div>
                </GCard>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === "security" && (
            <div className="pp-a3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Password change */}
              <GCard accent={tk.main} style={{ padding: "20px 24px" }}>
                <SLabel accent={tk.main}>Change Password</SLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <EditField label="Current Password" value="" onChange={() => {}} type="password" placeholder="Enter current password" accent={tk.main} />
                  <EditField label="New Password" value="" onChange={() => {}} type="password" placeholder="Minimum 8 characters" accent={tk.main} />
                  <EditField label="Confirm New Password" value="" onChange={() => {}} type="password" placeholder="Re-enter new password" accent={tk.main} />

                  {/* Password strength indicator */}
                  <div>
                    <div style={{ fontSize: 11, color: tk.textMuted, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Password Strength</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= 2 ? tk.main : (tk.isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0") }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: tk.main, marginTop: 4, fontWeight: 600 }}>Good</div>
                  </div>

                  <button className="pp-btn"
                    style={{ padding: "11px", borderRadius: 10, background: `linear-gradient(135deg,${tk.main},${tk.dark})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", boxShadow: `0 0 16px ${tk.glow}` }}>
                    Update Password
                  </button>
                </div>
              </GCard>

              {/* Security settings */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <GCard style={{ padding: "20px 24px" }}>
                  <SLabel accent={tk.main}>Security Settings</SLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label:"Two-Factor Authentication", sub:"Add extra security layer",      enabled: true  },
                      { label:"Login Notifications",       sub:"Email alert on new login",      enabled: true  },
                      { label:"Session Timeout",           sub:"Auto logout after 30 min idle", enabled: false },
                      { label:"API Access",                sub:"Enable API key access",         enabled: role === "Admin" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: item.enabled ? `${tk.main}08` : "transparent", border: `1px solid ${item.enabled ? tk.main + "20" : tk.border}`, transition: "all 0.2s" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: tk.text }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 2 }}>{item.sub}</div>
                        </div>
                        <div style={{ width: 44, height: 24, borderRadius: 99, background: item.enabled ? `linear-gradient(135deg,${tk.main},${tk.dark})` : (tk.isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"), position: "relative", cursor: "pointer", transition: "background 0.2s", boxShadow: item.enabled ? `0 0 10px ${tk.glow}` : "none", flexShrink: 0 }}>
                          <div style={{ position: "absolute", top: 3, left: item.enabled ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s cubic-bezier(.34,1.56,.64,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </GCard>

                {/* Active sessions */}
                <GCard style={{ padding: "20px 24px" }}>
                  <SLabel accent={tk.main}>Active Sessions</SLabel>
                  {[
                    { device:"Chrome — Windows 11", location:"Mumbai, India", time:"Current session", icon:"💻", active: true },
                    { device:"Safari — iPhone 14",   location:"Mumbai, India", time:"2 hours ago",     icon:"📱", active: false },
                  ].map((session, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i === 0 ? `1px solid ${tk.divider}` : "none" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: session.active ? `${tk.main}15` : (tk.isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"), border: `1px solid ${session.active ? tk.main + "25" : tk.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{session.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: tk.text }}>{session.device}</div>
                        <div style={{ fontSize: 11, color: tk.textMuted }}>{session.location} · {session.time}</div>
                      </div>
                      {session.active ? (
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#10b98115", color: "#10b981", fontWeight: 700, border: "1px solid #10b98130" }}>Current</span>
                      ) : (
                        <button className="pp-btn" style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, background: "#f43f5e10", border: "1px solid #f43f5e25", color: "#f43f5e", fontFamily: "inherit", fontWeight: 600 }}>Revoke</button>
                      )}
                    </div>
                  ))}
                </GCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}