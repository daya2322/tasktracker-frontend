"use client";

import { useTheme } from "@/app/components/contexts/themeContext";
import React, { useState, useEffect } from "react";
import {
  getGeneralSettingsApi, updateGeneralSettingsApi,
  getSecuritySettingsApi, updateSecuritySettingsApi,
  getNotificationSettingsApi, updateNotificationSettingsApi,
  getBillingOverviewApi, getBillingGatewayApi, updateBillingGatewayApi,
  getIntegrationsApi, toggleIntegrationApi, getWebhookSettingsApi, updateWebhookSettingsApi,
  getAppearanceSettingsApi, updateAppearanceSettingsApi,
  getApiKeysApi, generateApiKeyApi, revokeApiKeyApi, getRateLimitsApi, updateRateLimitsApi,
  getBackupConfigApi, updateBackupConfigApi, getBackupHistoryApi, runBackupApi, verifyBackupApi,
  resetAllSettingsApi,
} from "@/app/services/allApi";
import type {
  BillingOverview, BillingGateway, Integration,
  NotificationChannel, NotificationEvent,
  ApiKey, BackupHistoryEntry, WebhookSettings,
} from "@/app/services/allApi";

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

type ResultCb = (msg: string, ok: boolean) => void;

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
    <button onClick={onClick} className="ss-btn" disabled={saving}
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

