"use client";

import { useTheme } from "@/app/components/contexts/themeContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createCompanyApi, deleteCompanyApi, fetchAuditLogsApi, fetchCompaniesApi, fetchPlanDistApi, fetchRevenueApi, fetchStatsApi, toggleSuspendApi } from "../services/allApi"; // ← adjust path to your api.ts

// ─── Types ────────────────────────────────────────────────────────────────────
interface Company {
  id: number;
  name: string;
  industry: string;
  phone: string;
  plan: "Starter" | "Pro" | "Enterprise";
  employees: number;
  status: "active" | "suspended" | "trial";
  revenue: number;
  joinDate: string;
  owner: string;
  email: string;
  avatar: string;
}

interface DashboardStats {
  totalCompanies: number;
  totalRevenue: number;
  totalUsers: number;
  activeSessions: number;
}

interface RevenuePoint { label: string; value: number; }
interface PlanDist     { label: string; v: number; color: string; }
interface SysMetric    { label: string; value: number; unit: string; color: string; warn: number; }
interface AuditLog     { id: number; action: string; target: string; time: string; type: "company" | "system" | "billing" | "security"; }

type CompanyFormData = {
  name: string; industry: string; owner: string; email: string;
  phone: string; plan: Company["plan"]; employees: string;
  password: string; confirmPassword: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function useT() {
  const { isDark } = useTheme();
  return {
    isDark,
    bg:          isDark ? "#05080f"     : "#f0f2f7",
    surface:     isDark ? "linear-gradient(145deg,#0d1220,#080e1a)" : "linear-gradient(145deg,#fff,#f8f9fc)",
    surface2:    isDark ? "linear-gradient(145deg,#101828,#0a1020)" : "linear-gradient(145deg,#f8f9fc,#fff)",
    border:      isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    borderHov:   isDark ? "rgba(245,158,11,0.4)"  : "rgba(217,119,6,0.4)",
    shadow:      isDark ? "0 4px 32px rgba(0,0,0,0.6)" : "0 2px 16px rgba(0,0,0,0.07)",
    shadowHov:   isDark ? "0 8px 40px rgba(0,0,0,0.75)" : "0 6px 24px rgba(0,0,0,0.1)",
    text:        isDark ? "#f1f5f9" : "#0f172a",
    textSub:     isDark ? "#94a3b8" : "#475569",
    textMuted:   isDark ? "#475569" : "#94a3b8",
    textUpper:   isDark ? "#2d3d55" : "#94a3b8",
    divider:     isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
    inputBg:     isDark ? "#05080f" : "#f8fafc",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1",
    tag:         isDark ? "#0d1220" : "#f1f5f9",
    barTrack:    isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0",
    modalBg:     isDark ? "#090e18" : "#ffffff",
    acc:     "#f59e0b", accLight: "#fbbf24", accDark: "#d97706",
    accGlow: "rgba(245,158,11,0.3)",
    sec: "#8b5cf6", secGlow: "rgba(139,92,246,0.3)",
    success: "#10b981", danger: "#f43f5e", info: "#3b82f6", warn: "#f59e0b",
  };
}

// ─── SVG Sparkline ────────────────────────────────────────────────────────────
function Spark({ data, color, h = 32, w = 80 }: { data: number[]; color: string; h?: number; w?: number }) {
  const mn = Math.min(...data), mx = Math.max(...data), range = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / range) * (h - 4) - 2}`);
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <path d={`M ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`} fill={color} opacity={0.1} />
      <path d={`M ${pts.join(" L ")}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, color, h = 80 }: { data: RevenuePoint[]; color: string; h?: number }) {
  const tk = useT();
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <svg viewBox={`0 0 ${data.length * 32} ${h + 20}`} style={{ width: "100%", overflow: "visible" }}>
      {data.map((d, i) => {
        const bh = (d.value / max) * h; const x = i * 32 + 6;
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={20} height={bh} rx={4} fill={color} opacity={0.8}
              style={{ filter: `drop-shadow(0 0 4px ${color}60)` }} />
            <text x={x + 10} y={h + 14} textAnchor="middle" fill={tk.textMuted} fontSize={9} fontFamily="inherit">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────────
type DonutSeg = { v: number; color: string; };
type DonutArc = { d: string; color: string; endPct: number; };

function Donut({ segs, size = 88 }: { segs: DonutSeg[]; size?: number }) {
  const total = segs.reduce((s, d) => s + d.v, 0) || 1;
  const r = (size - 12) / 2; const cx = size / 2; const cy = size / 2;
  const arcs = segs.reduce<DonutArc[]>((acc, seg) => {
    const prev = acc.length ? acc[acc.length - 1].endPct : 0;
    const pct = seg.v / total; const start = prev * 2 * Math.PI - Math.PI / 2;
    const endPct = prev + pct; const end = endPct * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start); const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);   const y2 = cy + r * Math.sin(end);
    acc.push({ d: `M${x1} ${y1} A${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${x2} ${y2}`, color: seg.color, endPct });
    return acc;
  }, []);
  return (
    <svg width={size} height={size}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={10} strokeLinecap="butt"
          style={{ filter: `drop-shadow(0 0 3px ${arc.color}60)` }} />
      ))}
    </svg>
  );
}

// ─── Ring ─────────────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 7) / 2; const circ = 2 * Math.PI * r; const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.34,1.56,.64,1)" }} />
    </svg>
  );
}

