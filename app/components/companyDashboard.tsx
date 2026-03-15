"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/app/components/contexts/themeContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Employee {
  id: number; name: string; role: string; dept: string; email: string; phone: string;
  status: "active"|"idle"|"offline"; avatar: string;
  attendance: number; tasks: number; score: number;
}
interface Notice    { id: number; title: string; body: string; type: "info"|"warning"|"success"; date: string; }
interface TaskItem  { id: number; title: string; assignee: string; priority: "High"|"Medium"|"Low"; due: string; status: "todo"|"inprogress"|"done"; }
interface Activity  { id: number; actor: string; action: string; time: string; color: string; }

type EmpFormData = { name: string; role: string; dept: string; email: string; phone: string; status: Employee["status"]; };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0; const step = target / (duration / 16);
    const t = setInterval(() => { cur += step; if (cur >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(cur)); }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

function getInitials(name: string) {
  return name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function useT() {
  const { isDark } = useTheme();
  return {
    isDark,
    bg:          isDark ? "#060c18"     : "#f0f4f8",
    surface:     isDark ? "linear-gradient(145deg,#0f1e35,#0a1628)" : "linear-gradient(145deg,#fff,#f8fafc)",
    border:      isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    shadow:      isDark ? "0 4px 32px rgba(0,0,0,0.55)" : "0 2px 16px rgba(0,0,0,0.07)",
    shadowHov:   isDark ? "0 8px 40px rgba(0,0,0,0.7)"  : "0 6px 24px rgba(0,0,0,0.1)",
    text:        isDark ? "#e2e8f0"  : "#0f172a",
    textSub:     isDark ? "#94a3b8"  : "#475569",
    textMuted:   isDark ? "#475569"  : "#94a3b8",
    textUpper:   isDark ? "#334155"  : "#94a3b8",
    divider:     isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    inputBg:     isDark ? "#060c18"  : "#f8fafc",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1",
    tag:         isDark ? "#0f1e35"  : "#f1f5f9",
    tagBorder:   isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    barTrack:    isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0",
    modalBg:     isDark ? "#0c1829"  : "#ffffff",
    modalBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    acc:     "#14b8a6", accDark: "#0d9488", accGlow: "rgba(20,184,166,0.3)",
    sec:     "#6366f1", secGlow: "rgba(99,102,241,0.3)",
    warn:    "#f59e0b", danger: "#f43f5e", success: "#10b981",
  };
}

// ─── SVG Bar Chart ─────────────────────────────────────────────────────────────
function BarChart({ data, color, height = 80 }: { data: { label: string; value: number }[]; color: string; height?: number }) {
  const tk = useT();
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <svg viewBox={`0 0 ${data.length * 28} ${height + 20}`} style={{ width: "100%", overflow: "visible" }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * height; const x = i * 28 + 4;
        return (
          <g key={i}>
            <rect x={x} y={height - barH} width={20} height={barH} rx={3} fill={color} opacity={0.85} style={{ filter: `drop-shadow(0 0 4px ${color}60)` }} />
            <text x={x + 10} y={height + 14} textAnchor="middle" fill={tk.textMuted} fontSize={8} fontFamily="inherit">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

type DonutArc = {
  value: number;
  color: string;
  label: string;
  d: string;
  endPct: number;
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function Donut({ segments, size = 80 }: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;

  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const arcs = segments.reduce<DonutArc[]>((acc, seg) => {
    const prev = acc.length ? acc[acc.length - 1].endPct : 0;

    const pct = seg.value / total;
    const start = prev * 2 * Math.PI - Math.PI / 2;
    const endPct = prev + pct;
    const end = endPct * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);

    const large = pct > 0.5 ? 1 : 0;

    acc.push({
      ...seg,
      endPct,
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    });

    return acc;
  }, []);

  return (
    <svg width={size} height={size}>
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={arc.d}
          fill="none"
          stroke={arc.color}
          strokeWidth={9}
          strokeLinecap="butt"
          style={{ filter: `drop-shadow(0 0 3px ${arc.color}60)` }}
        />
      ))}
      <circle cx={cx} cy={cy} r={r - 10} fill="none" />
    </svg>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Spark({ data, color }: { data: number[]; color: string }) {
  const mn = Math.min(...data), mx = Math.max(...data), range = mx - mn || 1;
  const w = 72, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / range) * (h - 4) - 2}`);
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <path d={`M ${pts.join(" L ")}`} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <path d={`M ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`} fill={color} opacity={0.1} />
    </svg>
  );
}

// ─── Ring ─────────────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 40 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2; const circ = 2 * Math.PI * r; const dash = (pct / 100) * circ;
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
      style={{ background: tk.surface, borderRadius: 16, border: `1px solid ${hov && accent ? accent + "35" : tk.border}`, boxShadow: hov ? tk.shadowHov : tk.shadow, overflow: "hidden", transition: "all 0.22s ease", ...style }}>
      {children}
    </div>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────────
function CH({ title, action, actionLabel }: { title: string; action?: () => void; actionLabel?: string }) {
  const tk = useT();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 14, borderRadius: 99, background: `linear-gradient(180deg,${tk.acc},${tk.sec})` }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: tk.text }}>{title}</span>
      </div>
      {action && <button onClick={action} style={{ fontSize: 11, color: tk.acc, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>{actionLabel ?? "View all ↗"}</button>}
    </div>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: "active"|"idle"|"offline" }) {
  const col = status === "active" ? "#10b981" : status === "idle" ? "#f59e0b" : "#64748b";
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, boxShadow: status === "active" ? `0 0 6px ${col}` : "none", display: "inline-block", flexShrink: 0 }} />;
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
function PBadge({ p }: { p: "High"|"Medium"|"Low" }) {
  const m = { High:["#f43f5e","#f43f5e20","#f43f5e30"], Medium:["#f59e0b","#f59e0b20","#f59e0b30"], Low:["#10b981","#10b98120","#10b98130"] };
  const [c,bg,bd] = m[p];
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700, color: c, background: bg, border: `1px solid ${bd}`, whiteSpace: "nowrap" }}>{p}</span>;
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SLabel({ children }: { children: React.ReactNode }) {
  const tk = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 12px" }}>
      <div style={{ width: 3, height: 13, borderRadius: 99, background: `linear-gradient(180deg,${tk.acc},${tk.sec})` }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: tk.textUpper, textTransform: "uppercase", letterSpacing: "0.12em" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${tk.divider},transparent)` }} />
    </div>
  );
}