function SectionLoading({ tk }: { tk: Tk }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"60px 0", color:tk.textMuted, fontSize:13 }}>
      <span style={{ width:16, height:16, border:`2px solid ${tk.textMuted}40`, borderTop:`2px solid ${tk.acc}`, borderRadius:"50%", display:"inline-block", animation:"ss-spin 0.7s linear infinite", marginRight:10 }} />
      Loading…
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function GeneralSection({ onResult, tk }: { onResult: ResultCb; tk: Tk }) {
  const [platform, setPlatform] = useState("");
  const [domain, setDomain] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("en-IN");
  const [currency, setCurrency] = useState("INR");
  const [supportEmail, setSupportEmail] = useState("");
  const [maxCompanies, setMaxCompanies] = useState("");
  const [maxUsers, setMaxUsers] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getGeneralSettingsApi();
      if (!res.error && res.data?.status) {
        const d = res.data.data || {};
        setPlatform(String(d.platform_name ?? "WorkSphere"));
        setDomain(String(d.primary_domain ?? "app.worksphere.io"));
        setTimezone(String(d.default_timezone ?? "Asia/Kolkata"));
        setLanguage(String(d.default_language ?? "en-IN"));
        setCurrency(String(d.currency ?? "INR"));
        setSupportEmail(String(d.support_email ?? ""));
        setMaxCompanies(String(d.max_companies ?? ""));
        setMaxUsers(String(d.max_users_per_co ?? ""));
        setSessionTimeout(String(d.session_timeout_min ?? ""));
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await updateGeneralSettingsApi({
      platform_name: platform,
      primary_domain: domain,
      default_timezone: timezone,
      default_language: language,
      currency,
      support_email: supportEmail,
      max_companies: maxCompanies,
      max_users_per_co: maxUsers,
      session_timeout_min: sessionTimeout,
    });
    setSaving(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to save general settings", false);
    } else {
      onResult(res.data.message || "General settings saved", true);
    }
  };

  if (loading) return <SectionLoading tk={tk} />;

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
          <InputField tk={tk} label="Support Email" value={supportEmail} onChange={setSupportEmail} placeholder="support@company.com" />
        </div>
      </GCard>

      <SLabel tk={tk}>Platform Limits</SLabel>
      <GCard accent={tk.sec} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          <InputField tk={tk} label="Max Companies" value={maxCompanies} onChange={setMaxCompanies} type="number" hint="Set 0 for unlimited" />
          <InputField tk={tk} label="Max Users / Company" value={maxUsers} onChange={setMaxUsers} type="number" />
          <InputField tk={tk} label="Session Timeout (min)" value={sessionTimeout} onChange={setSessionTimeout} type="number" />
        </div>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

function SecuritySection({ onResult, tk }: { onResult: ResultCb; tk: Tk }) {
  type SecKey =
    | "two_factor_auth" | "force_https" | "ip_allowlist"
    | "brute_force_protection" | "audit_log_retention" | "auto_suspend_inactive"
    | "encrypted_data_at_rest" | "gdpr_compliance_mode";

  const TOGGLE_DEFS: { key: SecKey; label: string; sub: string; accent: string }[] = [
    { key:"two_factor_auth",        label:"Two-Factor Authentication (2FA)", sub:"Require 2FA for all admin accounts",            accent: tk.success },
    { key:"force_https",            label:"Force HTTPS",                      sub:"Redirect all HTTP traffic to HTTPS",            accent: tk.success },
    { key:"ip_allowlist",           label:"IP Allowlist",                     sub:"Only allow logins from whitelisted IP ranges",  accent: tk.acc     },
    { key:"brute_force_protection", label:"Brute-force Protection",           sub:"Lock accounts after 5 failed login attempts",   accent: tk.success },
    { key:"audit_log_retention",    label:"Audit Log Retention",              sub:"Retain admin audit logs for 365 days",          accent: tk.info    },
    { key:"auto_suspend_inactive",  label:"Auto-suspend Inactive Accounts",   sub:"Suspend company accounts inactive > 90 days",   accent: tk.warn    },
    { key:"encrypted_data_at_rest", label:"Encrypted Data at Rest",           sub:"AES-256 encryption for all stored data",        accent: tk.success },
    { key:"gdpr_compliance_mode",   label:"GDPR Compliance Mode",             sub:"Enable GDPR-compliant data handling",           accent: tk.info    },
  ];

  const [vals, setVals] = useState<Record<SecKey, boolean>>({
    two_factor_auth:false, force_https:false, ip_allowlist:false,
    brute_force_protection:false, audit_log_retention:false, auto_suspend_inactive:false,
    encrypted_data_at_rest:false, gdpr_compliance_mode:false,
  });
  const [minLen, setMinLen] = useState("");
  const [expDays, setExpDays] = useState("");
  const [reuse, setReuse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getSecuritySettingsApi();
      if (!res.error && res.data?.status && res.data.data) {
        const d = res.data.data;
        setVals({
          two_factor_auth: !!Number(d.two_factor_auth),
          force_https: !!Number(d.force_https),
          ip_allowlist: !!Number(d.ip_allowlist),
          brute_force_protection: !!Number(d.brute_force_protection),
          audit_log_retention: !!Number(d.audit_log_retention),
          auto_suspend_inactive: !!Number(d.auto_suspend_inactive),
          encrypted_data_at_rest: !!Number(d.encrypted_data_at_rest),
          gdpr_compliance_mode: !!Number(d.gdpr_compliance_mode),
        });
        setMinLen(String(d.min_password_length ?? ""));
        setExpDays(String(d.password_expiry_days ?? ""));
        setReuse(String(d.prevent_reuse_count ?? ""));
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload: Record<string, number> = {
      ...Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, v ? 1 : 0])),
      min_password_length: Number(minLen) || 0,
      password_expiry_days: Number(expDays) || 0,
      prevent_reuse_count: Number(reuse) || 0,
    };
    const res = await updateSecuritySettingsApi(payload as never);
    setSaving(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to save security settings", false);
    } else {
      onResult(res.data.message || "Security settings updated", true);
    }
  };

  if (loading) return <SectionLoading tk={tk} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Security Policies</SLabel>
      <GCard accent={tk.danger} tk={tk} style={{ padding:"20px 22px" }}>
        {TOGGLE_DEFS.map(t => (
          <SettingRow key={t.key} label={t.label} sub={t.sub} value={vals[t.key]} accent={t.accent}
            onChange={v => setVals(p => ({ ...p, [t.key]: v }))} tk={tk} />
        ))}
      </GCard>

      <SLabel tk={tk}>Password Policy</SLabel>
      <GCard accent={tk.warn} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          <InputField tk={tk} label="Min Password Length" value={minLen} onChange={setMinLen} type="number" />
          <InputField tk={tk} label="Password Expiry (days)" value={expDays} onChange={setExpDays} type="number" />
          <InputField tk={tk} label="Prevent Reuse (last N)" value={reuse} onChange={setReuse} type="number" />
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

