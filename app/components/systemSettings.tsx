"use client";

import { useTheme } from "@/app/components/contexts/themeContext";
import React, { useState, useEffect } from "react";

// ─── Theme hook — identical to AdminDashboard's useT() ────────────────────────
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
    modalBg:     isDark ? "#090e18" : "#ffffff",
    toggleOff:   isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    toggleOffKnob: isDark ? "#475569" : "#94a3b8",
    backBtn:     isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
    acc:     "#f59e0b", accLight: "#fbbf24", accDark: "#d97706",
    accGlow: "rgba(245,158,11,0.3)",
    sec: "#8b5cf6", secGlow: "rgba(139,92,246,0.3)",
    success: "#10b981", danger: "#f43f5e", info: "#3b82f6", warn: "#f59e0b",
  };
}

type Tk = ReturnType<typeof useT>;

// ─── Types ────────────────────────────────────────────────────────────────────
type SettingSection =
  | "general" | "security" | "notifications" | "billing"
  | "integrations" | "appearance" | "api" | "backup";

interface Toggle { label: string; sub: string; value: boolean; accent?: string; }
interface NavItem { id: SettingSection; icon: string; label: string; badge?: string; }

// ─── Small helpers ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
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

// ─── Sub-components (all receive tk as prop) ──────────────────────────────────

