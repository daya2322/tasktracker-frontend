"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/components/contexts/themeContext";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Task { id: number; title: string; priority: "High"|"Medium"|"Low"; done: boolean; }
interface WeekDay { label: string; hours: number; isToday: boolean; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, "0"); }
function formatTime(d: Date) {
  const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds(), ap = h >= 12 ? "PM" : "AM";
  return `${pad(h % 12 || 12)}:${pad(m)}:${pad(s)} ${ap}`;
}
function formatTimeShort(d: Date) {
  const h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? "PM" : "AM";
  return `${pad(h % 12 || 12)}:${pad(m)} ${ap}`;
}
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0; const step = target / (duration / 16);
    const t = setInterval(() => { cur += step; if (cur >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(cur)); }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function useTokens() {
  const { isDark } = useTheme();
  return {
    isDark,
    pageBg:       isDark ? "#06101e" : "#f1f5f9",
    cardBg:       isDark ? "linear-gradient(145deg,#1a2540,#0d1526)" : "linear-gradient(145deg,#ffffff,#f8fafc)",
    cardBorder:   isDark ? "rgba(30,58,95,0.5)" : "rgba(0,0,0,0.08)",
    cardShadow:   isDark ? "0 4px 32px rgba(0,0,0,0.5)" : "0 2px 16px rgba(0,0,0,0.06)",
    innerBg:      isDark ? "#040d1a" : "#f0f4f8",
    innerBorder:  isDark ? "rgba(30,58,95,0.4)" : "rgba(0,0,0,0.07)",
    rowBg:        isDark ? "#0d1526" : "#f8fafc",
    rowDoneBg:    isDark ? "#0a1a0a" : "#f0fdf4",
    rowBorder:    isDark ? "#1e293b" : "rgba(0,0,0,0.07)",
    rowDoneBorder:isDark ? "#10b98120" : "#bbf7d0",
    divider:      isDark ? "#0d1526" : "rgba(0,0,0,0.06)",
    scanline:     isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
    takerBg:      isDark ? "#0d1526" : "#e2e8f0",
    textPrimary:  isDark ? "#f1f5f9" : "#0f172a",
    textSecondary:isDark ? "#94a3b8" : "#475569",
    textMuted:    isDark ? "#334155" : "#94a3b8",
    textLabel:    isDark ? "#475569" : "#64748b",
    labelUpper:   isDark ? "#475569" : "#94a3b8",
    clockColor:   isDark ? "#60a5fa" : "#2563eb",
    inputBg:      isDark ? "#080f1e" : "#f8fafc",
    inputBorder:  isDark ? "#1e3a5f" : "#cbd5e1",
    inputText:    isDark ? "#e2e8f0" : "#0f172a",
    ghostColor:   isDark ? "#60a5fa" : "#2563eb",
    metricBg:     isDark ? "linear-gradient(135deg,#1e293b,#0f172a)" : "linear-gradient(135deg,#ffffff,#f1f5f9)",
    metricText:   isDark ? "#f1f5f9" : "#0f172a",
    barEmpty:     isDark ? "#1e293b" : "#e2e8f0",
    barEmptyBorder:isDark ? "rgba(30,58,95,0.5)" : "rgba(0,0,0,0.1)",
    barLabelMuted:isDark ? "#1e3a5f" : "#cbd5e1",
    kpiBg:        isDark ? "linear-gradient(135deg,#111827,#0d1526)" : "linear-gradient(135deg,#fff,#f8fafc)",
    kpiBorder:    isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
    sparkStroke:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  };
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color, fill = false }: { data: number[]; color: string; fill?: boolean }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const fillPath = `${path} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      {fill && <path d={fillPath} fill={color} opacity={0.12} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Ring Progress ────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 44, stroke = 4 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s cubic-bezier(.34,1.56,.64,1)" }}
      />
    </svg>
  );
}

// ─── Trend Arrow ─────────────────────────────────────────────────────────────
function Trend({ value, label, up }: { value: string; label: string; up: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600 }}>
      <span style={{ color: up ? "#22c55e" : "#ef4444", fontSize: 12 }}>{up ? "↑" : "↓"}</span>
      <span style={{ color: up ? "#22c55e" : "#ef4444" }}>{value}</span>
      <span style={{ color: "#64748b", fontWeight: 400 }}>{label}</span>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, subValue, trend, trendUp, trendLabel,
  sparkData, accent, icon, ringPct,
}: {
  label: string; value: string; subValue?: string;
  trend?: string; trendUp?: boolean; trendLabel?: string;
  sparkData?: number[]; accent: string; icon: string; ringPct?: number;
}) {
  const tk = useTokens();
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: tk.kpiBg, borderRadius: 16, padding: "16px 18px",
        border: `1px solid ${hov ? accent + "40" : tk.kpiBorder}`,
        boxShadow: hov ? `0 8px 28px ${accent}18` : tk.cardShadow,
        position: "relative", overflow: "hidden",
        transition: "all 0.22s ease",
        transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      {/* Background glow blob */}
      <div style={{
        position: "absolute", bottom: -20, right: -20, width: 90, height: 90,
        borderRadius: "50%", background: accent, opacity: hov ? 0.09 : 0.05,
        filter: "blur(28px)", transition: "opacity 0.25s",
      }} />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: tk.labelUpper, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: tk.metricText, letterSpacing: "-0.5px", lineHeight: 1 }}>
            {value}
          </div>
          {subValue && (
            <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 4, fontWeight: 500 }}>{subValue}</div>
          )}
          {trend && (
            <div style={{ marginTop: 6 }}>
              <Trend value={trend} label={trendLabel ?? ""} up={trendUp ?? true} />
            </div>
          )}
        </div>

        {/* Right: ring or icon */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
          {ringPct !== undefined ? (
            <div style={{ position: "relative", width: 44, height: 44 }}>
              <Ring pct={ringPct} color={accent} />
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, color: accent,
              }}>{ringPct}%</div>
            </div>
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: accent + "18", border: `1px solid ${accent}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>{icon}</div>
          )}
        </div>
      </div>

      {/* Sparkline */}
      {sparkData && (
        <div style={{ marginTop: 2 }}>
          <Sparkline data={sparkData} color={accent} fill />
        </div>
      )}
    </div>
  );
}