function NotificationsSection({ onResult, tk }: { onResult: ResultCb; tk: Tk }) {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getNotificationSettingsApi();
      if (!res.error && res.data?.status && res.data.data) {
        setChannels(res.data.data.channels ?? []);
        setEvents(res.data.data.events ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const toggleChannel = (id: number) => {
    setChannels(p => p.map(c => c.id === id ? { ...c, is_active: c.is_active ? 0 : 1 } : c));
  };
  const toggleEvent = (id: number) => {
    setEvents(p => p.map(e => e.id === id ? { ...e, is_active: e.is_active ? 0 : 1 } : e));
  };

  const save = async () => {
    setSaving(true);
    const res = await updateNotificationSettingsApi({
      channels: channels.map(c => ({ id: c.id, is_active: c.is_active })),
      events: events.map(e => ({ id: e.id, is_active: e.is_active })),
    });
    setSaving(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to save notification settings", false);
    } else {
      onResult(res.data.message || "Notification preferences saved", true);
    }
  };

  if (loading) return <SectionLoading tk={tk} />;

  const channelCols = Math.max(channels.length, 1);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Notification Channels</SLabel>
      <GCard accent={tk.info} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${channelCols},1fr)`, gap:10 }}>
          {channels.map((ch) => {
            const active = !!Number(ch.is_active);
            const color = ch.color || tk.info;
            return (
              <div key={ch.id} onClick={() => toggleChannel(ch.id)}
                style={{ borderRadius:12, border:`1px solid ${active?color+"40":tk.border}`, background:active?color+"0d":"transparent", padding:"14px 12px", textAlign:"center", cursor:"pointer", transition:"all 0.18s" }}>
                <div style={{ fontSize:22, marginBottom:8 }}>{ch.icon}</div>
                <div style={{ fontSize:11, fontWeight:600, color:active?tk.text:tk.textMuted }}>{ch.label}</div>
                <div style={{ marginTop:8, display:"flex", justifyContent:"center" }}>
                  <Badge label={active?"Active":"Disabled"} color={active?tk.success:tk.textMuted} />
                </div>
              </div>
            );
          })}
          {channels.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", color:tk.textMuted, fontSize:12, padding:20 }}>No channels configured.</div>}
        </div>
      </GCard>

      <SLabel tk={tk}>Event Triggers</SLabel>
      <GCard accent={tk.acc} tk={tk} style={{ padding:"20px 22px" }}>
        {events.map((ev) => (
          <SettingRow key={ev.id} label={ev.label} sub="Notify via all active channels when this event occurs"
            value={!!Number(ev.is_active)} onChange={() => toggleEvent(ev.id)} accent={tk.acc} tk={tk} />
        ))}
        {events.length === 0 && <div style={{ textAlign:"center", color:tk.textMuted, fontSize:12, padding:20 }}>No event triggers configured.</div>}
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

function BillingSection({ onResult, tk }: { onResult: ResultCb; tk: Tk }) {
  // TODO: wire when /plans endpoint exists. For now plans are static.
  const plans = [
    { name:"Starter",    price:"₹999",   period:"/mo", users:"Up to 50",  features:["Basic Analytics","Email Support","5 GB Storage"],        color:"#64748b", active:false },
    { name:"Pro",        price:"₹3,499", period:"/mo", users:"Up to 500", features:["Advanced Analytics","Priority Support","50 GB Storage"],  color:tk.sec,    active:true  },
    { name:"Enterprise", price:"Custom",      period:"",    users:"Unlimited",  features:["Full Analytics","Dedicated Manager","Unlimited Storage"], color:tk.acc,    active:false },
  ];

  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [gateway, setGateway] = useState("razorpay");
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [invoiceCurrency, setInvoiceCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const animatedMrr = useCountUp(overview?.mrr ?? 0);

  useEffect(() => {
    (async () => {
      const [ov, gw] = await Promise.all([getBillingOverviewApi(), getBillingGatewayApi()]);
      if (!ov.error && ov.data?.status) setOverview(ov.data.data);
      if (!gw.error && gw.data?.status && gw.data.data) {
        const g = gw.data.data;
        setGateway(g.gateway ?? "razorpay");
        setApiKey(""); // server returns masked; keep blank for "no change"
        setWebhookUrl(g.webhook_url ?? "");
        setInvoiceCurrency(g.invoice_currency ?? "INR");
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload: Partial<BillingGateway> = {
      gateway,
      webhook_url: webhookUrl,
      invoice_currency: invoiceCurrency,
    };
    if (apiKey) payload.gateway_api_key = apiKey;
    const res = await updateBillingGatewayApi(payload);
    setSaving(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to save billing settings", false);
    } else {
      onResult(res.data.message || "Billing settings saved", true);
      setApiKey("");
    }
  };

  if (loading) return <SectionLoading tk={tk} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Revenue Overview</SLabel>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          {label:"MRR",        value:`₹${(animatedMrr/1000).toFixed(0)}K`,                color:tk.acc,     icon:"💰"},
          {label:"ARR",        value:`₹${((overview?.arr ?? 0)/100000).toFixed(1)}L`,     color:tk.success, icon:"📈"},
          {label:"Avg. Plan",  value:`₹${((overview?.avg_plan ?? 0)/1000).toFixed(1)}K`,  color:tk.sec,     icon:"📊"},
          {label:"Churn Rate", value:`${overview?.churn_rate ?? "0.0"}%`,                       color:tk.danger,  icon:"📉"},
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
            <button disabled style={{ marginTop:14, width:"100%", padding:"9px", borderRadius:9, background:p.active?`${p.color}18`:"transparent", border:`1px solid ${p.color}40`, color:p.color, fontSize:12, fontWeight:700, cursor:"not-allowed", fontFamily:"inherit", opacity:0.7 }}>
              {p.active ? "Current Plan" : "Switch Plan"}
            </button>
          </GCard>
        ))}
      </div>

      <SLabel tk={tk}>Payment Gateway</SLabel>
      <GCard accent={tk.success} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <SelectField tk={tk} label="Payment Gateway" value={gateway} onChange={setGateway} options={[
            {value:"razorpay",label:"Razorpay"},{value:"stripe",label:"Stripe"},{value:"paypal",label:"PayPal"},
          ]} />
          <InputField tk={tk} label="Gateway API Key" value={apiKey} onChange={setApiKey} type="password" placeholder="••••••••••••" hint="Leave blank to keep existing key" />
          <InputField tk={tk} label="Webhook URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://app.worksphere.io/webhook/billing" />
          <SelectField tk={tk} label="Invoice Currency" value={invoiceCurrency} onChange={setInvoiceCurrency} options={[
            {value:"INR",label:"₹ INR"},{value:"USD",label:"$ USD"},
          ]} />
        </div>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

function IntegrationsSection({ onResult, tk }: { onResult: ResultCb; tk: Tk }) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [endpoint, setEndpoint] = useState("");
  const [signingSecret, setSigningSecret] = useState("");
  const [retryPolicy, setRetryPolicy] = useState("3x");
  const [loading, setLoading] = useState(true);
  const [savingHook, setSavingHook] = useState(false);
  const [togglingName, setTogglingName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [list, hook] = await Promise.all([getIntegrationsApi(), getWebhookSettingsApi()]);
      if (!list.error && list.data?.status) setIntegrations(list.data.data ?? []);
      if (!hook.error && hook.data?.status && hook.data.data) {
        const h = hook.data.data;
        setEndpoint(h.endpoint_url ?? "");
        setSigningSecret(""); // arrives masked; blank means "no change"
        setRetryPolicy(h.retry_policy ?? "3x");
      }
      setLoading(false);
    })();
  }, []);

  const flip = (status: Integration["status"]): Integration["status"] =>
    status === "connected" ? "disconnected" : "connected";

  const toggle = async (name: string) => {
    setTogglingName(name);
    setIntegrations(p => p.map(i => i.name === name ? { ...i, status: flip(i.status) } : i));
    const res = await toggleIntegrationApi(name);
    if (res.error || !res.data?.status) {
      // Revert optimistic update
      setIntegrations(p => p.map(i => i.name === name ? { ...i, status: flip(i.status) } : i));
      onResult(res.data?.message || "Failed to toggle integration", false);
    } else {
      onResult(res.data.message || "Integration updated", true);
    }
    setTogglingName(null);
  };

  const saveHook = async () => {
    setSavingHook(true);
    const payload: Partial<WebhookSettings> = {
      endpoint_url: endpoint,
      retry_policy: retryPolicy,
    };
    if (signingSecret) payload.signing_secret = signingSecret;
    const res = await updateWebhookSettingsApi(payload);
    setSavingHook(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to save webhook settings", false);
    } else {
      onResult(res.data.message || "Webhook settings saved", true);
      setSigningSecret("");
    }
  };

  if (loading) return <SectionLoading tk={tk} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Connected Services</SLabel>
      <GCard accent={tk.sec} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {integrations.map((ig) => {
            const connected = ig.status === "connected";
            const color = ig.color || tk.sec;
            const busy = togglingName === ig.name;
            return (
              <div key={ig.id} style={{ borderRadius:10, border:`1px solid ${color}25`, background:`${color}06`, padding:"14px 12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:`${color}18`, border:`1px solid ${color}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{ig.icon}</div>
                  <Badge label={connected?"Connected":"Disconnected"} color={connected?tk.success:tk.textMuted} />
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:tk.text, marginBottom:4 }}>{ig.label || ig.name}</div>
                <div style={{ fontSize:11, color:tk.textMuted, marginBottom:14, lineHeight:1.5 }}>{ig.description}</div>
                <button onClick={() => toggle(ig.name)} disabled={busy}
                  style={{ width:"100%", padding:"7px", borderRadius:8, background:connected?`${tk.danger}0a`:`${color}0d`, border:`1px solid ${connected?tk.danger+"30":color+"30"}`, color:connected?tk.danger:color, fontSize:11, fontWeight:700, cursor:busy?"not-allowed":"pointer", fontFamily:"inherit", opacity:busy?0.6:1 }}>
                  {busy ? "Working…" : connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
          {integrations.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", color:tk.textMuted, fontSize:12, padding:20 }}>No integrations configured.</div>}
        </div>
      </GCard>

      <SLabel tk={tk}>Webhook Settings</SLabel>
      <GCard accent={tk.sec} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <InputField tk={tk} label="Global Webhook Endpoint" value={endpoint} onChange={setEndpoint} placeholder="https://hooks.worksphere.io/global" hint="All events are POSTed here in JSON format" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <InputField tk={tk} label="Signing Secret" value={signingSecret} onChange={setSigningSecret} type="password" placeholder="whsec_••••••••••••••••" hint="Leave blank to keep existing secret" />
            <SelectField tk={tk} label="Retry Policy" value={retryPolicy} onChange={setRetryPolicy} options={[
              {value:"1x",label:"Retry once"},{value:"3x",label:"Retry 3 times (recommended)"},{value:"5x",label:"Retry 5 times"},
            ]} />
          </div>
        </div>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={saveHook} saving={savingHook} label="Save Webhook" /></div>
    </div>
  );
}