// ─── GCard ────────────────────────────────────────────────────────────────────
function GCard({ children, style, accent }: { children: React.ReactNode; style?: React.CSSProperties; accent?: string }) {
  const tk = useT(); const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: tk.surface, borderRadius: 16, border: `1px solid ${hov && accent ? accent + "30" : tk.border}`, boxShadow: hov ? tk.shadowHov : tk.shadow, overflow: "hidden", transition: "all 0.2s ease", ...style }}>
      {children}
    </div>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────────
function CH({ title, action, label }: { title: string; action?: () => void; label?: string }) {
  const tk = useT();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 14, borderRadius: 99, background: `linear-gradient(180deg,${tk.acc},${tk.sec})` }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: tk.text, letterSpacing: "0.01em" }}>{title}</span>
      </div>
      {action && <button onClick={action} style={{ fontSize: 11, color: tk.acc, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>{label ?? "View all ↗"}</button>}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SLabel({ children }: { children: React.ReactNode }) {
  const tk = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 14px" }}>
      <div style={{ width: 3, height: 13, borderRadius: 99, background: `linear-gradient(180deg,${tk.acc},${tk.sec})` }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: tk.textUpper, textTransform: "uppercase", letterSpacing: "0.12em" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${tk.divider},transparent)` }} />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Company["status"] }) {
  const m = {
    active:    { color: "#10b981", bg: "#10b98115", border: "#10b98130", label: "Active"    },
    suspended: { color: "#f43f5e", bg: "#f43f5e15", border: "#f43f5e30", label: "Suspended" },
    trial:     { color: "#f59e0b", bg: "#f59e0b15", border: "#f59e0b30", label: "Trial"     },
  };

  // Fallback for unexpected/missing status values from the API
  const s = m[status] ?? { color: "#64748b", bg: "#64748b15", border: "#64748b30", label: status ?? "Unknown" };

  return (
    <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
      {s.label}
    </span>
  );
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: Company["plan"] }) {
  const m = {
    Enterprise: { color: "#f59e0b", bg: "#f59e0b15", border: "#f59e0b30" },
    Pro:        { color: "#8b5cf6", bg: "#8b5cf615", border: "#8b5cf630" },
    Starter:    { color: "#64748b", bg: "#64748b15", border: "#64748b30" },
  };
  const s = m[plan] || m.Starter;
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>{plan}</span>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent, spark, ring, trend, trendUp }: {
  label: string; value: string; sub: string; icon: string; accent: string;
  spark?: number[]; ring?: number; trend?: string; trendUp?: boolean;
}) {
  const tk = useT(); const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: tk.surface, borderRadius: 16, padding: "18px 20px", border: `1px solid ${hov ? accent + "40" : tk.border}`, boxShadow: hov ? `0 8px 32px ${accent}20` : tk.shadow, position: "relative", overflow: "hidden", transition: "all 0.22s ease", transform: hov ? "translateY(-2px)" : "none" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: hov ? 0.1 : 0.06, filter: "blur(24px)", transition: "opacity 0.25s" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: tk.textUpper, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</div>
        {ring !== undefined ? (
          <div style={{ position: "relative", width: 44, height: 44 }}>
            <Ring pct={ring} color={accent} size={44} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: accent }}>{ring}%</div>
          </div>
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accent + "18", border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: tk.text, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 4 }}>{sub}</div>
      {trend && <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: trendUp ? "#10b981" : "#f43f5e" }}>{trendUp ? "↑" : "↓"} {trend}</span></div>}
      {spark && <div style={{ marginTop: 10 }}><Spark data={spark} color={accent} /></div>}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const tk = useT();
  return (
    <div>
      <label style={{ fontSize: 11, color: tk.textUpper, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ onClose, title, children, accent }: { onClose: () => void; title: string; children: React.ReactNode; accent?: string }) {
  const tk = useT();
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "ad-fade .15s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: tk.modalBg, borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 540, border: `1px solid ${accent ? accent + "28" : tk.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: tk.text }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: tk.border, border: "none", cursor: "pointer", fontSize: 16, color: tk.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function iStyle(tk: ReturnType<typeof useT>): React.CSSProperties {
  return { width: "100%", padding: "10px 14px", borderRadius: 10, background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.text, fontSize: 13, fontFamily: "inherit", outline: "none" };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ color = "#f59e0b" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${color}30`, borderTop: `3px solid ${color}`, borderRadius: "50%", animation: "ad-spin 0.8s linear infinite" }} />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 999, padding: "12px 20px", borderRadius: 12, background: ok ? "#10b981" : "#f43f5e", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: `0 8px 32px ${ok ? "#10b981" : "#f43f5e"}60`, animation: "ad-up 0.25s ease" }}>
      {ok ? "✓" : "✗"} {msg}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const tk = useT();

  // ── Data state ──
  const [companies,     setCompanies]     = useState<Company[]>([]);
  const [stats,         setStats]         = useState<DashboardStats | null>(null);
  const [revenueData,   setRevenueData]   = useState<RevenuePoint[]>([]);
  const [planDist,      setPlanDist]      = useState<PlanDist[]>([]);
  const [auditLogs,     setAuditLogs]     = useState<AuditLog[]>([]);

  // ── Loading state ──
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingStats,     setLoadingStats]     = useState(true);
  const [loadingRevenue,   setLoadingRevenue]   = useState(true);
  const [loadingPlan,      setLoadingPlan]      = useState(true);
  const [loadingLogs,      setLoadingLogs]      = useState(true);

  // ── UI state ──
  const [activeTab,       setActiveTab]       = useState<"companies" | "system" | "logs">("companies");
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showSuspendId,   setShowSuspendId]   = useState<number | null>(null);
  const [showDeleteId,    setShowDeleteId]    = useState<number | null>(null);
  const [companySearch,   setCompanySearch]   = useState("");
  const [planFilter,      setPlanFilter]      = useState<"All" | Company["plan"]>("All");
  const [formError,       setFormError]       = useState("");
  const [submitting,      setSubmitting]      = useState(false);
  const [toast,           setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState<CompanyFormData>({
    name: "", industry: "", owner: "", email: "", phone: "",
    plan: "Starter", employees: "", password: "", confirmPassword: "",
  });

  const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Retail", "Education", "Manufacturing", "Media", "Logistics", "Real Estate", "Other"];

  // ── Toast helper ──
  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch all data on mount ──
  const loadCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    const res = await fetchCompaniesApi();
    if (!res.error && res.data?.data) {
      // Compute avatar from name if missing
      const mapped = res.data.data.map((c: Company) => ({
        ...c,
        avatar: c.avatar || c.name.trim().split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase(),
        joinDate: c.joinDate || "—",
        revenue: Number(c.revenue) || 0,
        employees: Number(c.employees) || 0,
      }));
      setCompanies(mapped);
    }
    setLoadingCompanies(false);
  }, []);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    const res = await fetchStatsApi();
    if (!res.error && res.data?.data) setStats(res.data.data);
    setLoadingStats(false);
  }, []);

  const loadRevenue = useCallback(async () => {
    setLoadingRevenue(true);
    const res = await fetchRevenueApi();
    if (!res.error && res.data?.data) setRevenueData(res.data.data);
    setLoadingRevenue(false);
  }, []);

  const loadPlanDist = useCallback(async () => {
    setLoadingPlan(true);
    const res = await fetchPlanDistApi();
    if (!res.error && res.data?.data) setPlanDist(res.data.data);
    setLoadingPlan(false);
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setLoadingLogs(true);
    const res = await fetchAuditLogsApi();
    if (!res.error && res.data?.data) setAuditLogs(res.data.data);
    setLoadingLogs(false);
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        loadCompanies(),
        loadStats(),
        loadRevenue(),
        loadPlanDist()
      ]);
    };
    loadInitialData();
  }, [loadCompanies, loadStats, loadRevenue, loadPlanDist]);

  // Load audit logs only when tab is opened
  useEffect(() => {
  const fetchData = async () => {
    if (activeTab === "logs" && auditLogs.length === 0) {
      loadAuditLogs();
    }
  }
    fetchData()
  }, [activeTab, loadAuditLogs]);

  // ── Animated KPI values ──
  const kpiCompanies = useCountUp(stats?.totalCompanies ?? 0);
  const kpiRevenue   = useCountUp(stats?.totalRevenue   ?? 0);
  const kpiUsers     = useCountUp(stats?.totalUsers     ?? 0);
  const kpiSessions  = useCountUp(stats?.activeSessions ?? 0);

  // ── Filtered companies ──
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const q = companySearch.toLowerCase();
      const matchSearch = c.name.toLowerCase().includes(q) || c.owner?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q);
      const matchPlan   = planFilter === "All" || c.plan === planFilter;
      return matchSearch && matchPlan;
    });
  }, [companies, companySearch, planFilter]);

  // ── Add Company ──
  const handleAddCompany = async () => {
  if (!formData.name.trim() || !formData.owner.trim() || !formData.email.trim()) {
    setFormError("Company name, owner name, and email are required."); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    setFormError("Please enter a valid email address."); return;
  }
  if (!formData.password || formData.password.length < 8) {
    setFormError("Password must be at least 8 characters."); return;
  }
  if (formData.password !== formData.confirmPassword) {
    setFormError("Passwords do not match."); return;
  }

  setFormError("");
  setSubmitting(true);

  const { confirmPassword, ...payload } = formData;

  const res = await createCompanyApi(payload);

  if (!res.error && (res.data?.data || res.data?.status === true)) {
    // Support both { data: { data: {...} } } and { data: {...} } response shapes
    const c = res.data?.data?.id ? res.data.data : res.data;

    const newCompany: Company = {
      id:         c.id,
      name:       c.name       || formData.name,
      email:      c.email      || formData.email,
      phone:      c.phone      || formData.phone,
      industry:   c.industry   || formData.industry,
      owner:      c.owner      || c.owner_name || formData.owner,  // handles both field names
      plan:       c.plan       || formData.plan,
      employees:  Number(c.employees)  || Number(formData.employees) || 0,
      status:     c.status     || "trial",
      revenue:    Number(c.revenue)    || 0,
      joinDate:   c.joinDate   || c.join_date
                    ? new Date(c.joinDate || c.join_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      avatar:     c.name
                    ? c.name.trim().split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                    : formData.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(),
    };

    setCompanies(prev => [...prev, newCompany]);
    setFormData({
      name: "", industry: "", owner: "", email: "", phone: "",
      plan: "Starter", employees: "", password: "", confirmPassword: "",
    });
    setShowAddModal(false);
    setActiveTab("companies");
    showToast("Company registered successfully!", true);

    // Refresh stats and plan distribution
    loadStats();
    loadPlanDist();

  } else {
    // Show backend error message if available
    const errMsg = res.data?.message || "Failed to create company. Please try again.";
    setFormError(errMsg);
  }

  setSubmitting(false);
};

  // ── Toggle Suspend ──
  const handleToggleSuspend = async (id: number) => {
    const res = await toggleSuspendApi(id);
    if (!res.error && res.data?.data) {
      const { status } = res.data.data;
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      showToast(`Company ${status === "suspended" ? "suspended" : "restored"} successfully`, true);
    } else {
      showToast(res.data?.message || "Action failed", false);
    }
    setShowSuspendId(null);
  };

  // ── Delete Company ──
  const handleDeleteCompany = async (id: number) => {
    const res = await deleteCompanyApi(id);
    if (!res.error) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      showToast("Company deleted permanently", true);
      loadStats();
      loadPlanDist();
    } else {
      showToast(res.data?.message || "Delete failed", false);
    }
    setShowDeleteId(null);
  };

  // ── Static system metrics (replace with real API if available) ──
  const sysMetrics: SysMetric[] = [
    { label: "CPU Usage",      value: 42,  unit: "%",    color: "#f59e0b", warn: 80  },
    { label: "Memory",         value: 61,  unit: "%",    color: "#8b5cf6", warn: 85  },
    { label: "Disk I/O",       value: 28,  unit: "%",    color: "#3b82f6", warn: 90  },
    { label: "Network Out",    value: 74,  unit: "MB/s", color: "#10b981", warn: 95  },
    { label: "DB Connections", value: 38,  unit: "/100", color: "#f43f5e", warn: 80  },
    { label: "API Latency",    value: 124, unit: "ms",   color: "#f59e0b", warn: 500 },
  ];

  const activityColors = { company: "#f59e0b", system: "#3b82f6", billing: "#10b981", security: "#f43f5e" };
  const activityIcons  = { company: "🏢",       system: "⚙️",       billing: "💰",       security: "🔐"     };

  const is = iStyle(tk);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .ad-root * { box-sizing: border-box; }
        .ad-root { font-family: 'Outfit', sans-serif; }
        @keyframes ad-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes ad-fade { from{opacity:0} to{opacity:1} }
        @keyframes ad-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .ad-a1{animation:ad-up .45s ease both .05s} .ad-a2{animation:ad-up .45s ease both .10s}
        .ad-a3{animation:ad-up .45s ease both .15s} .ad-a4{animation:ad-up .45s ease both .20s}
        .ad-a5{animation:ad-up .45s ease both .25s} .ad-a6{animation:ad-up .45s ease both .30s}
        .ad-a7{animation:ad-up .45s ease both .35s} .ad-a8{animation:ad-up .45s ease both .40s}
        .ad-row:hover { background: rgba(245,158,11,0.03) !important; }
        .ad-row { transition: background 0.15s; }
        .ad-tab { transition: all 0.18s; }
        .ad-tab:hover { color: #f59e0b !important; }
        .ad-btn { transition: all 0.18s; cursor: pointer; }
        .ad-btn:hover { opacity: 0.87; transform: translateY(-1px); }
        .ad-btn:active { transform: scale(0.97); }
        .ad-inp:focus { outline:none; border-color:#f59e0b !important; box-shadow:0 0 0 3px rgba(245,158,11,0.15) !important; }
        .ad-sys-bar { transition: width 1s cubic-bezier(.34,1.56,.64,1); }
        .ad-search { transition: border-color 0.18s, box-shadow 0.18s; }
        .ad-search:focus { outline:none; border-color:#f59e0b !important; box-shadow:0 0 0 2px rgba(245,158,11,0.15) !important; }
      `}</style>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div className="ad-root" style={{ background: tk.bg, minHeight: "100%", padding: "24px 24px 36px", display: "flex", flexDirection: "column", gap: 22, transition: "background 0.3s" }}>

        {/* ── Header ── */}
        <div className="ad-a1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 10px #f59e0b", animation: "ad-spin 3s linear infinite" }} />
              <div style={{ fontSize: 22, fontWeight: 800, color: tk.text, letterSpacing: "-0.3px" }}>
                Admin <span style={{ color: tk.acc }}>Command Center</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: tk.textMuted, marginTop: 4 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · WorkSphere Platform
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="ad-btn" onClick={() => setShowAddModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, background: `linear-gradient(135deg,${tk.acc},${tk.accDark})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", boxShadow: `0 0 20px ${tk.acc}40` }}>
              🏢 Add Company
            </button>
            <button className="ad-btn"
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, background: `rgba(139,92,246,0.12)`, border: `1px solid rgba(139,92,246,0.3)`, color: "#a78bfa", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
              ⚙️ System Settings
            </button>
          </div>
        </div>

        {/* ── KPI row ── */}
        <div className="ad-a2" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
          <KpiCard label="Total Companies" value={loadingStats ? "—" : `${kpiCompanies}`}                    sub="Registered on platform"   icon="🏢" accent="#f59e0b" spark={[32,35,38,39,41,42,44,47]}       trend="↑ 3 this month" trendUp />
          <KpiCard label="Monthly Revenue" value={loadingStats ? "—" : `₹${(kpiRevenue/1000).toFixed(0)}K`} sub="Across all subscriptions" icon="💰" accent="#10b981" spark={[210,230,218,245,228,261,274,285]} trend="↑ 7.4% MoM"    trendUp />
          <KpiCard label="Total Users"     value={loadingStats ? "—" : `${kpiUsers.toLocaleString()}`}       sub="Employees on platform"    icon="👥" accent="#8b5cf6" ring={stats ? Math.round(stats.totalUsers / 6000 * 100) : 0} trend="↑ 124 this week" trendUp />
          <KpiCard label="Live Sessions"   value={loadingStats ? "—" : `${kpiSessions}`}                     sub="Right now"                icon="⚡" accent="#3b82f6" spark={[280,295,310,298,320,308,315,312]} trend="↑ 18 vs 1h ago" trendUp />
        </div>

        {/* ── Platform health strip ── */}
        <div className="ad-a3">
          <SLabel>Platform Health</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 10 }}>
            {[
              { label: "Uptime",         value: "99.97%", color: "#10b981", icon: "🟢", delta: "30d avg",  up: true  },
              { label: "API Calls/day",  value: "2.4M",   color: "#3b82f6", icon: "📡", delta: "+12%",     up: true  },
              { label: "Avg Response",   value: "148ms",  color: "#f59e0b", icon: "⚡", delta: "-22ms",    up: true  },
              { label: "Error Rate",     value: "0.12%",  color: "#10b981", icon: "✅", delta: "-0.03%",   up: true  },
              { label: "Storage Used",   value: "1.8 TB", color: "#8b5cf6", icon: "💾", delta: "of 5TB",   up: true  },
              { label: "Support Tickets",value: "7",      color: "#f43f5e", icon: "🎫", delta: "+2 today", up: false },
            ].map((item, i) => (
              <div key={i} style={{ background: tk.surface, borderRadius: 12, padding: "12px 14px", border: `1px solid ${tk.border}`, boxShadow: tk.shadow, animation: `ad-up .4s ease both ${.05 * i}s`, transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${item.color}15`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = tk.shadow; }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: tk.textUpper, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{item.label}</span>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 10, color: item.up ? "#10b981" : "#f43f5e", fontWeight: 700, marginTop: 5 }}>
                  {item.up ? "↑" : "↓"} {item.delta}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Charts row ── */}
        <div className="ad-a4" style={{ 
  display: "grid", 
  gridTemplateColumns: "1fr 0.55fr 0.45fr", 
  gap: 14,
  alignItems: "start"  // ← add this
}}>

          {/* Revenue chart */}
          {/* Revenue chart */}