// ─── KPI Top Card ─────────────────────────────────────────────────────────────
function KpiTop({ label, value, sub, icon, accent, spark, ring, trend, trendUp }:
  { label: string; value: string; sub: string; icon: string; accent: string; spark?: number[]; ring?: number; trend?: string; trendUp?: boolean }
) {
  const tk = useT(); const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: tk.surface, borderRadius: 16, padding: "18px 20px", border: `1px solid ${hov ? accent + "40" : tk.border}`, boxShadow: hov ? `0 8px 32px ${accent}20` : tk.shadow, position: "relative", overflow: "hidden", transition: "all 0.22s ease", transform: hov ? "translateY(-2px)" : "none" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: hov ? 0.1 : 0.06, filter: "blur(24px)", transition: "opacity 0.25s" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: tk.textUpper, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</div>
        {ring !== undefined ? (
          <div style={{ position: "relative", width: 40, height: 40 }}>
            <Ring pct={ring} color={accent} size={40} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: accent }}>{ring}%</div>
          </div>
        ) : (
          <div style={{ width: 34, height: 34, borderRadius: 9, background: accent + "18", border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{icon}</div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: tk.text, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: tk.textMuted, marginTop: 4 }}>{sub}</div>
      {trend && <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: trendUp ? "#10b981" : "#f43f5e" }}>{trendUp ? "↑" : "↓"} {trend}</span></div>}
      {spark && <div style={{ marginTop: 10 }}><Spark data={spark} color={accent} /></div>}
    </div>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const tk = useT();
  return (
    <div>
      <label style={{ fontSize: 11, color: tk.textUpper, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ onClose, title, children, accentColor }: { onClose: () => void; title: string; children: React.ReactNode; accentColor?: string }) {
  const tk = useT();
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "cd-fade .15s ease" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: tk.modalBg, borderRadius: 20, padding: "28px 32px", width: "100%", maxWidth: 520, border: `1px solid ${accentColor ? accentColor + "30" : tk.modalBorder}`, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: tk.text }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: tk.border, border: "none", cursor: "pointer", fontSize: 16, color: tk.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Input / Textarea / Select shared styles ──────────────────────────────────
function inputStyle(tk: ReturnType<typeof useT>): React.CSSProperties {
  return { width: "100%", padding: "10px 14px", borderRadius: 10, background: tk.inputBg, border: `1px solid ${tk.inputBorder}`, color: tk.text, fontSize: 13, fontFamily: "inherit", outline: "none" };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CompanyDashboard() {
  const tk = useT();
  const { isDark } = useTheme();


  // ── State ──
  const [activeTab, setActiveTab] = useState<"employees"|"tasks"|"notices">("employees");
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showTaskModal,   setShowTaskModal]   = useState(false);
  const [showEmpModal,    setShowEmpModal]    = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number|null>(null);

  const [noticeForm, setNoticeForm] = useState({ title: "", body: "", type: "info" as Notice["type"] });
  const [taskForm,   setTaskForm]   = useState({ title: "", assignee: "", priority: "Medium" as TaskItem["priority"], due: "" });
  const [empForm,    setEmpForm]    = useState<EmpFormData>({ name: "", role: "", dept: "", email: "", phone: "", status: "active" });
  const [empError,   setEmpError]   = useState("");

  const [employees, setEmployees] = useState<Employee[]>([
    { id:1, name:"Priya Sharma",   role:"Frontend Dev",    dept:"Engineering", email:"priya@acme.com",   phone:"9876543210", status:"active",  avatar:"PS", attendance:96, tasks:8,  score:94 },
    { id:2, name:"Rohan Mehta",    role:"Backend Dev",     dept:"Engineering", email:"rohan@acme.com",   phone:"9876543211", status:"active",  avatar:"RM", attendance:88, tasks:5,  score:82 },
    { id:3, name:"Divya Nair",     role:"UI Designer",     dept:"Design",      email:"divya@acme.com",   phone:"9876543212", status:"idle",    avatar:"DN", attendance:92, tasks:3,  score:90 },
    { id:4, name:"Arjun Kapoor",   role:"QA Engineer",     dept:"QA",          email:"arjun@acme.com",   phone:"9876543213", status:"active",  avatar:"AK", attendance:78, tasks:11, score:76 },
    { id:5, name:"Sneha Pillai",   role:"Product Manager", dept:"Product",     email:"sneha@acme.com",   phone:"9876543214", status:"offline", avatar:"SP", attendance:85, tasks:6,  score:88 },
    { id:6, name:"Vikram Tiwari",  role:"DevOps",          dept:"Infra",       email:"vikram@acme.com",  phone:"9876543215", status:"active",  avatar:"VT", attendance:99, tasks:4,  score:95 },
    { id:7, name:"Anika Reddy",    role:"Data Analyst",    dept:"Analytics",   email:"anika@acme.com",   phone:"9876543216", status:"idle",    avatar:"AR", attendance:91, tasks:7,  score:85 },
    { id:8, name:"Karan Joshi",    role:"Mobile Dev",      dept:"Engineering", email:"karan@acme.com",   phone:"9876543217", status:"active",  avatar:"KJ", attendance:94, tasks:9,  score:91 },
  ]);

   // ── KPI counters (animated, driven by employees.length when ready) ──
  const empCount = employees.length;
  const totalEmp    = useCountUp(empCount);
  const activeToday = useCountUp(Math.round(empCount * 0.76));
  const avgScore    = useCountUp(87);
  const tasksOpen   = useCountUp(34);


  const [notices, setNotices] = useState<Notice[]>([
    { id:1, title:"Q1 Performance Review", body:"All departments must submit self-assessment forms by March 20.", type:"info",    date:"Mar 12" },
    { id:2, title:"System Maintenance",    body:"Servers will be down on March 16 from 2–4 AM.",                 type:"warning", date:"Mar 11" },
    { id:3, title:"Team Outing Approved",  body:"The team outing to Lonavala on March 22 has been approved.",    type:"success", date:"Mar 10" },
  ]);

  const [taskItems, setTaskItems] = useState<TaskItem[]>([
    { id:1, title:"Redesign onboarding flow",         assignee:"Divya Nair",    priority:"High",   due:"Mar 18", status:"inprogress" },
    { id:2, title:"API rate-limiting implementation", assignee:"Rohan Mehta",   priority:"High",   due:"Mar 20", status:"todo"       },
    { id:3, title:"Write test cases for auth module", assignee:"Arjun Kapoor",  priority:"Medium", due:"Mar 22", status:"inprogress" },
    { id:4, title:"Deploy v2.1 to staging",           assignee:"Vikram Tiwari", priority:"High",   due:"Mar 15", status:"done"       },
    { id:5, title:"Update analytics dashboard",       assignee:"Anika Reddy",   priority:"Medium", due:"Mar 25", status:"todo"       },
    { id:6, title:"Fix push notification bug",        assignee:"Karan Joshi",   priority:"Low",    due:"Mar 28", status:"todo"       },
  ]);

  const activities: Activity[] = [
    { id:1, actor:"Priya Sharma",  action:"submitted daily update",                 time:"2m ago",  color:"#14b8a6" },
    { id:2, actor:"Vikram Tiwari", action:"completed task: Deploy v2.1 to staging", time:"18m ago", color:"#10b981" },
    { id:3, actor:"Rohan Mehta",   action:"punched in",                             time:"35m ago", color:"#6366f1" },
    { id:4, actor:"Divya Nair",    action:"updated task progress to 60%",           time:"1h ago",  color:"#f59e0b" },
    { id:5, actor:"Arjun Kapoor",  action:"marked 3 test cases as passed",          time:"2h ago",  color:"#14b8a6" },
    { id:6, actor:"Karan Joshi",   action:"punched in late (9:42 AM)",              time:"3h ago",  color:"#f43f5e" },
    { id:7, actor:"Sneha Pillai",  action:"is offline today",                       time:"3h ago",  color:"#64748b" },
    { id:8, actor:"Anika Reddy",   action:"submitted weekly report",                time:"4h ago",  color:"#14b8a6" },
  ];

  const deptData   = [{ label:"Eng", value:52 },{ label:"Design",value:18 },{ label:"QA",value:14 },{ label:"Prod",value:10 },{ label:"Infra",value:8 },{ label:"Data",value:12 },{ label:"HR",value:8 }];
  const attendData = [{ label:"Mon",value:96 },{ label:"Tue",value:88 },{ label:"Wed",value:94 },{ label:"Thu",value:91 },{ label:"Fri",value:85 },{ label:"Sat",value:72 },{ label:"Sun",value:10 }];
  const scoreDistribution = [{ value:32,color:"#10b981",label:"90–100" },{ value:48,color:"#14b8a6",label:"75–89" },{ value:38,color:"#6366f1",label:"60–74" },{ value:18,color:"#f59e0b",label:"<60" }];

  const noticeColors = {
    info:    { bg:"#6366f115", border:"#6366f140", color:"#818cf8", dot:"#6366f1" },
    warning: { bg:"#f59e0b15", border:"#f59e0b40", color:"#fbbf24", dot:"#f59e0b" },
    success: { bg:"#10b98115", border:"#10b98140", color:"#34d399", dot:"#10b981" },
  };
  const taskStatusColors = { todo:{ color:"#94a3b8",bg:"rgba(148,163,184,0.1)" }, inprogress:{ color:"#14b8a6",bg:"rgba(20,184,166,0.1)" }, done:{ color:"#10b981",bg:"rgba(16,185,129,0.1)" } };
  const taskStatusLabel  = { todo:"To Do", inprogress:"In Progress", done:"Done" };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const addNotice = () => {
    if (!noticeForm.title.trim()) return;
    setNotices(prev => [{ id: Date.now(), ...noticeForm, date: "Just now" }, ...prev]);
    setNoticeForm({ title: "", body: "", type: "info" });
    setShowNoticeModal(false);
  };

  const addTask = () => {
    if (!taskForm.title.trim()) return;
    setTaskItems(prev => [{ id: Date.now(), ...taskForm, status: "todo" }, ...prev]);
    setTaskForm({ title: "", assignee: "", priority: "Medium", due: "" });
    setShowTaskModal(false);
  };

  const addEmployee = () => {
    if (!empForm.name.trim() || !empForm.role.trim() || !empForm.dept.trim()) {
      setEmpError("Name, Role, and Department are required."); return;
    }
    if (empForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empForm.email)) {
      setEmpError("Please enter a valid email address."); return;
    }
    setEmpError("");
    const initials = getInitials(empForm.name);
    const newEmp: Employee = {
      id: Date.now(),
      name: empForm.name.trim(),
      role: empForm.role.trim(),
      dept: empForm.dept.trim(),
      email: empForm.email.trim(),
      phone: empForm.phone.trim(),
      status: empForm.status,
      avatar: initials,
      attendance: 100,
      tasks: 0,
      score: 0,
    };
    setEmployees(prev => [...prev, newEmp]);
    setEmpForm({ name: "", role: "", dept: "", email: "", phone: "", status: "active" });
    setShowEmpModal(false);
    setActiveTab("employees");
  };

  const deleteEmployee = (id: number) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setDeleteConfirmId(null);
  };

  const iStyle = inputStyle(tk);
  const doneCount   = taskItems.filter(t => t.status === "done").length;
  const inProgCount = taskItems.filter(t => t.status === "inprogress").length;
  const DEPTS = ["Engineering","Design","QA","Product","Infra","Analytics","HR","Marketing","Finance","Sales"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .cd-root * { box-sizing: border-box; }
        .cd-root { font-family: 'Sora', sans-serif; }
        @keyframes cd-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes cd-fade { from{opacity:0} to{opacity:1} }
        .cd-a1{animation:cd-up .45s ease both .05s} .cd-a2{animation:cd-up .45s ease both .10s}
        .cd-a3{animation:cd-up .45s ease both .15s} .cd-a4{animation:cd-up .45s ease both .20s}
        .cd-a5{animation:cd-up .45s ease both .25s} .cd-a6{animation:cd-up .45s ease both .30s}
        .cd-a7{animation:cd-up .45s ease both .35s}
        .cd-row:hover { background: rgba(20,184,166,0.04) !important; }
        .cd-row { transition: background 0.15s; }
        .cd-tab { transition: all 0.18s; }
        .cd-tab:hover { color: #14b8a6 !important; }
        .cd-btn { transition: all 0.18s; }
        .cd-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .cd-btn:active { transform: scale(0.97); }
        .cd-inp:focus { outline:none; border-color: #14b8a6 !important; box-shadow: 0 0 0 3px rgba(20,184,166,0.15) !important; }
        .cd-inp-sec:focus { outline:none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        .cd-overlay { animation: cd-fade .15s ease; }
      `}</style>

      <div className="cd-root" style={{ background: tk.bg, minHeight: "100%", padding: "24px 24px 36px", display: "flex", flexDirection: "column", gap: 22, transition: "background 0.3s" }}>

        {/* ── Header ── */}
        <div className="cd-a1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: tk.text, letterSpacing: "-0.3px" }}>
              Company <span style={{ color: tk.acc }}>Dashboard</span>
            </div>
            <div style={{ fontSize: 12, color: tk.textMuted, marginTop: 3 }}>
              {new Date().toLocaleDateString("en-IN",{ weekday:"long",day:"numeric",month:"long",year:"numeric" })} · Acme Corp
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Add Employee */}
            <button className="cd-btn" onClick={() => setShowEmpModal(true)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, background:"rgba(20,184,166,0.12)", border:"1px solid rgba(20,184,166,0.3)", color:tk.acc, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              👤 Add Employee
            </button>
            {/* Post Notice */}
            <button className="cd-btn" onClick={() => setShowNoticeModal(true)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)", color:"#818cf8", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              📢 Post Notice
            </button>
            {/* Assign Task */}
            <button className="cd-btn" onClick={() => setShowTaskModal(true)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, background:"rgba(243,162,0,0.12)", border:"1px solid rgba(243,162,0,0.3)", color:"#fbbf24", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              ＋ Assign Task
            </button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="cd-a2" style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:14 }}>
          <KpiTop label="Total Employees" value={`${totalEmp}`}    sub="Across all departments"            icon="👥" accent="#14b8a6" spark={[130,134,138,140,142,145,146,empCount]} trend={`${empCount} total`} trendUp />
          <KpiTop label="Active Today"    value={`${activeToday}`} sub={`${Math.round((activeToday/Math.max(empCount,1))*100)}% present rate`} icon="✅" accent="#10b981" ring={Math.round((activeToday/Math.max(empCount,1))*100)} trend="↑ 4 vs yesterday" trendUp />
          <KpiTop label="Avg Performance" value={`${avgScore}`}    sub="Out of 100 pts"                    icon="📊" accent="#6366f1" spark={[78,80,82,81,84,85,86,87]} trend="↑ 2pts this week" trendUp />
          <KpiTop label="Open Tasks"      value={`${tasksOpen}`}   sub="Across all teams"                  icon="🎯" accent="#f59e0b" ring={Math.round(34/80*100)} trend="↓ 6 resolved today" trendUp />
        </div>

        {/* ── KPI Strip ── */}
        <div className="cd-a3">
          <SLabel>Performance Overview</SLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,minmax(0,1fr))", gap:12 }}>
            {[
              { label:"Avg Attendance",  value:"91%",  color:"#14b8a6", icon:"📅", delta:"+2%",  up:true  },
              { label:"Tasks Completed", value:"68%",  color:"#10b981", icon:"✅", delta:"+8%",  up:true  },
              { label:"On-Time Delivery",value:"88%",  color:"#6366f1", icon:"🚀", delta:"-1%",  up:false },
              { label:"Late Check-ins",  value:"12",   color:"#f43f5e", icon:"⚠️", delta:"-3",   up:true  },
              { label:"Team Mood Score", value:"4.2★", color:"#f59e0b", icon:"😊", delta:"+0.3", up:true  },
            ].map((item, i) => (
              <div key={i} style={{ background:tk.surface, borderRadius:12, padding:"14px 16px", border:`1px solid ${tk.border}`, boxShadow:tk.shadow, animation:`cd-up .4s ease both ${.06*i}s`, transition:"all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 24px ${item.color}18`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform="none"; (e.currentTarget as HTMLDivElement).style.boxShadow=tk.shadow; }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:10, color:tk.textUpper, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700 }}>{item.label}</span>
                  <span style={{ fontSize:16 }}>{item.icon}</span>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:item.color }}>{item.value}</div>
                <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:item.up?"#10b981":"#f43f5e" }}>{item.up?"↑":"↓"} {item.delta}</span>
                  <span style={{ fontSize:10, color:tk.textMuted }}>vs last week</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="cd-a4" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 0.7fr", gap:14 }}>
          <GCard accent={tk.acc} style={{ padding:"18px 20px" }}>
            <CH title="📅 Weekly Attendance (%)" />
            <BarChart data={attendData} color={tk.acc} height={90} />
          </GCard>
          <GCard accent={tk.sec} style={{ padding:"18px 20px" }}>
            <CH title="🏢 Headcount by Department" />
            <BarChart data={deptData} color={tk.sec} height={90} />
          </GCard>
          <GCard accent="#f59e0b" style={{ padding:"18px 20px" }}>
            <CH title="⭐ Score Distribution" />
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <Donut segments={scoreDistribution} size={88} />
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {scoreDistribution.map((s,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }} />
                    <span style={{ fontSize:10, color:tk.textSub, fontWeight:500 }}>{s.label}</span>
                    <span style={{ fontSize:10, color:s.color, fontWeight:700, marginLeft:"auto" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GCard>
        </div>

        {/* ── Tabs ── */}
        <div className="cd-a5">
          <div style={{ display:"flex", gap:4, marginBottom:16, borderBottom:`1px solid ${tk.divider}` }}>
            {(["employees","tasks","notices"] as const).map(tab => (
              <button key={tab} className="cd-tab"
                onClick={() => setActiveTab(tab)}
                style={{ padding:"8px 18px", fontSize:13, fontWeight:600, fontFamily:"inherit", background:"none", border:"none", cursor:"pointer", borderBottom:`2px solid ${activeTab===tab?tk.acc:"transparent"}`, color:activeTab===tab?tk.acc:tk.textSub, marginBottom:-1, textTransform:"capitalize" }}>
                {tab==="employees"?"👥 Employees":tab==="tasks"?"🎯 Tasks":"📢 Notices"}
              </button>
            ))}
          </div>

          {/* ── Employees Tab ── */}
          {activeTab === "employees" && (
            <GCard>
              {/* Table header with count + add btn */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:3, height:14, borderRadius:99, background:`linear-gradient(180deg,${tk.acc},${tk.sec})` }} />
                  <span style={{ fontSize:13, fontWeight:700, color:tk.text }}>All Employees</span>
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:`rgba(20,184,166,0.12)`, color:tk.acc, fontWeight:700, border:`1px solid rgba(20,184,166,0.25)` }}>{employees.length}</span>
                </div>
                <button className="cd-btn" onClick={() => setShowEmpModal(true)}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:8, background:`rgba(20,184,166,0.1)`, border:`1px solid rgba(20,184,166,0.25)`, color:tk.acc, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  + Add Employee
                </button>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${tk.divider}` }}>
                      {["Employee","Dept","Contact","Status","Attendance","Tasks","Score","Actions"].map(h => (
                        <th key={h} style={{ padding:"12px 16px", fontSize:10, fontWeight:700, color:tk.textUpper, textTransform:"uppercase", letterSpacing:"0.08em", textAlign:h==="Actions"?"center":"left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => (
                      <tr key={emp.id} className="cd-row" style={{ borderBottom:`1px solid ${tk.divider}`, animation:`cd-up .35s ease both ${.05*i}s` }}>
                        {/* Employee */}
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${tk.acc},${tk.sec})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", flexShrink:0 }}>{emp.avatar}</div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:tk.text }}>{emp.name}</div>
                              <div style={{ fontSize:11, color:tk.textMuted }}>{emp.role}</div>
                            </div>
                          </div>
                        </td>
                        {/* Dept */}
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:tk.tag, border:`1px solid ${tk.tagBorder}`, color:tk.textSub, fontWeight:500 }}>{emp.dept}</span>
                        </td>
                        {/* Contact */}
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ fontSize:11, color:tk.textSub }}>{emp.email || "—"}</div>
                          <div style={{ fontSize:10, color:tk.textMuted, marginTop:2 }}>{emp.phone || "—"}</div>
                        </td>
                        {/* Status */}
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <StatusDot status={emp.status} />
                            <span style={{ fontSize:12, color:tk.textSub, textTransform:"capitalize" }}>{emp.status}</span>
                          </div>
                        </td>
                        {/* Attendance */}
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ flex:1, height:4, background:tk.barTrack, borderRadius:99, overflow:"hidden", minWidth:50 }}>
                              <div style={{ height:"100%", width:`${emp.attendance}%`, background:emp.attendance>=90?tk.acc:emp.attendance>=75?tk.warn:tk.danger, borderRadius:99 }} />
                            </div>
                            <span style={{ fontSize:11, fontWeight:700, color:emp.attendance>=90?tk.acc:emp.attendance>=75?tk.warn:tk.danger, minWidth:28 }}>{emp.attendance}%</span>
                          </div>
                        </td>
                        {/* Tasks */}
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <Ring pct={Math.min(100,emp.tasks*9)} color={tk.sec} size={28} />
                            <span style={{ fontSize:12, color:tk.textSub, fontWeight:600 }}>{emp.tasks}</span>
                          </div>
                        </td>
                        {/* Score */}
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ flex:1, height:4, background:tk.barTrack, borderRadius:99, overflow:"hidden", minWidth:50 }}>
                              <div style={{ height:"100%", width:`${emp.score}%`, background:`linear-gradient(90deg,${tk.acc},${tk.sec})`, borderRadius:99 }} />
                            </div>
                            <span style={{ fontSize:11, fontWeight:700, color:tk.acc, minWidth:24 }}>{emp.score}</span>
                          </div>
                        </td>
                        {/* Actions */}
                        <td style={{ padding:"12px 16px", textAlign:"center" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                            <button onClick={() => { setTaskForm(p => ({ ...p, assignee: emp.name })); setShowTaskModal(true); }}
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:7, background:`rgba(20,184,166,0.1)`, border:`1px solid rgba(20,184,166,0.25)`, color:tk.acc, cursor:"pointer", fontFamily:"inherit", fontWeight:600, transition:"all 0.15s" }}>
                              Assign
                            </button>
                            <button onClick={() => setDeleteConfirmId(emp.id)}
                              style={{ fontSize:11, padding:"4px 10px", borderRadius:7, background:`rgba(244,63,94,0.08)`, border:`1px solid rgba(244,63,94,0.2)`, color:"#f43f5e", cursor:"pointer", fontFamily:"inherit", fontWeight:600, transition:"all 0.15s" }}>
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {employees.length === 0 && (
                  <div style={{ padding:"48px 20px", textAlign:"center", color:tk.textMuted, fontSize:13 }}>
                    No employees yet.{" "}
                    <button onClick={() => setShowEmpModal(true)} style={{ color:tk.acc, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600 }}>Add your first employee →</button>
                  </div>
                )}
              </div>
            </GCard>
          )}

          {/* ── Tasks Tab ── */}
          {activeTab === "tasks" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"flex", gap:10, marginBottom:6 }}>
                {[{ label:"Total",val:taskItems.length,color:"#94a3b8" },{ label:"To Do",val:taskItems.filter(t=>t.status==="todo").length,color:"#94a3b8" },{ label:"In Progress",val:inProgCount,color:tk.acc },{ label:"Done",val:doneCount,color:tk.success }].map((s,i) => (
                  <div key={i} style={{ padding:"6px 14px", borderRadius:8, background:`${s.color}15`, border:`1px solid ${s.color}30`, display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.val}</span>
                    <span style={{ fontSize:11, color:tk.textSub, fontWeight:500 }}>{s.label}</span>
                  </div>
                ))}
              </div>
              {taskItems.map((task, i) => {
                const sc = taskStatusColors[task.status];
                return (
                  <GCard key={task.id} style={{ padding:"14px 18px", animation:`cd-up .35s ease both ${.05*i}s` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:sc.color, boxShadow:`0 0 6px ${sc.color}`, flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:task.status==="done"?tk.textMuted:tk.text, textDecoration:task.status==="done"?"line-through":"none" }}>{task.title}</div>
                        <div style={{ fontSize:11, color:tk.textMuted, marginTop:3 }}>
                          Assigned to <span style={{ color:tk.acc, fontWeight:600 }}>{task.assignee}</span> · Due {task.due}
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        <PBadge p={task.priority} />
                        <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:sc.bg, color:sc.color, fontWeight:600, border:`1px solid ${sc.color}25` }}>{taskStatusLabel[task.status]}</span>
                        <select value={task.status} onChange={e => setTaskItems(prev => prev.map(t => t.id===task.id?{ ...t, status:e.target.value as TaskItem["status"] }:t))}
                          style={{ fontSize:11, background:tk.inputBg, border:`1px solid ${tk.inputBorder}`, color:tk.textSub, borderRadius:7, padding:"4px 8px", fontFamily:"inherit", cursor:"pointer" }}>
                          <option value="todo">To Do</option>
                          <option value="inprogress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </GCard>
                );
              })}
            </div>
          )}

          {/* ── Notices Tab ── */}
          {activeTab === "notices" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {notices.map((n, i) => {
                const nc = noticeColors[n.type];
                return (
                  <GCard key={n.id} accent={nc.dot} style={{ padding:"16px 20px", animation:`cd-up .35s ease both ${.06*i}s` }}>
                    <div style={{ display:"flex", gap:14 }}>
                      <div style={{ width:4, borderRadius:99, background:nc.dot, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:nc.color }}>{n.title}</div>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontSize:11, color:tk.textMuted }}>{n.date}</span>
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:nc.bg, border:`1px solid ${nc.border}`, color:nc.color, fontWeight:700, textTransform:"capitalize" }}>{n.type}</span>
                            <button onClick={() => setNotices(prev=>prev.filter(x=>x.id!==n.id))} style={{ fontSize:14, color:tk.textMuted, background:"none", border:"none", cursor:"pointer" }}>×</button>
                          </div>
                        </div>
                        <div style={{ fontSize:13, color:tk.textSub, lineHeight:1.6 }}>{n.body}</div>
                      </div>
                    </div>
                  </GCard>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom Row: Activity + Attendance ── */}
        <div className="cd-a7" style={{ display:"grid", gridTemplateColumns:"1fr 0.8fr", gap:14 }}>
          <GCard accent={tk.acc} style={{ padding:"18px 20px" }}>
            <CH title="⚡ Live Activity Feed" />
            {activities.map((act, i) => (
              <div key={act.id} style={{ display:"flex", gap:12, padding:"9px 0", borderBottom:i<activities.length-1?`1px solid ${tk.divider}`:"none", animation:`cd-up .4s ease both ${.05*i}s` }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:`${act.color}15`, border:`1px solid ${act.color}25`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:act.color }} />
                  </div>
                  {i<activities.length-1 && <div style={{ width:1, flex:1, background:tk.divider, marginTop:4 }} />}
                </div>
                <div style={{ paddingTop:4 }}>
                  <div style={{ fontSize:12, color:tk.text }}><span style={{ fontWeight:700, color:act.color }}>{act.actor}</span> <span style={{ color:tk.textSub }}>{act.action}</span></div>
                  <div style={{ fontSize:10, color:tk.textMuted, marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>{act.time}</div>
                </div>
              </div>
            ))}
          </GCard>

          <GCard accent="#10b981" style={{ padding:"18px 20px" }}>
            <CH title="📋 Today's Attendance" />
            <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
              <div style={{ position:"relative" }}>
                <Donut segments={[{ value:112,color:"#14b8a6",label:"Present" },{ value:20,color:"#f59e0b",label:"Late" },{ value:16,color:"#f43f5e",label:"Absent" }]} size={100} />
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:tk.acc }}>148</div>
                  <div style={{ fontSize:9, color:tk.textMuted, fontWeight:600 }}>TOTAL</div>
                </div>
              </div>
            </div>
            {[{ label:"Present",val:112,pct:76,color:"#14b8a6" },{ label:"Late",val:20,pct:13,color:"#f59e0b" },{ label:"Absent",val:16,pct:11,color:"#f43f5e" }].map((item,i) => (
              <div key={i} style={{ marginBottom:i<2?10:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:7, height:7, borderRadius:2, background:item.color }} />
                    <span style={{ color:tk.textSub, fontWeight:500 }}>{item.label}</span>
                  </div>
                  <span style={{ color:item.color, fontWeight:700 }}>{item.val} ({item.pct}%)</span>
                </div>
                <div style={{ height:4, background:tk.barTrack, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${item.pct}%`, background:item.color, borderRadius:99, boxShadow:`0 0 6px ${item.color}60`, transition:"width 1s cubic-bezier(.34,1.56,.64,1)" }} />
                </div>
              </div>
            ))}
          </GCard>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ADD EMPLOYEE MODAL
      ══════════════════════════════════════════════════════ */}
      {showEmpModal && (
        <Modal onClose={() => { setShowEmpModal(false); setEmpError(""); }} title="👤 Add New Employee" accentColor={tk.acc}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Row 1: Name + Role */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Full Name *">
                <input className="cd-inp" value={empForm.name} onChange={e => setEmpForm(p=>({ ...p, name:e.target.value }))}
                  placeholder="e.g. Priya Sharma" style={iStyle} />
              </Field>
              <Field label="Job Role *">
                <input className="cd-inp" value={empForm.role} onChange={e => setEmpForm(p=>({ ...p, role:e.target.value }))}
                  placeholder="e.g. Frontend Developer" style={iStyle} />
              </Field>
            </div>

            {/* Row 2: Department + Status */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Department *">
                <select className="cd-inp" value={empForm.dept} onChange={e => setEmpForm(p=>({ ...p, dept:e.target.value }))}
                  style={{ ...iStyle, cursor:"pointer", color:empForm.dept?tk.text:tk.textMuted }}>
                  <option value="">Select department...</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Initial Status">
                <div style={{ display:"flex", gap:6, height:42, alignItems:"center" }}>
                  {(["active","idle","offline"] as Employee["status"][]).map(s => {
                    const col = s==="active"?"#10b981":s==="idle"?"#f59e0b":"#64748b";
                    return (
                      <button key={s} onClick={() => setEmpForm(p=>({ ...p, status:s }))}
                        style={{ flex:1, height:"100%", borderRadius:9, border:`1px solid ${empForm.status===s?col+"60":tk.inputBorder}`, background:empForm.status===s?col+"15":"transparent", color:empForm.status===s?col:tk.textMuted, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:col, boxShadow:empForm.status===s?`0 0 6px ${col}`:"none" }} />
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* Row 3: Email + Phone */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Email Address">
                <input className="cd-inp" type="email" value={empForm.email} onChange={e => setEmpForm(p=>({ ...p, email:e.target.value }))}
                  placeholder="priya@company.com" style={iStyle} />
              </Field>
              <Field label="Phone Number">
                <input className="cd-inp" type="tel" value={empForm.phone} onChange={e => setEmpForm(p=>({ ...p, phone:e.target.value }))}
                  placeholder="9876543210" style={iStyle} />
              </Field>
            </div>

            {/* Preview card */}
            {empForm.name.trim() && (
              <div style={{ padding:"12px 14px", borderRadius:10, background:`rgba(20,184,166,0.06)`, border:`1px solid rgba(20,184,166,0.15)`, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${tk.acc},${tk.sec})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {getInitials(empForm.name)}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:tk.text }}>{empForm.name}</div>
                  <div style={{ fontSize:11, color:tk.textMuted }}>{[empForm.role, empForm.dept].filter(Boolean).join(" · ") || "Role / Department"}</div>
                </div>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}>
                  <StatusDot status={empForm.status} />
                  <span style={{ fontSize:11, color:tk.textSub, textTransform:"capitalize" }}>{empForm.status}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {empError && (
              <div style={{ fontSize:12, color:"#f43f5e", padding:"8px 12px", borderRadius:8, background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)" }}>
                ⚠️ {empError}
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button onClick={() => { setShowEmpModal(false); setEmpError(""); }}
                style={{ flex:1, padding:"11px", borderRadius:10, background:"transparent", border:`1px solid ${tk.border}`, color:tk.textSub, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                Cancel
              </button>
              <button className="cd-btn" onClick={addEmployee}
                style={{ flex:2, padding:"11px", borderRadius:10, background:`linear-gradient(135deg,${tk.acc},${tk.accDark})`, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 0 16px ${tk.acc}40` }}>
                Add Employee
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmId !== null && (
        <Modal onClose={() => setDeleteConfirmId(null)} title="⚠️ Remove Employee" accentColor="#f43f5e">
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ fontSize:13, color:tk.textSub, lineHeight:1.6 }}>
              Are you sure you want to remove{" "}
              <strong style={{ color:tk.text }}>{employees.find(e=>e.id===deleteConfirmId)?.name}</strong>?
              This action cannot be undone.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setDeleteConfirmId(null)}
                style={{ flex:1, padding:"10px", borderRadius:10, background:"transparent", border:`1px solid ${tk.border}`, color:tk.textSub, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                Cancel
              </button>
              <button className="cd-btn" onClick={() => deleteEmployee(deleteConfirmId)}
                style={{ flex:1, padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#f43f5e,#e11d48)", border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                Yes, Remove
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Notice Modal ── */}
      {showNoticeModal && (
        <Modal onClose={() => setShowNoticeModal(false)} title="📢 Post New Notice" accentColor="#6366f1">
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Field label="Title"><input className="cd-inp-sec" value={noticeForm.title} onChange={e => setNoticeForm(p=>({ ...p,title:e.target.value }))} placeholder="Notice title..." style={iStyle} /></Field>
            <Field label="Message"><textarea className="cd-inp-sec" value={noticeForm.body} onChange={e => setNoticeForm(p=>({ ...p,body:e.target.value }))} rows={3} placeholder="Write the notice body..." style={{ ...iStyle, resize:"none" }} /></Field>
            <Field label="Type">
              <div style={{ display:"flex", gap:8 }}>
                {(["info","warning","success"] as const).map(t => {
                  const nc = noticeColors[t];
                  return (
                    <button key={t} onClick={() => setNoticeForm(p=>({ ...p,type:t }))}
                      style={{ flex:1, padding:"8px", borderRadius:8, border:`1px solid ${noticeForm.type===t?nc.dot+"60":tk.border}`, background:noticeForm.type===t?nc.bg:"transparent", color:noticeForm.type===t?nc.color:tk.textMuted, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize", transition:"all 0.15s" }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </Field>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button onClick={() => setShowNoticeModal(false)} style={{ flex:1, padding:"10px", borderRadius:10, background:"transparent", border:`1px solid ${tk.border}`, color:tk.textSub, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button className="cd-btn" onClick={addNotice} style={{ flex:2, padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Post Notice</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Task Modal ── */}
      {showTaskModal && (
        <Modal onClose={() => setShowTaskModal(false)} title="🎯 Assign New Task" accentColor={tk.acc}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Field label="Task Title"><input className="cd-inp" value={taskForm.title} onChange={e => setTaskForm(p=>({ ...p,title:e.target.value }))} placeholder="Describe the task..." style={iStyle} /></Field>
            <Field label="Assign To">
              <select className="cd-inp" value={taskForm.assignee} onChange={e => setTaskForm(p=>({ ...p,assignee:e.target.value }))} style={{ ...iStyle, cursor:"pointer", color:taskForm.assignee?tk.text:tk.textMuted }}>
                <option value="">Select employee...</option>
                {employees.map(e => <option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
              </select>
            </Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Priority">
                <div style={{ display:"flex", gap:6 }}>
                  {(["High","Medium","Low"] as TaskItem["priority"][]).map(p => {
                    const pcolors = { High:"#f43f5e", Medium:"#f59e0b", Low:"#10b981" };
                    const pc = pcolors[p];
                    return <button key={p} onClick={() => setTaskForm(prev=>({ ...prev,priority:p }))} style={{ flex:1, padding:"8px 4px", borderRadius:7, border:`1px solid ${taskForm.priority===p?pc+"60":tk.border}`, background:taskForm.priority===p?pc+"15":"transparent", color:taskForm.priority===p?pc:tk.textMuted, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>{p}</button>;
                  })}
                </div>
              </Field>
              <Field label="Due Date">
                <input className="cd-inp" type="date" value={taskForm.due} onChange={e => setTaskForm(p=>({ ...p,due:e.target.value }))} style={iStyle} />
              </Field>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button onClick={() => setShowTaskModal(false)} style={{ flex:1, padding:"10px", borderRadius:10, background:"transparent", border:`1px solid ${tk.border}`, color:tk.textSub, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button className="cd-btn" onClick={addTask} style={{ flex:2, padding:"10px", borderRadius:10, background:`linear-gradient(135deg,${tk.acc},${tk.accDark})`, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Assign Task</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}