function AppearanceSection({ onResult, tk }: { onResult: ResultCb; tk: Tk }) {
  const { isDark } = useTheme();
  const [themeMode, setThemeMode] = useState<"dark"|"light"|"system">(isDark ? "dark" : "light");
  const [accent, setAccent] = useState("#f59e0b");
  const [density, setDensity] = useState<"compact"|"normal"|"relaxed">("normal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const accents = ["#f59e0b","#8b5cf6","#3b82f6","#10b981","#f43f5e","#06b6d4","#ec4899","#84cc16"];

  useEffect(() => {
    (async () => {
      const res = await getAppearanceSettingsApi();
      if (!res.error && res.data?.status) {
        const d = res.data.data || {};
        if (d.theme_mode === "dark" || d.theme_mode === "light" || d.theme_mode === "system") {
          setThemeMode(d.theme_mode);
        }
        if (d.accent_color) setAccent(String(d.accent_color));
        if (d.density === "compact" || d.density === "normal" || d.density === "relaxed") {
          setDensity(d.density);
        }
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await updateAppearanceSettingsApi({ theme_mode: themeMode, accent_color: accent, density });
    setSaving(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to save appearance settings", false);
    } else {
      onResult(res.data.message || "Appearance settings applied", true);
    }
  };

  if (loading) return <SectionLoading tk={tk} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Theme</SLabel>
      <GCard accent={tk.acc} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", gap:12 }}>
          {([['dark','🌑','Dark'],['light','☀️','Light'],['system','💻','System']] as const).map(([id,icon,label]) => {
            const isActive = themeMode === id;
            return (
              <button key={id} onClick={() => setThemeMode(id)}
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

function ApiSection({ onResult, tk }: { onResult: ResultCb; tk: Tk }) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [reqMin, setReqMin] = useState("");
  const [reqHour, setReqHour] = useState("");
  const [burst, setBurst] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingLimits, setSavingLimits] = useState(false);
  const [generating, setGenerating] = useState(false);

  const refetchKeys = async () => {
    const res = await getApiKeysApi();
    if (!res.error && res.data?.status) setKeys(res.data.data ?? []);
  };

  useEffect(() => {
    (async () => {
      const [k, lim] = await Promise.all([getApiKeysApi(), getRateLimitsApi()]);
      if (!k.error && k.data?.status) setKeys(k.data.data ?? []);
      if (!lim.error && lim.data?.status && lim.data.data) {
        setReqMin(String(lim.data.data.req_per_minute ?? ""));
        setReqHour(String(lim.data.data.req_per_hour ?? ""));
        setBurst(String(lim.data.data.burst_limit ?? ""));
      }
      setLoading(false);
    })();
  }, []);

  const generateKey = async () => {
    const name = window.prompt("Enter a name for this API key:", "Production Key");
    if (!name?.trim()) return;
    const typeIn = window.prompt("Type? Choose: live | test | ci", "live");
    const type: "live" | "test" | "ci" =
      typeIn === "test" ? "test" : typeIn === "ci" ? "ci" : "live";
    setGenerating(true);
    const res = await generateApiKeyApi({ name: name.trim(), type });
    setGenerating(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to generate API key", false);
      return;
    }
    const fullKey: string | undefined = res.data.data?.key;
    if (fullKey) {
      window.alert(`API key generated.\n\nCopy it now — it will not be shown again:\n\n${fullKey}`);
    }
    onResult(res.data.message || "API key generated", true);
    await refetchKeys();
  };

  const revokeKey = async (id: number, name: string) => {
    if (!window.confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
    const res = await revokeApiKeyApi(id);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to revoke key", false);
      return;
    }
    onResult(res.data.message || "API key revoked", true);
    await refetchKeys();
  };

  const saveLimits = async () => {
    setSavingLimits(true);
    const res = await updateRateLimitsApi({
      req_per_minute: Number(reqMin) || 0,
      req_per_hour: Number(reqHour) || 0,
      burst_limit: Number(burst) || 0,
    });
    setSavingLimits(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to save rate limits", false);
    } else {
      onResult(res.data.message || "Rate limits updated", true);
    }
  };

  if (loading) return <SectionLoading tk={tk} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>API Keys</SLabel>
      <GCard accent={tk.acc} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:12, color:tk.textMuted }}>Manage API credentials for platform integrations</div>
          <button onClick={generateKey} disabled={generating}
            style={{ padding:"7px 14px", borderRadius:8, background:`linear-gradient(135deg,${tk.acc},${tk.accDark})`, border:"none", color:"#fff", fontSize:11, fontWeight:700, cursor:generating?"not-allowed":"pointer", fontFamily:"inherit", opacity:generating?0.6:1 }}>
            {generating ? "Generating…" : "+ Generate Key"}
          </button>
        </div>
        {keys.map((k) => {
          const masked = `${k.key_prefix}${"•".repeat(20)}${k.key_preview ?? ""}`;
          const isActive = k.status === "active";
          const lastLabel = k.last_used ? new Date(k.last_used).toLocaleString() : "Never used";
          const createdLabel = k.created_at ? new Date(k.created_at).toLocaleDateString() : "—";
          return (
            <div key={k.id} style={{ padding:"13px", borderRadius:9, background:tk.inputBg, border:`1px solid ${tk.border}`, marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:isActive?tk.success:tk.textMuted }}>{k.name}</span>
                  <Badge label={isActive?"Active":"Revoked"} color={isActive?tk.success:tk.textMuted} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {isActive && (
                    <button onClick={() => revokeKey(k.id, k.name)}
                      style={{ fontSize:10, padding:"3px 9px", borderRadius:6, border:`1px solid ${tk.danger}28`, background:`${tk.danger}08`, color:tk.danger, cursor:"pointer", fontFamily:"inherit" }}>
                      Revoke
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:tk.textMuted, background:tk.bg, padding:"8px 12px", borderRadius:7, border:`1px solid ${tk.border}` }}>
                {masked}
              </div>
              <div style={{ display:"flex", gap:16, marginTop:8, fontSize:10, color:tk.textMuted }}>
                <span>Created: {createdLabel}</span><span>Last used: {lastLabel}</span>
              </div>
            </div>
          );
        })}
        {keys.length === 0 && <div style={{ textAlign:"center", color:tk.textMuted, fontSize:12, padding:20 }}>No API keys yet. Click + Generate Key to create one.</div>}
      </GCard>

      <SLabel tk={tk}>Rate Limiting</SLabel>
      <GCard accent={tk.sec} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          <InputField tk={tk} label="Req / Minute (per key)" value={reqMin} onChange={setReqMin} type="number" />
          <InputField tk={tk} label="Req / Hour (per key)" value={reqHour} onChange={setReqHour} type="number" />
          <InputField tk={tk} label="Burst Limit" value={burst} onChange={setBurst} type="number" hint="Max req in 1-second burst" />
        </div>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={saveLimits} saving={savingLimits} label="Save Rate Limits" /></div>
    </div>
  );
}

function BackupSection({ onResult, tk }: { onResult: ResultCb; tk: Tk }) {
  const [frequency, setFrequency] = useState("daily");
  const [retention, setRetention] = useState("30d");
  const [destination, setDestination] = useState("");
  const [encryption, setEncryption] = useState("");
  const [history, setHistory] = useState<BackupHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const refetchHistory = async () => {
    const res = await getBackupHistoryApi();
    if (!res.error && res.data?.status) setHistory(res.data.data ?? []);
  };

  useEffect(() => {
    (async () => {
      const [cfg, hist] = await Promise.all([getBackupConfigApi(), getBackupHistoryApi()]);
      if (!cfg.error && cfg.data?.status && cfg.data.data) {
        const c = cfg.data.data;
        setFrequency(c.frequency ?? "daily");
        setRetention(c.retention_period ?? "30d");
        setDestination(c.destination ?? "");
        setEncryption(c.encryption_key_id ?? "");
      }
      if (!hist.error && hist.data?.status) setHistory(hist.data.data ?? []);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await updateBackupConfigApi({
      frequency,
      retention_period: retention,
      destination,
      encryption_key_id: encryption,
    });
    setSaving(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to save backup config", false);
    } else {
      onResult(res.data.message || "Backup config saved", true);
    }
  };

  const runNow = async () => {
    setRunning(true);
    const res = await runBackupApi();
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to start backup", false);
      setRunning(false);
      return;
    }
    onResult(res.data.message || "Backup started", true);
    await refetchHistory();
    // Backend simulates 5s completion via setTimeout — refetch after 6s
    setTimeout(async () => { await refetchHistory(); setRunning(false); }, 6000);
  };

  const verifyLatest = async () => {
    setVerifying(true);
    const res = await verifyBackupApi();
    setVerifying(false);
    if (res.error || !res.data?.status) {
      onResult(res.data?.message || "Failed to verify backup", false);
    } else {
      onResult(res.data.message || "Backup integrity verified", true);
    }
  };

  if (loading) return <SectionLoading tk={tk} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SLabel tk={tk}>Backup Configuration</SLabel>
      <GCard accent={tk.info} tk={tk} style={{ padding:"20px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <SelectField tk={tk} label="Backup Frequency" value={frequency} onChange={setFrequency} options={[
            {value:"hourly",label:"Hourly"},{value:"daily",label:"Daily (Recommended)"},{value:"weekly",label:"Weekly"},
          ]} />
          <SelectField tk={tk} label="Retention Period" value={retention} onChange={setRetention} options={[
            {value:"7d",label:"7 Days"},{value:"30d",label:"30 Days"},{value:"90d",label:"90 Days"},{value:"1y",label:"1 Year"},
          ]} />
          <InputField tk={tk} label="Backup Destination" value={destination} onChange={setDestination} placeholder="s3://worksphere-backups/prod" />
          <InputField tk={tk} label="Encryption Key ID" value={encryption} onChange={setEncryption} placeholder="aws/kms/wsp-backup-2025" />
        </div>
        <div style={{ marginTop:14, display:"flex", gap:10 }}>
          <button onClick={runNow} disabled={running}
            style={{ padding:"8px 16px", borderRadius:8, background:`${tk.info}12`, border:`1px solid ${tk.info}28`, color:tk.info, fontSize:11, fontWeight:700, cursor:running?"not-allowed":"pointer", fontFamily:"inherit", opacity:running?0.6:1 }}>
            {running ? "🔄 Running…" : "🔄 Run Backup Now"}
          </button>
          <button onClick={verifyLatest} disabled={verifying}
            style={{ padding:"8px 16px", borderRadius:8, background:`${tk.success}10`, border:`1px solid ${tk.success}28`, color:tk.success, fontSize:11, fontWeight:700, cursor:verifying?"not-allowed":"pointer", fontFamily:"inherit", opacity:verifying?0.6:1 }}>
            {verifying ? "Verifying…" : "✓ Verify Latest Backup"}
          </button>
        </div>
      </GCard>

      <SLabel tk={tk}>Backup History</SLabel>
      <GCard tk={tk} style={{ padding:"20px 22px" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${tk.divider}` }}>
              {["Date & Time","Size","Type","Status","Triggered By"].map(h => (
                <th key={h} style={{ padding:"9px 12px", fontSize:10, fontWeight:700, color:tk.textUpper, textTransform:"uppercase", letterSpacing:"0.08em", textAlign:"left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((b) => (
              <tr key={b.id} style={{ borderBottom:`1px solid ${tk.divider}` }}>
                <td style={{ padding:"10px 12px", fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:tk.textSub }}>{b.created_at ? new Date(b.created_at).toLocaleString() : "—"}</td>
                <td style={{ padding:"10px 12px", fontSize:11, color:tk.text, fontWeight:600 }}>{b.size_gb != null ? `${b.size_gb} GB` : "—"}</td>
                <td style={{ padding:"10px 12px" }}><Badge label={b.type} color={b.type==="Manual"?tk.acc:tk.info} /></td>
                <td style={{ padding:"10px 12px" }}>
                  <Badge label={b.status === "success" ? "Success" : b.status === "running" ? "Running" : "Failed"}
                    color={b.status === "success" ? tk.success : b.status === "running" ? tk.info : tk.danger} />
                </td>
                <td style={{ padding:"10px 12px", fontSize:11, color:tk.textSub }}>{b.triggered_by}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan={5} style={{ padding:"24px 12px", textAlign:"center", fontSize:12, color:tk.textMuted }}>No backups yet — click &ldquo;Run Backup Now&rdquo; to create the first.</td></tr>
            )}
          </tbody>
        </table>
      </GCard>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn tk={tk} onClick={save} saving={saving} /></div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SystemSettings({ onBack }: { onBack?: () => void }) {
  const tk = useT();
  const [activeSection, setActiveSection] = useState<SettingSection>("general");
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);
  const [resetting, setResetting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (msg:string, ok:boolean) => {
    setToast({msg,ok});
    setTimeout(() => setToast(null), 3000);
  };

  const resetAll = async () => {
    if (!window.confirm("This will revert all settings to defaults. Continue?")) return;
    setResetting(true);
    const res = await resetAllSettingsApi();
    setResetting(false);
    if (res.error || !res.data?.status) {
      showToast(res.data?.message || "Failed to reset settings", false);
    } else {
      showToast(res.data.message || "All settings reset to defaults", true);
      // Force section remount so it refetches with the new defaults
      setRefreshKey(k => k + 1);
    }
  };

  const navItems: NavItem[] = [
    { id:"general",       icon:"⚙️",  label:"General"          },
    { id:"security",      icon:"🔐",  label:"Security"         },
    { id:"notifications", icon:"🔔",  label:"Notifications"    },
    { id:"billing",       icon:"💰",  label:"Billing"          },
    { id:"integrations",  icon:"🔗",  label:"Integrations"     },
    { id:"appearance",    icon:"🎨",  label:"Appearance"       },
    { id:"api",           icon:"📡",  label:"API & Keys"       },
    { id:"backup",        icon:"💾",  label:"Backup & Restore" },
  ];

  // Pass tk down to every section so they re-render when theme changes
  const sectionContent: Record<SettingSection, React.ReactNode> = {
    general:       <GeneralSection       tk={tk} onResult={showToast} />,
    security:      <SecuritySection      tk={tk} onResult={showToast} />,
    notifications: <NotificationsSection tk={tk} onResult={showToast} />,
    billing:       <BillingSection       tk={tk} onResult={showToast} />,
    integrations:  <IntegrationsSection  tk={tk} onResult={showToast} />,
    appearance:    <AppearanceSection    tk={tk} onResult={showToast} />,
    api:           <ApiSection           tk={tk} onResult={showToast} />,
    backup:        <BackupSection        tk={tk} onResult={showToast} />,
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
              <button onClick={resetAll} disabled={resetting}
                style={{ width:"100%", padding:"9px", borderRadius:9, background:`${tk.danger}10`, border:`1px solid ${tk.danger}25`, color:tk.danger, fontSize:12, fontWeight:700, cursor:resetting?"not-allowed":"pointer", fontFamily:"inherit", opacity:resetting?0.6:1 }}>
                {resetting ? "Resetting…" : "🗑️ Reset All Settings"}
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="ss-a3" key={`${activeSection}-${refreshKey}`} style={{ animation:"ss-up 0.3s ease both" }}>
            {sectionContent[activeSection]}
          </div>
        </div>
      </div>
    </>
  );
}