// ─── Metric Card (existing 4 top cards) ──────────────────────────────────────
function MetricCard({ label, value, note, noteType = "neutral", icon, accent }: {
  label: string; value: string; note: string;
  noteType?: "good"|"warn"|"neutral"; icon: string; accent: string;
}) {
  const tk = useTokens();
  const [hov, setHov] = useState(false);
  const noteColor = noteType === "good" ? "#22c55e" : noteType === "warn" ? "#f59e0b" : tk.textLabel;
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: tk.metricBg, borderRadius: 16, padding: "20px",
        border: `1px solid ${hov ? accent + "50" : accent + "25"}`,
        boxShadow: hov ? `0 8px 32px ${accent}20` : `0 2px 16px rgba(0,0,0,0.06)`,
        position: "relative", overflow: "hidden",
        transition: "all 0.25s ease", transform: hov ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: hov ? 0.1 : 0.05, filter: "blur(24px)", transition: "opacity 0.25s" }} />
      <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 10, color: tk.labelUpper, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: tk.metricText, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 11, color: noteColor, marginTop: 5, fontWeight: 600 }}>{note}</div>
    </div>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: "High"|"Medium"|"Low" }) {
  const map = {
    High:   { bg: "#ff4d4d15", color: "#ef4444", dot: "#ef4444", border: "#ef444430" },
    Medium: { bg: "#f59e0b15", color: "#f59e0b", dot: "#f59e0b", border: "#f59e0b30" },
    Low:    { bg: "#10b98115", color: "#10b981", dot: "#10b981", border: "#10b98130" },
  };
  const s = map[priority];
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 700, whiteSpace: "nowrap", border: `1px solid ${s.border}`, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />{priority}
    </span>
  );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const tk = useTokens();
  return (
    <div style={{ background: tk.cardBg, borderRadius: 16, border: `1px solid ${tk.cardBorder}`, boxShadow: tk.cardShadow, overflow: "hidden", transition: "background 0.3s, border-color 0.3s", ...style }}>
      {children}
    </div>
  );
}