function SLabel({ children, tk }: { children: React.ReactNode; tk: Tk }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"4px 0 14px" }}>
      <div style={{ width:3, height:13, borderRadius:99, background:`linear-gradient(180deg,${tk.acc},${tk.sec})` }} />
      <span style={{ fontSize:10, fontWeight:700, color:tk.textUpper, textTransform:"uppercase", letterSpacing:"0.12em" }}>{children}</span>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${tk.divider},transparent)` }} />
    </div>
  );
}

function ToggleSwitch({ on, onChange, accent, tk }: { on: boolean; onChange: (v: boolean) => void; accent: string; tk: Tk }) {
  return (
    <div onClick={() => onChange(!on)} style={{ width:44, height:24, borderRadius:99, background: on ? accent : tk.toggleOff, border:`1px solid ${on ? accent+"60" : tk.inputBorder}`, cursor:"pointer", position:"relative", transition:"all 0.25s", flexShrink:0, boxShadow: on ? `0 0 10px ${accent}50` : "none" }}>
      <div style={{ position:"absolute", top:3, left: on ? 22 : 3, width:16, height:16, borderRadius:"50%", background: on ? "#fff" : tk.toggleOffKnob, transition:"left 0.22s cubic-bezier(.34,1.56,.64,1)", boxShadow: on ? `0 2px 6px ${accent}80` : "none" }} />
    </div>
  );
}

function SettingRow({ label, sub, value, onChange, accent, tk }: Toggle & { onChange: (v:boolean)=>void; tk: Tk }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:`1px solid ${tk.divider}` }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:tk.text }}>{label}</div>
        <div style={{ fontSize:11, color:tk.textMuted, marginTop:2 }}>{sub}</div>
      </div>
      <ToggleSwitch on={value} onChange={onChange} accent={accent ?? tk.acc} tk={tk} />
    </div>
  );
}

function GCard({ children, style, accent, tk }: { children: React.ReactNode; style?: React.CSSProperties; accent?: string; tk: Tk }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:tk.surface, borderRadius:16, border:`1px solid ${hov && accent ? accent+"30" : tk.border}`, boxShadow: hov && accent ? `0 8px 40px ${accent}15` : tk.shadow, overflow:"hidden", transition:"all 0.2s ease", ...style }}>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type="text", placeholder="", hint="", tk }: { label:string; value:string; onChange:(v:string)=>void; type?:string; placeholder?:string; hint?:string; tk: Tk }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:11, color:tk.textUpper, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="ss-input"
        style={{ padding:"10px 14px", borderRadius:10, background:tk.inputBg, border:`1px solid ${tk.inputBorder}`, color:tk.text, fontSize:13, fontFamily:"inherit", outline:"none", width:"100%" }} />
      {hint && <div style={{ fontSize:10, color:tk.textMuted }}>{hint}</div>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, tk }: { label:string; value:string; onChange:(v:string)=>void; options:{value:string;label:string}[]; tk: Tk }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:11, color:tk.textUpper, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="ss-input"
        style={{ padding:"10px 14px", borderRadius:10, background:tk.inputBg, border:`1px solid ${tk.inputBorder}`, color:tk.text, fontSize:13, fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SaveBtn({ onClick, saving, label="Save Changes", tk }: { onClick:()=>void; saving:boolean; label?:string; tk: Tk }) {
  return (
    <button onClick={onClick} className="ss-btn"
      style={{ padding:"10px 24px", borderRadius:10, background:saving ? tk.textMuted : `linear-gradient(135deg,${tk.acc},${tk.accDark})`, border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:saving?"not-allowed":"pointer", fontFamily:"inherit", boxShadow:saving?"none":`0 0 20px ${tk.acc}40`, display:"flex", alignItems:"center", gap:8, transition:"all 0.18s" }}>
      {saving ? <><span style={{ width:13, height:13, border:"2px solid #fff4", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"ss-spin 0.7s linear infinite" }} /> Saving...</> : `✓ ${label}`}
    </button>
  );
}

function Toast({ msg, ok }: { msg:string; ok:boolean }) {
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:999, padding:"12px 20px", borderRadius:12, background:ok?"#10b981":"#f43f5e", color:"#fff", fontSize:13, fontWeight:700, boxShadow:`0 8px 32px ${ok?"#10b981":"#f43f5e"}60`, animation:"ss-up 0.25s ease" }}>
      {ok?"✓":"✗"} {msg}
    </div>
  );
}

function Badge({ label, color }: { label:string; color:string }) {
  return <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700, color, background:color+"18", border:`1px solid ${color}30`, whiteSpace:"nowrap" }}>{label}</span>;
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function GeneralSection({ onSave, tk }: { onSave:()=>void; tk: Tk }) {
  const [platform, setPlatform] = useState("WorkSphere");
  const [domain,   setDomain]   = useState("app.worksphere.io");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("en-IN");
  const [currency, setCurrency] = useState("INR");
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); await new Promise(r=>setTimeout(r,900)); setSaving(false); onSave(); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Platform Identity</SLabel>
      <GCard accent={tk.acc} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <InputField tk={tk} label="Platform Name" value={platform} onChange={setPlatform} placeholder="WorkSphere" hint="Shown in emails and UI headers" />
          <InputField tk={tk} label="Primary Domain" value={domain} onChange={setDomain} placeholder="app.worksphere.io" />
          <SelectField tk={tk} label="Default Timezone" value={timezone} onChange={setTimezone} options={[
            {value:"Asia/Kolkata",label:"Asia/Kolkata (IST)"},{value:"UTC",label:"UTC"},
            {value:"America/New_York",label:"America/New_York (EST)"},{value:"Europe/London",label:"Europe/London (GMT)"},
          ]} />
          <SelectField tk={tk} label="Default Language" value={language} onChange={setLanguage} options={[
            {value:"en-IN",label:"English (India)"},{value:"en-US",label:"English (US)"},{value:"hi",label:"हिन्दी"},
          ]} />
          <SelectField tk={tk} label="Currency" value={currency} onChange={setCurrency} options={[
            {value:"INR",label:"₹ Indian Rupee (INR)"},{value:"USD",label:"$ US Dollar (USD)"},{value:"EUR",label:"€ Euro (EUR)"},
          ]} />
          <InputField tk={tk} label="Support Email" value="support@worksphere.io" onChange={()=>{}} placeholder="support@company.com" />
        </div>
      </GCard>

      <SLabel tk={tk}>Platform Limits</SLabel>
      <GCard accent={tk.sec} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          <InputField tk={tk} label="Max Companies" value="500" onChange={()=>{}} type="number" hint="Set 0 for unlimited" />
          <InputField tk={tk} label="Max Users / Company" value="1000" onChange={()=>{}} type="number" />
          <InputField tk={tk} label="Session Timeout (min)" value="60" onChange={()=>{}} type="number" />
        </div>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

function SecuritySection({ onSave, tk }: { onSave:()=>void; tk: Tk }) {
  const [toggles, setToggles] = useState([
    { label:"Two-Factor Authentication (2FA)",    sub:"Require 2FA for all admin accounts",           value:true,  accent:tk.success },
    { label:"Force HTTPS",                        sub:"Redirect all HTTP traffic to HTTPS",           value:true,  accent:tk.success },
    { label:"IP Allowlist",                       sub:"Only allow logins from whitelisted IP ranges", value:false, accent:tk.acc    },
    { label:"Brute-force Protection",             sub:"Lock accounts after 5 failed login attempts",  value:true,  accent:tk.success },
    { label:"Audit Log Retention",                sub:"Retain admin audit logs for 365 days",         value:true,  accent:tk.info   },
    { label:"Auto-suspend Inactive Accounts",     sub:"Suspend company accounts inactive > 90 days", value:false, accent:tk.warn   },
    { label:"Encrypted Data at Rest",             sub:"AES-256 encryption for all stored data",      value:true,  accent:tk.success },
    { label:"GDPR Compliance Mode",               sub:"Enable GDPR-compliant data handling",         value:true,  accent:tk.info   },
  ]);
  const [saving, setSaving] = useState(false);
  const toggle = (i:number) => setToggles(p => p.map((t,j) => j===i ? {...t,value:!t.value} : t));
  const save = async () => { setSaving(true); await new Promise(r=>setTimeout(r,900)); setSaving(false); onSave(); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Security Policies</SLabel>
      <GCard accent={tk.danger} tk={tk} style={{ padding:"20px 22px" }}>
        {toggles.map((t,i) => <SettingRow key={i} {...t} onChange={v => toggle(i)} tk={tk} />)}
      </GCard>

      <SLabel tk={tk}>Password Policy</SLabel>
      <GCard accent={tk.warn} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          <InputField tk={tk} label="Min Password Length" value="12" onChange={()=>{}} type="number" />
          <InputField tk={tk} label="Password Expiry (days)" value="90" onChange={()=>{}} type="number" />
          <InputField tk={tk} label="Prevent Reuse (last N)" value="5" onChange={()=>{}} type="number" />
        </div>
        <div style={{ marginTop:16, display:"flex", gap:12 }}>
          {["Uppercase","Lowercase","Numbers","Symbols"].map((req,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px", borderRadius:8, background:`${tk.success}10`, border:`1px solid ${tk.success}25` }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:tk.success, display:"inline-block" }} />
              <span style={{ fontSize:11, color:tk.success, fontWeight:600 }}>{req}</span>
            </div>
          ))}
        </div>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

function NotificationsSection({ onSave, tk }: { onSave:()=>void; tk: Tk }) {
  const channels = [
    { label:"Email Notifications",   icon:"📧", active:true,  color:tk.info    },
    { label:"SMS / WhatsApp Alerts", icon:"💬", active:false, color:tk.success },
    { label:"In-App Notifications",  icon:"🔔", active:true,  color:tk.acc     },
    { label:"Webhook Push Events",   icon:"🪝", active:true,  color:tk.sec     },
    { label:"Slack Integration",     icon:"🟣", active:false, color:"#4A154B"  },
  ];
  const [evts, setEvts] = useState([
    {label:"New Company Registration",    value:true },
    {label:"Company Suspended / Deleted", value:true },
    {label:"Billing Failed",              value:true },
    {label:"Security Alert (new IP)",     value:true },
    {label:"System Metric Threshold Hit", value:false},
    {label:"Storage > 80% Used",          value:true },
    {label:"Support Ticket Opened",       value:false},
    {label:"Weekly Summary Report",       value:true },
  ]);
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); await new Promise(r=>setTimeout(r,900)); setSaving(false); onSave(); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Notification Channels</SLabel>
      <GCard accent={tk.info} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
          {channels.map((ch,i) => (
            <div key={i} style={{ borderRadius:12, border:`1px solid ${ch.active?ch.color+"40":tk.border}`, background:ch.active?ch.color+"0d":"transparent", padding:"14px 12px", textAlign:"center", cursor:"pointer", transition:"all 0.18s" }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{ch.icon}</div>
              <div style={{ fontSize:11, fontWeight:600, color:ch.active?tk.text:tk.textMuted }}>{ch.label}</div>
              <div style={{ marginTop:8, display:"flex", justifyContent:"center" }}>
                <Badge label={ch.active?"Active":"Disabled"} color={ch.active?tk.success:tk.textMuted} />
              </div>
            </div>
          ))}
        </div>
      </GCard>

      <SLabel tk={tk}>Event Triggers</SLabel>
      <GCard accent={tk.acc} tk={tk} style={{ padding:"20px 22px" }}>
        {evts.map((e,i) => (
          <SettingRow key={i} label={e.label} sub="Notify via all active channels when this event occurs" value={e.value}
            onChange={v => setEvts(p=>p.map((x,j)=>j===i?{...x,value:v}:x))} accent={tk.acc} tk={tk} />
        ))}
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

function BillingSection({ onSave, tk }: { onSave:()=>void; tk: Tk }) {
  const plans = [
    { name:"Starter",    price:"₹999",   period:"/mo", users:"Up to 50",  features:["Basic Analytics","Email Support","5 GB Storage"],        color:"#64748b", active:false },
    { name:"Pro",        price:"₹3,499", period:"/mo", users:"Up to 500", features:["Advanced Analytics","Priority Support","50 GB Storage"],  color:tk.sec,    active:true  },
    { name:"Enterprise", price:"Custom", period:"",    users:"Unlimited",  features:["Full Analytics","Dedicated Manager","Unlimited Storage"], color:tk.acc,    active:false },
  ];
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); await new Promise(r=>setTimeout(r,900)); setSaving(false); onSave(); };
  const revenue = useCountUp(284000);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Revenue Overview</SLabel>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          {label:"MRR",        value:`₹${(revenue/1000).toFixed(0)}K`, color:tk.acc,     icon:"💰"},
          {label:"ARR",        value:"₹34.1L",                         color:tk.success, icon:"📈"},
          {label:"Avg. Plan",  value:"₹2.9K",                          color:tk.sec,     icon:"📊"},
          {label:"Churn Rate", value:"2.1%",                           color:tk.danger,  icon:"📉"},
        ].map((s,i) => (
          <GCard key={i} accent={s.color} tk={tk} style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:10, color:tk.textUpper, textTransform:"uppercase", letterSpacing:"0.09em", fontWeight:700, marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:18, marginTop:4 }}>{s.icon}</div>
          </GCard>
        ))}
      </div>

      <SLabel tk={tk}>Subscription Plans</SLabel>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {plans.map((p,i) => (
          <GCard key={i} accent={p.color} tk={tk} style={{ padding:"20px 22px", position:"relative", overflow:"visible" }}>
            {p.active && <div style={{ position:"absolute", top:-10, right:16, background:`linear-gradient(135deg,${tk.acc},${tk.sec})`, color:"#fff", fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:20 }}>CURRENT</div>}
            <div style={{ fontSize:16, fontWeight:800, color:p.color, marginBottom:4 }}>{p.name}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:2, marginBottom:6 }}>
              <span style={{ fontSize:26, fontWeight:800, color:tk.text }}>{p.price}</span>
              <span style={{ fontSize:12, color:tk.textMuted }}>{p.period}</span>
            </div>
            <div style={{ fontSize:11, color:tk.textMuted, marginBottom:12 }}>{p.users} users</div>
            {p.features.map((f,j) => (
              <div key={j} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:tk.textSub, marginBottom:5 }}>
                <span style={{ color:p.color }}>✓</span> {f}
              </div>
            ))}
            <button style={{ marginTop:14, width:"100%", padding:"9px", borderRadius:9, background:p.active?`${p.color}18`:"transparent", border:`1px solid ${p.color}40`, color:p.color, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              {p.active ? "Current Plan" : "Switch Plan"}
            </button>
          </GCard>
        ))}
      </div>

      <SLabel tk={tk}>Payment Gateway</SLabel>
      <GCard accent={tk.success} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <SelectField tk={tk} label="Payment Gateway" value="razorpay" onChange={()=>{}} options={[
            {value:"razorpay",label:"Razorpay"},{value:"stripe",label:"Stripe"},{value:"paypal",label:"PayPal"},
          ]} />
          <InputField tk={tk} label="Gateway API Key" value="rzp_live_••••••••••••" onChange={()=>{}} type="password" />
          <InputField tk={tk} label="Webhook URL" value="https://app.worksphere.io/webhook/billing" onChange={()=>{}} />
          <SelectField tk={tk} label="Invoice Currency" value="INR" onChange={()=>{}} options={[
            {value:"INR",label:"₹ INR"},{value:"USD",label:"$ USD"},
          ]} />
        </div>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

function IntegrationsSection({ onSave, tk }: { onSave:()=>void; tk: Tk }) {
  const integrations = [
    { name:"Slack",         icon:"🟣", desc:"Team notifications and alerts",     status:"connected",    color:"#4A154B" },
    { name:"Google SSO",    icon:"🔵", desc:"Single Sign-On via Google OAuth",   status:"connected",    color:tk.info   },
    { name:"Microsoft 365", icon:"🟦", desc:"SSO + Calendar integration",        status:"disconnected", color:"#0078D4" },
    { name:"Salesforce",    icon:"☁️",  desc:"CRM data sync",                    status:"disconnected", color:"#00A1E0" },
    { name:"Zapier",        icon:"⚡", desc:"1000+ app automation workflows",    status:"connected",    color:"#FF4A00" },
    { name:"AWS S3",        icon:"🗂️", desc:"Cloud backup destination",          status:"connected",    color:"#FF9900" },
    { name:"Twilio",        icon:"📱", desc:"SMS & WhatsApp notifications",      status:"disconnected", color:tk.danger  },
    { name:"Stripe",        icon:"💳", desc:"Alternative payment gateway",       status:"disconnected", color:"#635BFF" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Connected Services</SLabel>
      <GCard accent={tk.sec} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {integrations.map((ig,i) => {
            const connected = ig.status === "connected";
            return (
              <div key={i} style={{ borderRadius:10, border:`1px solid ${ig.color}25`, background:`${ig.color}06`, padding:"14px 12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:`${ig.color}18`, border:`1px solid ${ig.color}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{ig.icon}</div>
                  <Badge label={connected?"Connected":"Disconnected"} color={connected?tk.success:tk.textMuted} />
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:tk.text, marginBottom:4 }}>{ig.name}</div>
                <div style={{ fontSize:11, color:tk.textMuted, marginBottom:14, lineHeight:1.5 }}>{ig.desc}</div>
                <button style={{ width:"100%", padding:"7px", borderRadius:8, background:connected?`${tk.danger}0a`:`${ig.color}0d`, border:`1px solid ${connected?tk.danger+"30":ig.color+"30"}`, color:connected?tk.danger:ig.color, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  {connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </GCard>

      <SLabel tk={tk}>Webhook Settings</SLabel>
      <GCard accent={tk.sec} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <InputField tk={tk} label="Global Webhook Endpoint" value="https://hooks.worksphere.io/global" onChange={()=>{}} hint="All events are POSTed here in JSON format" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <InputField tk={tk} label="Signing Secret" value="whsec_••••••••••••••••" onChange={()=>{}} type="password" />
            <SelectField tk={tk} label="Retry Policy" value="3x" onChange={()=>{}} options={[
              {value:"1x",label:"Retry once"},{value:"3x",label:"Retry 3 times (recommended)"},{value:"5x",label:"Retry 5 times"},
            ]} />
          </div>
        </div>
      </GCard>
    </div>
  );
}

function AppearanceSection({ onSave, tk }: { onSave:()=>void; tk: Tk }) {
  const { isDark } = useTheme();
  const [themeMode, setThemeMode] = useState<"dark"|"light"|"system">(isDark ? "dark" : "light");
  const [accent, setAccent] = useState("#f59e0b");
  const [density, setDensity] = useState<"compact"|"normal"|"relaxed">("normal");
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); await new Promise(r=>setTimeout(r,900)); setSaving(false); onSave(); };
  const accents = ["#f59e0b","#8b5cf6","#3b82f6","#10b981","#f43f5e","#06b6d4","#ec4899","#84cc16"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Theme</SLabel>
      <GCard accent={tk.acc} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", gap:12 }}>
          {([['dark','🌑','Dark'],['light','☀️','Light'],['system','💻','System']] as const).map(([id,icon,label]) => {
            const isActive = themeMode === id;
            return (
              <button key={id}
                onClick={() => setThemeMode(id)}
                style={{ flex:1, padding:"16px 10px", borderRadius:12, border:`1px solid ${isActive?tk.acc+"50":tk.border}`, background:isActive?`${tk.acc}10`:"transparent", color:isActive?tk.acc:tk.textSub, cursor:"pointer", fontFamily:"inherit", transition:"all 0.18s" }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
                <div style={{ fontSize:12, fontWeight:700 }}>{label}</div>
              </button>
            );
          })}
        </div>
      </GCard>

      <SLabel tk={tk}>Accent Color</SLabel>
      <GCard tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {accents.map(c => (
            <div key={c} onClick={() => setAccent(c)}
              style={{ width:36, height:36, borderRadius:"50%", background:c, cursor:"pointer", border:`3px solid ${accent===c?"#fff":"transparent"}`, boxShadow:accent===c?`0 0 12px ${c}80`:"none", transition:"all 0.18s" }} />
          ))}
        </div>
        <div style={{ marginTop:14, padding:"10px 14px", borderRadius:9, background:`${accent}10`, border:`1px solid ${accent}28`, fontSize:12, color:accent, fontWeight:600 }}>
          Preview: Accent set to {accent}
        </div>
      </GCard>

      <SLabel tk={tk}>Display Density</SLabel>
      <GCard tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", gap:12 }}>
          {(["compact","normal","relaxed"] as const).map(d => (
            <button key={d} onClick={() => setDensity(d)}
              style={{ flex:1, padding:"12px", borderRadius:10, border:`1px solid ${density===d?tk.sec+"50":tk.border}`, background:density===d?`${tk.sec}10`:"transparent", color:density===d?tk.sec:tk.textSub, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:700, textTransform:"capitalize" }}>
              {d==="compact"?"▣ Compact":d==="normal"?"▤ Normal":"▥ Relaxed"}
            </button>
          ))}
        </div>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

function ApiSection({ onSave, tk }: { onSave:()=>void; tk: Tk }) {
  const [showKey, setShowKey] = useState(false);
  const keys = [
    { name:"Production Key",  key:"wsp_live_sk_••••••••••••••••••••", created:"Jan 12, 2025", last:"2 min ago",   color:tk.success },
    { name:"Development Key", key:"wsp_test_sk_••••••••••••••••••••", created:"Mar 1, 2025",  last:"1 day ago",   color:tk.info   },
    { name:"CI/CD Key",       key:"wsp_ci_sk_••••••••••••••••••••",   created:"Apr 5, 2025",  last:"3 hours ago", color:tk.acc    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>API Keys</SLabel>
      <GCard accent={tk.acc} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:12, color:tk.textMuted }}>Manage API credentials for platform integrations</div>
          <button style={{ padding:"7px 14px", borderRadius:8, background:`linear-gradient(135deg,${tk.acc},${tk.accDark})`, border:"none", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            + Generate Key
          </button>
        </div>
        {keys.map((k,i) => (
          <div key={i} style={{ padding:"13px", borderRadius:9, background:tk.inputBg, border:`1px solid ${tk.border}`, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:k.color }}>{k.name}</span>
                <Badge label="Active" color={tk.success} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setShowKey(p=>!p)} style={{ fontSize:10, padding:"3px 9px", borderRadius:6, border:`1px solid ${tk.border}`, background:"transparent", color:tk.textSub, cursor:"pointer", fontFamily:"inherit" }}>
                  {showKey?"Hide":"Reveal"}
                </button>
                <button style={{ fontSize:10, padding:"3px 9px", borderRadius:6, border:`1px solid ${tk.danger}28`, background:`${tk.danger}08`, color:tk.danger, cursor:"pointer", fontFamily:"inherit" }}>
                  Revoke
                </button>
              </div>
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:tk.textMuted, background:tk.bg, padding:"8px 12px", borderRadius:7, border:`1px solid ${tk.border}` }}>
              {showKey ? k.key.replace(/•/g,"x") : k.key}
            </div>
            <div style={{ display:"flex", gap:16, marginTop:8, fontSize:10, color:tk.textMuted }}>
              <span>Created: {k.created}</span><span>Last used: {k.last}</span>
            </div>
          </div>
        ))}
      </GCard>

      <SLabel tk={tk}>Rate Limiting</SLabel>
      <GCard accent={tk.sec} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          <InputField tk={tk} label="Req / Minute (per key)" value="1000" onChange={()=>{}} type="number" />
          <InputField tk={tk} label="Req / Hour (per key)" value="30000" onChange={()=>{}} type="number" />
          <InputField tk={tk} label="Burst Limit" value="200" onChange={()=>{}} type="number" hint="Max req in 1-second burst" />
        </div>
      </GCard>
    </div>
  );
}