<GCard accent={tk.acc} style={{ padding: "18px 20px" }}>
  <CH title="💰 Monthly Revenue (₹)" />
  {loadingRevenue ? <Spinner /> : revenueData.length > 0 
    ? (
      <div style={{ height: 110, overflow: "hidden" }}>  {/* ← wrap with fixed height */}
        <BarChart data={revenueData} color={tk.acc} h={90} />
      </div>
    ) 
    : <div style={{ fontSize: 12, color: tk.textMuted, textAlign: "center", padding: "32px 0" }}>No revenue data yet</div>
  }
</GCard>

          {/* Plan distribution donut */}
          <GCard accent={tk.sec} style={{ padding: "18px 20px" }}>
            <CH title="📊 Plan Distribution" />
            {loadingPlan ? <Spinner color={tk.sec} /> : (
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ position: "relative" }}>
                  <Donut segs={planDist} size={100} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: tk.acc }}>{planDist.reduce((s, p) => s + p.v, 0)}</div>
                    <div style={{ fontSize: 9, color: tk.textMuted, fontWeight: 600 }}>TOTAL</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {planDist.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      <span style={{ fontSize: 11, color: tk.textSub, fontWeight: 600 }}>{s.label}</span>
                      <span style={{ fontSize: 11, color: s.color, fontWeight: 800, marginLeft: 4 }}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GCard>

          {/* Geo Reach */}
          <GCard style={{ padding: "18px 20px" }}>
            <CH title="🌍 Geo Reach" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { region: "India",          pct: 62, color: "#f59e0b" },
                { region: "Southeast Asia", pct: 18, color: "#8b5cf6" },
                { region: "Middle East",    pct: 12, color: "#3b82f6" },
                { region: "Others",         pct: 8,  color: "#64748b" },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: tk.textSub, fontWeight: 500 }}>{r.region}</span>
                    <span style={{ color: r.color, fontWeight: 700 }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: tk.barTrack, borderRadius: 99, overflow: "hidden" }}>
                    <div className="ad-sys-bar" style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </GCard>
        </div>

        {/* ── Tabs ── */}
        <div className="ad-a5">
          <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${tk.divider}` }}>
            {(["companies", "system", "logs"] as const).map(tab => (
              <button key={tab} className="ad-tab" onClick={() => setActiveTab(tab)}
                style={{ padding: "8px 18px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: "none", border: "none", cursor: "pointer", borderBottom: `2px solid ${activeTab === tab ? tk.acc : "transparent"}`, color: activeTab === tab ? tk.acc : tk.textSub, marginBottom: -1 }}>
                {tab === "companies" ? "🏢 Companies" : tab === "system" ? "⚙️ System Monitor" : "📋 Audit Logs"}
              </button>
            ))}
          </div>

          {/* ── Companies Tab ── */}
          {activeTab === "companies" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <input className="ad-search" value={companySearch} onChange={e => setCompanySearch(e.target.value)}
                  placeholder="🔍  Search companies, owners, industries..."
                  style={{ flex: 1, minWidth: 240, padding: "9px 14px", borderRadius: 10, background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.text, fontSize: 13, fontFamily: "inherit" }} />
                <div style={{ display: "flex", gap: 6 }}>
                  {(["All", "Enterprise", "Pro", "Starter"] as const).map(p => (
                    <button key={p} onClick={() => setPlanFilter(p)}
                      style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s", border: "1px solid",
                        background:   planFilter === p ? (p === "Enterprise" ? "#f59e0b18" : p === "Pro" ? "#8b5cf618" : p === "Starter" ? "#64748b18" : `${tk.acc}18`) : "transparent",
                        color:        planFilter === p ? (p === "Enterprise" ? "#f59e0b"   : p === "Pro" ? "#a78bfa"   : p === "Starter" ? "#94a3b8"   : tk.acc)       : tk.textSub,
                        borderColor:  planFilter === p ? (p === "Enterprise" ? "#f59e0b40" : p === "Pro" ? "#8b5cf640" : p === "Starter" ? "#64748b40" : `${tk.acc}40`) : tk.border,
                      }}>{p}</button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: tk.textMuted, display: "flex", alignItems: "center", gap: 4, padding: "0 4px" }}>
                  <span style={{ color: tk.acc, fontWeight: 700 }}>{filteredCompanies.length}</span> of {companies.length}
                </div>
              </div>

              <GCard>
                {loadingCompanies ? <Spinner /> : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${tk.divider}` }}>
                          {["Company", "Industry", "Owner", "Plan", "Employees", "Revenue", "Status", "Joined", "Actions"].map(h => (
                            <th key={h} style={{ padding: "11px 16px", fontSize: 10, fontWeight: 700, color: tk.textUpper, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h === "Actions" ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompanies.map((co, i) => (
                          <tr key={co.id} className="ad-row" style={{ borderBottom: `1px solid ${tk.divider}`, animation: `ad-up .35s ease both ${.04 * i}s` }}>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${tk.acc},${tk.sec})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{co.avatar}</div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{co.name}</div>
                                  <div style={{ fontSize: 11, color: tk.textMuted }}>{co.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: tk.tag, border: `1px solid ${tk.border}`, color: tk.textSub, fontWeight: 500 }}>{co.industry}</span>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: tk.textSub, fontWeight: 500 }}>{co.owner}</td>
                            <td style={{ padding: "12px 16px" }}><PlanBadge plan={co.plan} /></td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: tk.textSub, fontWeight: 600, textAlign: "center" }}>{co.employees.toLocaleString()}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: co.status === "suspended" ? tk.textMuted : "#10b981" }}>
                                {co.revenue > 0 ? `₹${(co.revenue / 1000).toFixed(0)}K` : "—"}
                              </div>
                            </td>
                            <td style={{ padding: "12px 16px" }}><StatusBadge status={co.status} /></td>
                            <td style={{ padding: "12px 16px", fontSize: 11, color: tk.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{co.joinDate}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                                <button onClick={() => setShowSuspendId(co.id)}
                                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, border: `1px solid ${co.status === "suspended" ? "#10b98130" : "#f59e0b30"}`, background: co.status === "suspended" ? "#10b98108" : "#f59e0b08", color: co.status === "suspended" ? "#10b981" : "#f59e0b", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s" }}>
                                  {co.status === "suspended" ? "Restore" : "Suspend"}
                                </button>
                                <button onClick={() => setShowDeleteId(co.id)}
                                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, border: "1px solid #f43f5e30", background: "#f43f5e08", color: "#f43f5e", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s" }}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredCompanies.length === 0 && (
                      <div style={{ padding: "48px 20px", textAlign: "center", color: tk.textMuted, fontSize: 13 }}>
                        {companySearch ? "No companies match your search." : "No companies registered yet."}
                      </div>
                    )}
                  </div>
                )}
              </GCard>
            </div>
          )}

          {/* ── System Monitor Tab ── */}
          {activeTab === "system" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {sysMetrics.map((m, i) => {
                const isWarn = m.value >= m.warn * 0.9;
                return (
                  <GCard key={i} accent={m.color} style={{ padding: "18px 20px", animation: `ad-up .4s ease both ${.05 * i}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: tk.textUpper, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 6 }}>{m.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: isWarn ? "#f43f5e" : m.color, letterSpacing: "-0.5px" }}>
                          {m.value}<span style={{ fontSize: 13, color: tk.textMuted, fontWeight: 500, marginLeft: 3 }}>{m.unit}</span>
                        </div>
                      </div>
                      <div style={{ position: "relative", width: 52, height: 52 }}>
                        <Ring pct={Math.min(100, Math.round((m.value / m.warn) * 100))} color={isWarn ? "#f43f5e" : m.color} size={52} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: isWarn ? "#f43f5e" : m.color }}>
                          {Math.min(100, Math.round((m.value / m.warn) * 100))}%
                        </div>
                      </div>
                    </div>
                    <div style={{ height: 5, background: tk.barTrack, borderRadius: 99, overflow: "hidden" }}>
                      <div className="ad-sys-bar" style={{ height: "100%", width: `${Math.min(100, Math.round((m.value / m.warn) * 100))}%`, background: isWarn ? "#f43f5e" : m.color, borderRadius: 99, boxShadow: `0 0 6px ${isWarn ? "#f43f5e" : m.color}60` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: tk.textMuted, marginTop: 5 }}>
                      <span>0{m.unit}</span>
                      <span style={{ color: isWarn ? "#f43f5e" : tk.textMuted }}>Threshold: {m.warn}{m.unit}</span>
                    </div>
                  </GCard>
                );
              })}
            </div>
          )}

          {/* ── Audit Logs Tab ── */}
          {activeTab === "logs" && (
            <GCard style={{ padding: "18px 20px" }}>
              <CH title="📋 Audit Log — All System Events" />
              {loadingLogs ? <Spinner /> : auditLogs.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: tk.textMuted, fontSize: 13 }}>No audit logs found.</div>
              ) : (
                <div>
                  {auditLogs.map((act, i) => (
                    <div key={act.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < auditLogs.length - 1 ? `1px solid ${tk.divider}` : "none", animation: `ad-up .35s ease both ${.04 * i}s` }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${activityColors[act.type]}15`, border: `1px solid ${activityColors[act.type]}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                          {activityIcons[act.type]}
                        </div>
                        {i < auditLogs.length - 1 && <div style={{ width: 1, flex: 1, background: tk.divider, marginTop: 4 }} />}
                      </div>
                      <div style={{ paddingTop: 4, flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: tk.text }}>{act.action}</div>
                            <div style={{ fontSize: 11, color: activityColors[act.type], fontWeight: 600, marginTop: 2 }}>{act.target}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${activityColors[act.type]}15`, color: activityColors[act.type], fontWeight: 700, textTransform: "capitalize" }}>{act.type}</span>
                            <span style={{ fontSize: 10, color: tk.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{act.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GCard>
          )}
        </div>

        {/* ── Bottom row ── */}
        <div className="ad-a7" style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr", gap: 14 }}>

          {/* Live activity — shows last 8 audit logs */}
          <GCard accent={tk.acc} style={{ padding: "18px 20px" }}>
            <CH title="⚡ Live Admin Activity" action={loadAuditLogs} label="Refresh ↺" />
            {loadingLogs ? <Spinner /> : auditLogs.slice(0, 8).map((act, i, arr) => (
              <div key={act.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${tk.divider}` : "none", animation: `ad-up .4s ease both ${.04 * i}s` }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${activityColors[act.type]}15`, border: `1px solid ${activityColors[act.type]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{activityIcons[act.type]}</div>
                  {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: tk.divider, marginTop: 3 }} />}
                </div>
                <div style={{ paddingTop: 3 }}>
                  <div style={{ fontSize: 12, color: tk.text }}><span style={{ fontWeight: 700, color: activityColors[act.type] }}>{act.action}</span> — <span style={{ color: tk.textSub }}>{act.target}</span></div>
                  <div style={{ fontSize: 10, color: tk.textMuted, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{act.time}</div>
                </div>
              </div>
            ))}
          </GCard>

          {/* Top revenue companies */}
          <GCard style={{ padding: "18px 20px" }}>
            <CH title="🏆 Top Revenue Companies" />
            {loadingCompanies ? <Spinner /> : (
              [...companies].sort((a, b) => b.revenue - a.revenue).slice(0, 6).map((co, i) => {
                const maxRev = companies.reduce((m, c) => Math.max(m, c.revenue), 0);
                return (
                  <div key={co.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 5 ? `1px solid ${tk.divider}` : "none", animation: `ad-up .35s ease both ${.05 * i}s` }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${tk.acc},${tk.sec})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{co.avatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: tk.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{co.name}</div>
                      <div style={{ height: 3, background: tk.barTrack, borderRadius: 99, overflow: "hidden", marginTop: 4 }}>
                        <div style={{ height: "100%", width: `${maxRev ? (co.revenue / maxRev) * 100 : 0}%`, background: `linear-gradient(90deg,${tk.acc},${tk.sec})`, borderRadius: 99 }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: tk.acc, flexShrink: 0 }}>₹{(co.revenue / 1000).toFixed(0)}K</div>
                  </div>
                );
              })
            )}
          </GCard>
        </div>
      </div>

      {/* ══ Add Company Modal ══════════════════════════════════════ */}
      {showAddModal && (
        <Modal onClose={() => { setShowAddModal(false); setFormError(""); }} title="🏢 Register New Company" accent={tk.acc}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Company Name *">
                <input className="ad-inp" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. TechNova Solutions" style={is} />
              </Field>
              <Field label="Industry">
                <select className="ad-inp" value={formData.industry} onChange={e => setFormData(p => ({ ...p, industry: e.target.value }))} style={{ ...is, cursor: "pointer" }}>
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Owner / Admin Name *">
                <input className="ad-inp" value={formData.owner} onChange={e => setFormData(p => ({ ...p, owner: e.target.value }))} placeholder="Full name" style={is} />
              </Field>
              <Field label="Admin Email *">
                <input className="ad-inp" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="admin@company.com" style={is} />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Phone (optional)">
                <input className="ad-inp" type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" style={is} />
              </Field>
              <Field label="Initial Employee Count">
                <input className="ad-inp" type="number" value={formData.employees} onChange={e => setFormData(p => ({ ...p, employees: e.target.value }))} placeholder="e.g. 50" style={is} />
              </Field>
            </div>

            {/* Password Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Password *">
                <div style={{ position: "relative" }}>
                  <input className="ad-inp" type={showPassword ? "text" : "password"} value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 8 characters" style={{ ...is, paddingRight: 40 }} />
                  <button onClick={() => setShowPassword(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: tk.textMuted, fontSize: 15, padding: 0, lineHeight: 1 }}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {formData.password && (() => {
                  const p = formData.password;
                  const strength = [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
                  const labels = ["", "Weak", "Fair", "Good", "Strong"];
                  const colors = ["", "#f43f5e", "#f59e0b", "#3b82f6", "#10b981"];
                  return (
                    <div style={{ marginTop: 7 }}>
                      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? colors[strength] : tk.barTrack, transition: "background 0.3s" }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: colors[strength] }}>{labels[strength]}</div>
                    </div>
                  );
                })()}
              </Field>

              <Field label="Confirm Password *">
                <div style={{ position: "relative" }}>
                  <input className="ad-inp" type={showConfirmPass ? "text" : "password"} value={formData.confirmPassword}
                    onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    style={{ ...is, paddingRight: 40, borderColor: formData.confirmPassword ? (formData.password === formData.confirmPassword ? "#10b98160" : "#f43f5e60") : undefined }} />
                  <button onClick={() => setShowConfirmPass(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: tk.textMuted, fontSize: 15, padding: 0, lineHeight: 1 }}>
                    {showConfirmPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 7, color: formData.password === formData.confirmPassword ? "#10b981" : "#f43f5e" }}>
                    {formData.password === formData.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </div>
                )}
              </Field>
            </div>

            <Field label="Subscription Plan">
              <div style={{ display: "flex", gap: 8 }}>
                {(["Starter", "Pro", "Enterprise"] as Company["plan"][]).map(p => {
                  const pcolors: Record<string, string> = { Starter: "#64748b", Pro: "#8b5cf6", Enterprise: "#f59e0b" };
                  const pc = pcolors[p];
                  return (
                    <button key={p} onClick={() => setFormData(prev => ({ ...prev, plan: p }))}
                      style={{ flex: 1, padding: "10px 8px", borderRadius: 9, border: `1px solid ${formData.plan === p ? pc + "60" : tk.border}`, background: formData.plan === p ? pc + "15" : "transparent", color: formData.plan === p ? pc : tk.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Preview */}
            {formData.name.trim() && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: `rgba(245,158,11,0.06)`, border: `1px solid rgba(245,158,11,0.15)`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${tk.acc},${tk.sec})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {formData.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{formData.name}</div>
                  <div style={{ fontSize: 11, color: tk.textMuted }}>{[formData.industry, formData.owner].filter(Boolean).join(" · ") || "Industry / Owner"}</div>
                </div>
                <PlanBadge plan={formData.plan} />
              </div>
            )}

            {formError && (
              <div style={{ fontSize: 12, color: "#f43f5e", padding: "8px 12px", borderRadius: 8, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => { setShowAddModal(false); setFormError(""); }}
                style={{ flex: 1, padding: "11px", borderRadius: 10, background: "transparent", border: `1px solid ${tk.border}`, color: tk.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button className="ad-btn" onClick={handleAddCompany} disabled={submitting}
                style={{ flex: 2, padding: "11px", borderRadius: 10, background: submitting ? tk.textMuted : `linear-gradient(135deg,${tk.acc},${tk.accDark})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: submitting ? "none" : `0 0 18px ${tk.acc}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? <><div style={{ width: 14, height: 14, border: "2px solid #fff4", borderTop: "2px solid #fff", borderRadius: "50%", animation: "ad-spin 0.7s linear infinite" }} /> Registering...</> : "Register Company"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ Suspend/Restore Modal ══════════════════════════════════ */}
      {showSuspendId !== null && (
        <Modal onClose={() => setShowSuspendId(null)} title={`${companies.find(c => c.id === showSuspendId)?.status === "suspended" ? "✅ Restore" : "⚠️ Suspend"} Company`} accent={tk.warn}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: tk.textSub, lineHeight: 1.7 }}>
              {companies.find(c => c.id === showSuspendId)?.status === "suspended"
                ? <>Restore access for <strong style={{ color: tk.text }}>{companies.find(c => c.id === showSuspendId)?.name}</strong>? They will regain full platform access.</>
                : <>Suspend <strong style={{ color: tk.text }}>{companies.find(c => c.id === showSuspendId)?.name}</strong>? All employees will lose access immediately.</>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowSuspendId(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "transparent", border: `1px solid ${tk.border}`, color: tk.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button className="ad-btn" onClick={() => handleToggleSuspend(showSuspendId!)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: companies.find(c => c.id === showSuspendId)?.status === "suspended" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {companies.find(c => c.id === showSuspendId)?.status === "suspended" ? "Yes, Restore" : "Yes, Suspend"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══ Delete Modal ════════════════════════════════════════════ */}
      {showDeleteId !== null && (
        <Modal onClose={() => setShowDeleteId(null)} title="🗑️ Delete Company" accent="#f43f5e">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: tk.textSub, lineHeight: 1.7 }}>
              Permanently delete <strong style={{ color: tk.text }}>{companies.find(c => c.id === showDeleteId)?.name}</strong>? This will remove all data, employees, and billing records. <span style={{ color: "#f43f5e", fontWeight: 700 }}>This cannot be undone.</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDeleteId(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "transparent", border: `1px solid ${tk.border}`, color: tk.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button className="ad-btn" onClick={() => handleDeleteCompany(showDeleteId!)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg,#f43f5e,#e11d48)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}