// ─── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  const tk = useTokens();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
      <div style={{ width: 3, height: 14, borderRadius: 99, background: "linear-gradient(180deg,#3b82f6,#8b5cf6)" }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{children}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const tk = useTokens();
  const { isDark } = useTheme();

  const [liveClock, setLiveClock] = useState("");
  const [punchedIn, setPunchedIn] = useState(true);
  const [punchTime, setPunchTime] = useState("09:18 AM");
  const [updateText, setUpdateText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const attendancePct = useCountUp(96);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Fix login page redirect bug",                  priority: "High",   done: true  },
    { id: 2, title: "Write API docs for /auth/verify",              priority: "Medium", done: true  },
    { id: 3, title: "UI review for employee dashboard v2",          priority: "High",   done: false },
    { id: 4, title: "Set up staging environment for company panel", priority: "Medium", done: false },
    { id: 5, title: "Weekly team standup notes",                    priority: "Low",    done: false },
  ]);

  const weekData: WeekDay[] = [
    { label: "Mon", hours: 8.2, isToday: false },
    { label: "Tue", hours: 7.5, isToday: false },
    { label: "Wed", hours: 9.0, isToday: false },
    { label: "Thu", hours: 6.3, isToday: false },
    { label: "Fri", hours: 3.2, isToday: false },
    { label: "Sat", hours: 5.7, isToday: true  },
    { label: "Sun", hours: 0,   isToday: false },
  ];
  const maxH = Math.max(...weekData.map(d => d.hours), 1);

  useEffect(() => {
    const tick = () => setLiveClock(formatTime(new Date()));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const handlePunch = (type: "in"|"out") => { setPunchedIn(type === "in"); setPunchTime(formatTimeShort(new Date())); };
  const toggleTask = (id: number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const handleSubmit = () => {
    if (updateText.trim()) { setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); setUpdateText(""); }
  };

  const doneTasks = tasks.filter(t => t.done).length;
  const progress  = Math.round((doneTasks / tasks.length) * 100);

  // KPI sparkline datasets
  const hoursSparkData  = [6.2, 7.1, 8.0, 5.5, 8.2, 7.5, 9.0, 6.3, 3.2, 5.7];
  const taskSparkData   = [3, 5, 4, 7, 6, 8, 5, 9, 7, 8];
  const scoreSparkData  = [78, 82, 80, 85, 88, 84, 90, 87, 92, 95];
  const streakSparkData = [1, 2, 3, 4, 5, 4, 6, 7, 8, 10];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .ed-root * { box-sizing:border-box; }
        .ed-root   { font-family:'Plus Jakarta Sans',sans-serif; }

        @keyframes ed-up    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes ed-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes ed-glow-dark  { 0%,100%{text-shadow:0 0 16px #3b82f670} 50%{text-shadow:0 0 32px #3b82f6cc} }
        @keyframes ed-glow-light { 0%,100%{text-shadow:0 0 8px #2563eb40}  50%{text-shadow:0 0 18px #2563eb80} }
        @keyframes ed-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes ed-barUp  { from{transform:scaleY(0)} to{transform:scaleY(1)} }

        .ed-a1{animation:ed-up .5s ease both .05s} .ed-a2{animation:ed-up .5s ease both .10s}
        .ed-a3{animation:ed-up .5s ease both .15s} .ed-a4{animation:ed-up .5s ease both .20s}
        .ed-a5{animation:ed-up .5s ease both .25s} .ed-a6{animation:ed-up .5s ease both .30s}

        .ed-blk       { animation:ed-blink 2s ease-in-out infinite; }
        .ed-clk-dark  { animation:ed-glow-dark  2s ease-in-out infinite; }
        .ed-clk-light { animation:ed-glow-light 2s ease-in-out infinite; }

        .ed-shimmer {
          background:linear-gradient(90deg,#60a5fa 0%,#a78bfa 45%,#60a5fa 100%);
          background-size:200% auto; -webkit-background-clip:text;
          -webkit-text-fill-color:transparent; background-clip:text;
          animation:ed-shimmer 3s linear infinite;
        }
        .ed-shimmer-light {
          background:linear-gradient(90deg,#2563eb 0%,#7c3aed 45%,#2563eb 100%);
          background-size:200% auto; -webkit-background-clip:text;
          -webkit-text-fill-color:transparent; background-clip:text;
          animation:ed-shimmer 3s linear infinite;
        }
        .ed-bar { transform-origin:bottom; animation:ed-barUp .7s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <div className="ed-root" style={{ background:tk.pageBg, minHeight:"100%", padding:"24px 24px 32px", display:"flex", flexDirection:"column", gap:20, transition:"background 0.3s" }}>

        {/* ── Header ── */}
        <div className="ed-a1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", boxShadow:isDark?"0 0 20px #3b82f660":"0 0 12px #3b82f640", flexShrink:0 }}>RS</div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:tk.textPrimary, lineHeight:1.2 }}>
                Good morning, <span className={isDark?"ed-shimmer":"ed-shimmer-light"}>Ravi</span> 👋
              </div>
              <div style={{ fontSize:12, color:tk.textMuted, marginTop:2 }}>
                {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:isDark?"#0a1929":"#eff6ff", border:isDark?"1px solid #10b98135":"1px solid #bbf7d0", borderRadius:10, padding:"6px 14px", boxShadow:isDark?"0 0 14px #10b98120":"none" }}>
              <span className="ed-blk" style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
              <span style={{ fontSize:12, color:"#10b981", fontWeight:700 }}>Online</span>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:500, background:isDark?"#0a1929":"#eff6ff", border:isDark?"1px solid #1e3a5f":"1px solid #bfdbfe", borderRadius:10, padding:"6px 16px", color:tk.clockColor, letterSpacing:"0.06em", boxShadow:isDark?"0 0 14px #3b82f625":"none" }}>{liveClock}</div>
          </div>
        </div>

        {/* ── Quick Stats (4 top metrics) ── */}
        <div className="ed-a2" style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:14 }}>
          <MetricCard label="Hours today"  value="5h 42m"             note="↑ 12m above avg"   noteType="good"    icon="⏱️" accent="#3b82f6" />
          <MetricCard label="This week"    value="34h 10m"            note="6h left to target"  noteType="neutral" icon="📅" accent="#8b5cf6" />
          <MetricCard label="Tasks done"   value={`${doneTasks} / 5`} note={`${progress}% complete`} noteType="good" icon="✅" accent="#10b981" />
          <MetricCard label="Attendance"   value={`${attendancePct}%`} note="Excellent this month" noteType="good" icon="📊" accent="#f59e0b" />
        </div>

        {/* ── KPI Strip ── */}
        <div className="ed-a3">
          <SectionLabel>Performance KPIs</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:14, marginTop:10 }}>

            <KpiCard
              label="Productivity Score"
              value="95"
              subValue="Out of 100 pts"
              trend="8pts" trendUp={true} trendLabel="vs last week"
              sparkData={scoreSparkData}
              accent="#3b82f6"
              icon="🎯"
              ringPct={95}
            />

            <KpiCard
              label="Tasks Completed"
              value="42"
              subValue="This month"
              trend="12%" trendUp={true} trendLabel="vs last month"
              sparkData={taskSparkData}
              accent="#8b5cf6"
              icon="✅"
            />

            <KpiCard
              label="Avg Daily Hours"
              value="7.8h"
              subValue="Target: 8h"
              trend="0.3h" trendUp={false} trendLabel="vs last week"
              sparkData={hoursSparkData}
              accent="#f59e0b"
              icon="⏱️"
            />

            <KpiCard
              label="Work Streak"
              value="10 days"
              subValue="Current streak 🔥"
              trend="3 days" trendUp={true} trendLabel="personal best"
              sparkData={streakSparkData}
              accent="#10b981"
              icon="🔥"
              ringPct={72}
            />
          </div>
        </div>

        {/* ── Secondary KPI Row ── */}
        <div className="ed-a4">
          <SectionLabel>Monthly Overview</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,minmax(0,1fr))", gap:12, marginTop:10 }}>
            {[
              { label:"On-time Delivery", value:"94%", icon:"🚀", color:"#22c55e", up:true, delta:"+2%" },
              { label:"Meetings Attended", value:"18/20", icon:"📅", color:"#3b82f6", up:true, delta:"+1" },
              { label:"Code Reviews", value:"23", icon:"👨‍💻", color:"#8b5cf6", up:true, delta:"+5" },
              { label:"Bugs Resolved", value:"31", icon:"🐛", color:"#f59e0b", up:false, delta:"-2" },
              { label:"Peer Rating", value:"4.8★", icon:"⭐", color:"#ec4899", up:true, delta:"+0.3" },
            ].map((item, i) => (
              <div key={i} style={{
                background: tk.kpiBg, borderRadius:12, padding:"14px 16px",
                border:`1px solid ${tk.kpiBorder}`, boxShadow:tk.cardShadow,
                display:"flex", flexDirection:"column", gap:8,
                transition:"transform 0.2s, box-shadow 0.2s",
                animation:`ed-up .4s ease both ${.06*i}s`,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 24px ${item.color}18`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform="none"; (e.currentTarget as HTMLDivElement).style.boxShadow=tk.cardShadow; }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:tk.labelUpper, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700 }}>{item.label}</span>
                  <span style={{ fontSize:16 }}>{item.icon}</span>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:item.color, letterSpacing:"-0.5px" }}>{item.value}</div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:10, fontWeight:700, color: item.up ? "#22c55e" : "#ef4444" }}>
                    {item.up ? "↑" : "↓"} {item.delta}
                  </span>
                  <span style={{ fontSize:10, color:tk.textMuted }}>this month</span>
                  {/* Mini dot progress */}
                  <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
                    {[...Array(5)].map((_,j) => (
                      <div key={j} style={{ width:5, height:5, borderRadius:"50%", background: j < Math.round(parseFloat(item.value)*5/100) || j < 3 ? item.color : tk.barEmpty, opacity: j < 3 ? 1 : 0.3 }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row: Punch + Update ── */}
        <div className="ed-a5" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          {/* Punch */}
          <GCard>
            <div style={{ padding:"18px 20px 0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <span style={{ fontSize:13, fontWeight:700, color:tk.textPrimary }}>🕐 Attendance</span>
                <button style={{ fontSize:12, color:tk.ghostColor, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>View history ↗</button>
              </div>
            </div>
            <div style={{ margin:"0 20px", borderRadius:12, padding:"22px 0 18px", textAlign:"center", background:tk.innerBg, border:`1px solid ${tk.innerBorder}`, position:"relative", overflow:"hidden", transition:"background 0.3s" }}>
              <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:`repeating-linear-gradient(0deg,transparent,transparent 3px,${tk.scanline} 3px,${tk.scanline} 4px)` }} />
              <div className={isDark?"ed-clk-dark":"ed-clk-light"} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:38, fontWeight:600, color:punchedIn?tk.clockColor:"#ef4444", letterSpacing:"0.08em", transition:"color 0.4s" }}>{punchTime}</div>
              <div style={{ fontSize:11, color:tk.textMuted, marginTop:8, fontWeight:600, letterSpacing:"0.04em" }}>{punchedIn?`PUNCHED IN AT ${punchTime}`:`PUNCHED OUT AT ${punchTime}`}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:8 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:punchedIn?"#10b981":"#ef4444", boxShadow:punchedIn?"0 0 8px #10b981":"0 0 8px #ef4444", display:"inline-block", animation:punchedIn?"ed-blink 2s ease-in-out infinite":"none" }} />
                <span style={{ fontSize:12, fontWeight:700, color:punchedIn?"#10b981":"#ef4444" }}>{punchedIn?"Currently working":"Clocked out"}</span>
              </div>
            </div>
            <div style={{ padding:"14px 20px 20px", display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => handlePunch("in")} style={{ flex:1, padding:"10px", borderRadius:10, border:"1px solid", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s", background:punchedIn?"linear-gradient(135deg,#3b82f6,#2563eb)":isDark?"#0d1e35":"#eff6ff", color:punchedIn?"#fff":isDark?"#3b82f6":"#2563eb", borderColor:punchedIn?"#3b82f6":isDark?"#1e3a5f":"#bfdbfe", boxShadow:punchedIn?"0 0 16px #3b82f650":"none" }}>⚡ Punch In</button>
                <button onClick={() => handlePunch("out")} style={{ flex:1, padding:"10px", borderRadius:10, border:"1px solid", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s", background:!punchedIn?"linear-gradient(135deg,#ef4444,#dc2626)":isDark?"#1a0d0d":"#fff1f2", color:!punchedIn?"#fff":"#ef4444", borderColor:!punchedIn?"#ef4444":isDark?"#3a1a1a":"#fecdd3", boxShadow:!punchedIn?"0 0 16px #ef444450":"none" }}>🔴 Punch Out</button>
              </div>
              <div>
                <div style={{ height:5, background:tk.takerBg, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:"72%", borderRadius:99, background:"linear-gradient(90deg,#3b82f6,#8b5cf6)", boxShadow:"0 0 10px #3b82f660" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:tk.textMuted, marginTop:5, fontWeight:600 }}>
                  <span>MONTHLY ATTENDANCE</span><span style={{ color:tk.clockColor }}>72%</span>
                </div>
              </div>
            </div>
          </GCard>

          {/* Daily Update */}
          <GCard>
            <div style={{ padding:"18px 20px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <span style={{ fontSize:13, fontWeight:700, color:tk.textPrimary }}>📝 Daily Update</span>
                <button style={{ fontSize:12, color:tk.ghostColor, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Past updates ↗</button>
              </div>
              <textarea
                value={updateText} onChange={e => setUpdateText(e.target.value.slice(0,300))} rows={6}
                placeholder="What did you work on today? Share a brief summary for your manager..."
                style={{ width:"100%", padding:"12px 14px", fontSize:13, fontFamily:"inherit", resize:"none", lineHeight:1.6, borderRadius:12, outline:"none", background:tk.inputBg, border:`1px solid ${tk.inputBorder}`, color:tk.inputText, transition:"border-color .2s, background .3s, box-shadow .2s" }}
                onFocus={e => { e.currentTarget.style.borderColor="#3b82f6"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(59,130,246,0.15)"; }}
                onBlur={e  => { e.currentTarget.style.borderColor=tk.inputBorder; e.currentTarget.style.boxShadow="none"; }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
                <div style={{ fontSize:11, color:updateText.length>250?"#f59e0b":tk.textMuted, fontWeight:600, transition:"color .2s" }}>{updateText.length} / 300</div>
                <button onClick={handleSubmit} style={{ padding:"9px 22px", borderRadius:10, border:"none", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.02em", transition:"all 0.3s", background:submitted?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow:submitted?"0 0 20px #10b98150":"0 0 20px #3b82f650" }}>{submitted?"✓ Submitted!":"Submit Update →"}</button>
              </div>
            </div>
          </GCard>
        </div>

        {/* ── Row: Tasks + Charts ── */}
        <div className="ed-a6" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>

          {/* Tasks */}
          <GCard>
            <div style={{ padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:700, color:tk.textPrimary }}>🎯 Today&apos;s Tasks</span>
                <button style={{ fontSize:12, color:tk.ghostColor, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Manage tasks ↗</button>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:tk.textLabel, marginBottom:6, fontWeight:600 }}>
                  <span>{doneTasks} of {tasks.length} completed</span>
                  <span style={{ color:tk.clockColor }}>{progress}%</span>
                </div>
                <div style={{ height:4, background:tk.takerBg, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${progress}%`, borderRadius:99, background:"linear-gradient(90deg,#3b82f6,#10b981)", boxShadow:"0 0 8px #3b82f660", transition:"width .6s cubic-bezier(.34,1.56,.64,1)" }} />
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {tasks.map((task, i) => (
                  <div key={task.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10, background:task.done?tk.rowDoneBg:tk.rowBg, border:`1px solid ${task.done?tk.rowDoneBorder:tk.rowBorder}`, animation:`ed-up .4s ease both ${.06*i}s`, transition:"background 0.2s, border-color 0.2s", cursor:"default" }}>
                    <div onClick={() => toggleTask(task.id)} style={{ width:18, height:18, borderRadius:6, flexShrink:0, border:task.done?"none":`1.5px solid ${isDark?"#1e3a5f":"#cbd5e1"}`, background:task.done?"linear-gradient(135deg,#3b82f6,#10b981)":"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:task.done?"0 0 10px #3b82f640":"none", transition:"all 0.2s" }}>
                      {task.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{ flex:1, fontSize:13, fontWeight:500, color:task.done?tk.textMuted:tk.textSecondary, textDecoration:task.done?"line-through":"none", transition:"all 0.2s" }}>{task.title}</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            </div>
          </GCard>

          {/* Right: Weekly hours + Leave */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <GCard>
              <div style={{ padding:"18px 20px" }}>
                <div style={{ fontSize:13, fontWeight:700, color:tk.textPrimary, marginBottom:16 }}>📈 Weekly Hours</div>
                <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:84 }}>
                  {weekData.map((day, i) => {
                    const barH = Math.round((day.hours / maxH) * 60);
                    return (
                      <div key={day.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        <div style={{ fontSize:9, color:tk.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700 }}>{day.label}</div>
                        <div style={{ height:60, width:"100%", display:"flex", alignItems:"flex-end" }}>
                          <div className="ed-bar" style={{ width:"100%", height:barH||2, borderRadius:"4px 4px 2px 2px", background:day.isToday?"linear-gradient(180deg,#60a5fa,#3b82f6)":tk.barEmpty, border:day.isToday?"none":`1px solid ${tk.barEmptyBorder}`, boxShadow:day.isToday?"0 0 16px #3b82f660,0 -3px 10px #60a5fa70":"none", animationDelay:`${i*0.07}s`, transition:"background 0.3s" }} />
                        </div>
                        <div style={{ fontSize:9, fontWeight:700, color:day.isToday?"#60a5fa":tk.barLabelMuted }}>{day.hours}h</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GCard>

            <GCard style={{ flex:1 }}>
              <div style={{ padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:tk.textPrimary }}>🏖️ Leave Balance</span>
                  <button style={{ fontSize:12, color:tk.ghostColor, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Apply ↗</button>
                </div>
                {[
                  { type:"Casual", used:4,  total:12, color:"#3b82f6" },
                  { type:"Sick",   used:1,  total:7,  color:"#f59e0b" },
                  { type:"Earned", used:0,  total:15, color:"#10b981" },
                ].map((leave, idx, arr) => (
                  <div key={leave.type} style={{ paddingBottom:idx<arr.length-1?12:0, marginBottom:idx<arr.length-1?12:0, borderBottom:idx<arr.length-1?`1px solid ${tk.divider}`:"none", transition:"border-color 0.3s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                      <div style={{ fontSize:12, color:tk.textLabel, fontWeight:700 }}>{leave.type}</div>
                      <div style={{ fontSize:11, color:tk.textMuted }}>
                        <span style={{ color:leave.color, fontWeight:800 }}>{leave.used}</span> / {leave.total}
                      </div>
                    </div>
                    <div style={{ height:4, background:tk.takerBg, borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, width:`${(leave.used/leave.total)*100}%`, background:leave.color, boxShadow:`0 0 8px ${leave.color}70`, minWidth:leave.used>0?4:0, transition:"width .8s cubic-bezier(.34,1.56,.64,1)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </GCard>
          </div>
        </div>

        {/* ── Activity feed ── */}
        <div style={{ animation:"ed-up .5s ease both .35s" }}>
          <GCard>
            <div style={{ padding:"18px 20px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:tk.textPrimary, marginBottom:14 }}>⚡ Recent Activity</div>
              <div>
                {[
                  { title:"Task completed — Fix login page redirect bug",            time:"Today at 11:02 AM",     color:"#3b82f6", icon:"✅" },
                  { title:"Daily update submitted",                                  time:"Today at 10:45 AM",     color:"#10b981", icon:"📝" },
                  { title:"Punched in",                                              time:"Today at 09:18 AM",     color:"#8b5cf6", icon:"🟢" },
                  { title:"New task assigned — UI review for employee dashboard v2", time:"Yesterday at 05:32 PM", color:"#f59e0b", icon:"📌" },
                  { title:"Punched out",                                             time:"Yesterday at 06:10 PM", color:"#ef4444", icon:"🔴" },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:i<arr.length-1?`1px solid ${tk.divider}`:"none", animation:`ed-up .4s ease both ${.07*i}s`, transition:"border-color 0.3s" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ width:30, height:30, borderRadius:9, flexShrink:0, background:`${item.color}15`, border:`1px solid ${item.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{item.icon}</div>
                      {i<arr.length-1 && <div style={{ width:1, flex:1, background:tk.divider, marginTop:4, transition:"background 0.3s" }} />}
                    </div>
                    <div style={{ paddingTop:5 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:tk.textSecondary }}>{item.title}</div>
                      <div style={{ fontSize:11, color:tk.textMuted, marginTop:3, fontWeight:500 }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GCard>
        </div>

      </div>
    </>
  );
}