function BackupSection({ onSave, tk }: { onSave:()=>void; tk: Tk }) {
  const backups = [
    { date:"Apr 25, 2026 02:00 AM", size:"2.4 GB", type:"Automatic", status:"success" },
    { date:"Apr 24, 2026 02:00 AM", size:"2.3 GB", type:"Automatic", status:"success" },
    { date:"Apr 23, 2026 02:00 AM", size:"2.3 GB", type:"Automatic", status:"success" },
    { date:"Apr 22, 2026 11:30 AM", size:"2.1 GB", type:"Manual",    status:"success" },
    { date:"Apr 21, 2026 02:00 AM", size:"2.0 GB", type:"Automatic", status:"failed"  },
  ];
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); await new Promise(r=>setTimeout(r,900)); setSaving(false); onSave(); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Backup Configuration</SLabel>
      <GCard accent={tk.info} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <SelectField tk={tk} label="Backup Frequency" value="daily" onChange={()=>{}} options={[
            {value:"hourly",label:"Hourly"},{value:"daily",label:"Daily (Recommended)"},{value:"weekly",label:"Weekly"},
          ]} />
          <SelectField tk={tk} label="Retention Period" value="30d" onChange={()=>{}} options={[
            {value:"7d",label:"7 Days"},{value:"30d",label:"30 Days"},{value:"90d",label:"90 Days"},{value:"1y",label:"1 Year"},
          ]} />
          <InputField tk={tk} label="Backup Destination" value="s3://worksphere-backups/prod" onChange={()=>{}} />
          <InputField tk={tk} label="Encryption Key ID" value="aws/kms/wsp-backup-2025" onChange={()=>{}} />
        </div>
        <div style={{ marginTop:14, display:"flex", gap:10 }}>
          <button style={{ padding:"8px 16px", borderRadius:8, background:`${tk.info}12`, border:`1px solid ${tk.info}28`, color:tk.info, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            🔄 Run Backup Now
          </button>
          <button style={{ padding:"8px 16px", borderRadius:8, background:`${tk.success}10`, border:`1px solid ${tk.success}28`, color:tk.success, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            ✓ Verify Latest Backup
          </button>
        </div>
      </GCard>

      <SLabel tk={tk}>Backup History</SLabel>
      <GCard tk={tk} style={{ padding:"20px 22px" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${tk.divider}` }}>
              {["Date & Time","Size","Type","Status","Action"].map(h => (
                <th key={h} style={{ padding:"9px 12px", fontSize:10, fontWeight:700, color:tk.textUpper, textTransform:"uppercase", letterSpacing:"0.08em", textAlign:"left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {backups.map((b,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${tk.divider}` }}>
                <td style={{ padding:"10px 12px", fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:tk.textSub }}>{b.date}</td>
                <td style={{ padding:"10px 12px", fontSize:11, color:tk.text, fontWeight:600 }}>{b.size}</td>
                <td style={{ padding:"10px 12px" }}><Badge label={b.type} color={b.type==="Manual"?tk.acc:tk.info} /></td>
                <td style={{ padding:"10px 12px" }}><Badge label={b.status==="success"?"Success":"Failed"} color={b.status==="success"?tk.success:tk.danger} /></td>
                <td style={{ padding:"10px 12px" }}>
                  {b.status==="success" && (
                    <button style={{ fontSize:11, padding:"4px 10px", borderRadius:6, border:`1px solid ${tk.border}`, background:"transparent", color:tk.textSub, cursor:"pointer", fontFamily:"inherit" }}>
                      ⬇ Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SystemSettings({ onBack }: { onBack?: () => void }) {
  const tk = useT(); // ← reactive — updates on every theme change
  const [activeSection, setActiveSection] = useState<SettingSection>("general");
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);

  const showToast = (msg:string, ok:boolean) => {
    setToast({msg,ok});
    setTimeout(() => setToast(null), 3000);
  };

  const navItems: NavItem[] = [
    { id:"general",       icon:"⚙️",  label:"General"          },
    { id:"security",      icon:"🔐",  label:"Security",   badge:"3 alerts"  },
    { id:"notifications", icon:"🔔",  label:"Notifications"    },
    { id:"billing",       icon:"💰",  label:"Billing"          },
    { id:"integrations",  icon:"🔗",  label:"Integrations", badge:"5 active" },
    { id:"appearance",    icon:"🎨",  label:"Appearance"       },
    { id:"api",           icon:"📡",  label:"API & Keys"       },
    { id:"backup",        icon:"💾",  label:"Backup & Restore" },
  ];

  // Pass tk down to every section so they re-render when theme changes
  const sectionContent: Record<SettingSection, React.ReactNode> = {
    general:       <GeneralSection       tk={tk} onSave={() => showToast("General settings saved", true)} />,
    security:      <SecuritySection      tk={tk} onSave={() => showToast("Security settings updated", true)} />,
    notifications: <NotificationsSection tk={tk} onSave={() => showToast("Notification preferences saved", true)} />,
    billing:       <BillingSection       tk={tk} onSave={() => showToast("Billing settings saved", true)} />,
    integrations:  <IntegrationsSection  tk={tk} onSave={() => showToast("Integrations updated", true)} />,
    appearance:    <AppearanceSection    tk={tk} onSave={() => showToast("Appearance settings applied", true)} />,
    api:           <ApiSection           tk={tk} onSave={() => showToast("API settings saved", true)} />,
    backup:        <BackupSection        tk={tk} onSave={() => showToast("Backup config saved", true)} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .ss-root * { box-sizing:border-box; }
        .ss-root { font-family:'Outfit',sans-serif; }
        @keyframes ss-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes ss-fade { from{opacity:0} to{opacity:1} }
        @keyframes ss-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .ss-nav-btn { transition:all 0.18s; cursor:pointer; }
        .ss-nav-btn:hover { background:rgba(245,158,11,0.05) !important; }
        .ss-btn { transition:all 0.18s; cursor:pointer; }
        .ss-btn:hover { opacity:0.88; transform:translateY(-1px); }
        .ss-input:focus { outline:none; border-color:#f59e0b !important; box-shadow:0 0 0 3px rgba(245,158,11,0.12) !important; }
        .ss-a1{animation:ss-up .4s ease both .05s}
        .ss-a2{animation:ss-up .4s ease both .10s}
        .ss-a3{animation:ss-up .4s ease both .15s}
      `}</style>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div className="ss-root" style={{ background:tk.bg, minHeight:"100%", display:"flex", flexDirection:"column", padding:"24px 24px 36px", gap:20, transition:"background 0.3s" }}>

        {/* ── Header ── */}
        <div className="ss-a1" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {onBack && (
              <button onClick={onBack} className="ss-btn"
                style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, background:tk.backBtn, border:`1px solid ${tk.border}`, color:tk.textSub, fontSize:12, fontWeight:600, fontFamily:"inherit" }}>
                ← Back
              </button>
            )}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:tk.sec, boxShadow:`0 0 10px ${tk.sec}` }} />
                <div style={{ fontSize:22, fontWeight:800, color:tk.text, letterSpacing:"-0.3px" }}>
                  System <span style={{ color:tk.sec }}>Settings</span>
                </div>
              </div>
              <div style={{ fontSize:12, color:tk.textMuted, marginTop:4 }}>
                WorkSphere Platform — Configure system-wide preferences and policies
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ fontSize:11, padding:"5px 12px", borderRadius:8, background:`${tk.success}10`, border:`1px solid ${tk.success}25`, color:tk.success, fontWeight:700 }}>
              🟢 All Systems Operational
            </div>
            <div style={{ fontSize:11, padding:"5px 12px", borderRadius:8, background:`${tk.acc}10`, border:`1px solid ${tk.acc}25`, color:tk.acc, fontWeight:700 }}>
              v2.4.1 · WorkSphere
            </div>
          </div>
        </div>

        {/* ── Body: Sidebar + Content ── */}
        <div className="ss-a2" style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16, alignItems:"start" }}>

          {/* Sidebar */}
          <div style={{ background:tk.surface, borderRadius:16, border:`1px solid ${tk.border}`, overflow:"hidden", boxShadow:tk.shadow, position:"sticky", top:24 }}>
            <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${tk.divider}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:tk.textUpper, textTransform:"uppercase", letterSpacing:"0.1em" }}>Settings Menu</div>
            </div>
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button key={item.id} className="ss-nav-btn" onClick={() => setActiveSection(item.id)}
                  style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 16px", background: isActive ? `linear-gradient(90deg,${tk.sec}12,${tk.acc}08)` : "transparent", border:"none", borderLeft:`3px solid ${isActive?tk.sec:"transparent"}`, cursor:"pointer", fontFamily:"inherit", transition:"all 0.18s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <span style={{ fontSize:15 }}>{item.icon}</span>
                    <span style={{ fontSize:12, fontWeight: isActive ? 700 : 500, color: isActive ? tk.text : tk.textSub }}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{ fontSize:9, padding:"2px 6px", borderRadius:20, background:`${tk.acc}15`, color:tk.acc, fontWeight:700, whiteSpace:"nowrap" }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
            <div style={{ padding:"12px 16px", borderTop:`1px solid ${tk.divider}`, marginTop:4 }}>
              <button style={{ width:"100%", padding:"9px", borderRadius:9, background:`${tk.danger}10`, border:`1px solid ${tk.danger}25`, color:tk.danger, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                🗑️ Reset All Settings
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="ss-a3" key={activeSection} style={{ animation:"ss-up 0.3s ease both" }}>
            {sectionContent[activeSection]}
          </div>
        </div>
      </div>
    </>
  );
}