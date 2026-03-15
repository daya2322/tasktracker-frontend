"use client";

import { useAuth } from "@/app/components/contexts/authContext";
import { ErrorMessage, Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as Yup from "yup";
import CustomPasswordInput from "../../components/customPasswordInput";
import CustomTextInput from "../../components/CustomTextInput";

const LoginSchema = Yup.object({
  userId: Yup.string().required("User ID is required"),
  password: Yup.string()
    .min(6, "Password too short")
    .required("Password is required"),
});

// ─── Animated SVG grid dots ───────────────────────────────────────────────────
function GridDots() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="lp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#14b8a6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lp-grid)" />
    </svg>
  );
}

// ─── Floating stat pill ───────────────────────────────────────────────────────
function StatPill({ icon, value, label, delay, top, right }: {
  icon: string; value: string; label: string; delay: string;
  top: string; right: string;
}) {
  return (
    <div style={{
      position: "absolute", top, right,
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 16px", borderRadius: 12,
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      animation: "lp-float 3s ease-in-out infinite",
      animationDelay: delay,
      whiteSpace: "nowrap",
      zIndex: 3,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Brand Logo block ─────────────────────────────────────────────────────────
function BrandLogo({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const imgH = size === "lg" ? 48 : size === "md" ? 40 : 32;
  const nameSize = size === "lg" ? 22 : size === "md" ? 18 : 15;
  const subSize  = size === "lg" ? 11 : size === "md" ? 10 : 9;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img
        src="/logoWhite2.jpg"
        alt="WorkSphere"
        style={{
          height: imgH,
          width: "auto",
          borderRadius: size === "lg" ? 10 : 8,
          mixBlendMode: "lighten",
          filter: "drop-shadow(0 0 12px rgba(20,184,166,0.45))",
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{
          fontSize: nameSize, fontWeight: 800,
          color: "#f1f5f9", letterSpacing: "-0.3px", lineHeight: 1,
        }}>WorkSphere</div>
        <div style={{
          fontSize: subSize, color: "#14b8a6", fontWeight: 600,
          letterSpacing: "0.12em", marginTop: 3, textTransform: "uppercase",
        }}>Workforce Suite</div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user && user.role) router.push("/dashboard");
  }, [user, router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

        .lp-root * { box-sizing: border-box; }
        .lp-root { font-family: 'Sora', sans-serif; }

        @keyframes lp-up    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes lp-left  { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:none} }
        @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes lp-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes lp-shimmer {
          0%  { background-position:-200% center; }
          100%{ background-position: 200% center; }
        }

        .lp-a1 { animation: lp-up .6s cubic-bezier(0.16,1,0.3,1) both .05s; }
        .lp-a2 { animation: lp-up .6s cubic-bezier(0.16,1,0.3,1) both .15s; }
        .lp-a3 { animation: lp-up .6s cubic-bezier(0.16,1,0.3,1) both .25s; }
        .lp-a4 { animation: lp-up .6s cubic-bezier(0.16,1,0.3,1) both .35s; }
        .lp-a5 { animation: lp-up .6s cubic-bezier(0.16,1,0.3,1) both .45s; }
        .lp-a6 { animation: lp-up .6s cubic-bezier(0.16,1,0.3,1) both .55s; }

        .lp-left1 { animation: lp-left .7s cubic-bezier(0.16,1,0.3,1) both .05s; }
        .lp-left2 { animation: lp-left .7s cubic-bezier(0.16,1,0.3,1) both .2s; }
        .lp-left3 { animation: lp-left .7s cubic-bezier(0.16,1,0.3,1) both .35s; }

        .lp-shimmer-text {
          background: linear-gradient(90deg,#14b8a6 0%,#6366f1 40%,#14b8a6 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: lp-shimmer 4s linear infinite;
        }

        /* ── Submit button ── */
        .lp-btn {
          width:100%; padding:13px; border-radius:12px; border:none;
          font-size:15px; font-weight:700; font-family:'Sora',sans-serif;
          cursor:pointer; letter-spacing:0.02em;
          background:linear-gradient(135deg,#14b8a6 0%,#6366f1 100%);
          color:#fff;
          box-shadow:0 0 24px rgba(20,184,166,0.4),0 4px 16px rgba(0,0,0,0.3);
          transition:all 0.2s ease; position:relative; overflow:hidden;
        }
        .lp-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent);
          opacity:0; transition:opacity 0.2s;
        }
        .lp-btn:hover::before { opacity:1; }
        .lp-btn:hover { transform:translateY(-1px); box-shadow:0 0 32px rgba(20,184,166,0.55),0 8px 24px rgba(0,0,0,0.4); }
        .lp-btn:active { transform:scale(0.98); }
        .lp-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

        /* ── Dark field overrides ── */
        .lp-field label {
          font-size:11px !important; font-weight:600 !important;
          color:#64748b !important; text-transform:uppercase;
          letter-spacing:0.08em; margin-bottom:7px !important; display:block;
        }
        .lp-field input {
          background:rgba(255,255,255,0.04) !important;
          border:1px solid rgba(255,255,255,0.1) !important;
          border-radius:12px !important; color:#e2e8f0 !important;
          font-size:14px !important; font-family:'Sora',sans-serif !important;
          padding:12px 16px !important; width:100% !important;
          transition:border-color 0.2s,box-shadow 0.2s !important;
        }
        .lp-field input:focus {
          outline:none !important; border-color:#14b8a6 !important;
          box-shadow:0 0 0 3px rgba(20,184,166,0.18) !important;
          background:rgba(20,184,166,0.05) !important;
        }
        .lp-field input::placeholder { color:#334155 !important; }

        /* ── Responsive layout ── */

        /* Mobile: single column, show only the card */
        .lp-left-panel  { display: none; }
        .lp-right-panel {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background: linear-gradient(160deg,#080f1e 0%,#060c18 100%);
          position: relative;
          overflow: hidden;
        }

        /* Desktop lg+: show left panel */
        @media (min-width: 1024px) {
          .lp-left-panel {
            display: flex;
            flex: 0 0 55%;
            flex-direction: column;
            justify-content: center;
            padding: 60px 64px;
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg,#060c18 0%,#0a1628 50%,#060c18 100%);
          }
          .lp-right-panel {
            flex: 1;
            min-height: 100vh;
            width: auto;
            padding: 40px 24px;
          }
          .lp-card-logo-mobile { display: none !important; }
        }
      `}</style>

      <div
        className="lp-root"
        style={{ minHeight: "100vh", display: "flex", background: "#060c18" }}
      >

        {/* ══════════════════════════════════
            LEFT PANEL — desktop only
        ══════════════════════════════════ */}
        <div className="lp-left-panel">
          <GridDots />

          {/* Glow orbs */}
          <div style={{ position:"absolute", top:"-10%", left:"-5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(20,184,166,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-15%", right:"-10%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />

          {/* Rotating rings */}
          <div style={{ position:"absolute", top:"8%", right:"10%", width:120, height:120, borderRadius:"50%", border:"1px solid rgba(20,184,166,0.15)", animation:"lp-spin 20s linear infinite" }}>
            <div style={{ position:"absolute", top:-4, left:"50%", marginLeft:-4, width:8, height:8, borderRadius:"50%", background:"#14b8a6", boxShadow:"0 0 12px #14b8a6" }} />
          </div>
          <div style={{ position:"absolute", top:"6%", right:"8%", width:160, height:160, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.1)", animation:"lp-spin 30s linear infinite reverse" }} />

          {/* Stat pills */}
          <StatPill icon="👥" value="2,400+" label="Active users"      delay="0s"   top="18%" right="8%"  />
          <StatPill icon="✅" value="98.6%"  label="Uptime SLA"         delay="0.8s" top="38%" right="4%"  />
          <StatPill icon="🚀" value="3×"     label="Productivity boost"  delay="1.6s" top="58%" right="10%" />

          {/* Main content */}
          <div style={{ position:"relative", zIndex:2, maxWidth:460 }}>

            {/* Brand logo */}
            <div className="lp-left1" style={{ marginBottom:40 }}>
              <BrandLogo size="lg" />
            </div>

            {/* Headline */}
            <div className="lp-left2">
              <div style={{ fontSize:42, fontWeight:800, color:"#f1f5f9", lineHeight:1.15, marginBottom:16, letterSpacing:"-0.5px" }}>
                Manage your<br />
                <span className="lp-shimmer-text">workforce smarter.</span>
              </div>
              <div style={{ fontSize:15, color:"#64748b", lineHeight:1.75, maxWidth:380 }}>
                The all-in-one task tracker that keeps your team aligned, your attendance accurate, and your productivity visible.
              </div>
            </div>

            {/* Features */}
            <div className="lp-left3" style={{ marginTop:36, display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { icon:"⚡", text:"Real-time attendance & punch tracking" },
                { icon:"🎯", text:"Smart task assignment with priority queues" },
                { icon:"📊", text:"KPI dashboards with live performance data" },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:"rgba(20,184,166,0.12)", border:"1px solid rgba(20,184,166,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{item.icon}</div>
                  <span style={{ fontSize:13, color:"#94a3b8", fontWeight:500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ position:"absolute", bottom:28, left:64, fontSize:11, color:"#1e3a5f", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em" }}>
            WORKSPHERE © 2026 · ACME CORP
          </div>
        </div>

        {/* ══════════════════════════════════
            RIGHT PANEL — login card
        ══════════════════════════════════ */}
        <div className="lp-right-panel">
          {/* Bg glow */}
          <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle,rgba(20,184,166,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />

          {/* Card */}
          <div style={{
            width:"100%", maxWidth:420,
            background:"linear-gradient(145deg,rgba(15,30,53,0.97),rgba(8,18,38,0.99))",
            borderRadius:24,
            border:"1px solid rgba(255,255,255,0.07)",
            boxShadow:"0 32px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.05)",
            padding:"40px 36px",
            backdropFilter:"blur(24px)",
            position:"relative",
            overflow:"hidden",
          }}>
            {/* Top glow line */}
            <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1, background:"linear-gradient(90deg,transparent,rgba(20,184,166,0.7),transparent)" }} />

            {/* ── Logo: always visible on mobile, hidden on desktop (left panel shows it) ── */}
            <div className="lp-card-logo-mobile lp-a1" style={{ marginBottom:28 }}>
              <BrandLogo size="md" />
            </div>

            {/* Heading */}
            <div className="lp-a1" style={{ marginBottom:6 }}>
              <div style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px" }}>
                Welcome back 👋
              </div>
            </div>
            <div className="lp-a2" style={{ fontSize:13, color:"#475569", marginBottom:32 }}>
              Sign in to your account to continue
            </div>

            {/* Formik form */}
            <Formik
              initialValues={{ userId:"", password:"" }}
              validationSchema={LoginSchema}
              onSubmit={async (values, { setErrors }) => {
                const res = await login({ email: values.userId, password: values.password });
                if (res?.error) {
                  setErrors({ userId: res.data?.message?.join(", ") || "Login failed" });
                  return;
                }
                router.push("/dashboard");
              }}
            >
              {({ isSubmitting, handleChange, values }) => (
                <Form style={{ display:"flex", flexDirection:"column", gap:18 }}>

                  {/* Email */}
                  <div className="lp-a3 lp-field">
                    <CustomTextInput
                      label="Email or Username"
                      placeholder="Enter your email or username"
                      value={values.userId}
                      onChange={handleChange("userId")}
                    />
                    <ErrorMessage name="userId" render={msg => (
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5, fontSize:11, color:"#f43f5e", fontWeight:600 }}>
                        <span>⚠</span> {msg}
                      </div>
                    )} />
                  </div>

                  {/* Password */}
                  <div className="lp-a4 lp-field">
                    <CustomPasswordInput
                      label="Password"
                      value={values.password}
                      onChange={handleChange("password")}
                    />
                    <ErrorMessage name="password" render={msg => (
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5, fontSize:11, color:"#f43f5e", fontWeight:600 }}>
                        <span>⚠</span> {msg}
                      </div>
                    )} />
                  </div>

                  {/* Submit */}
                  <div className="lp-a5">
                    <button type="submit" disabled={isSubmitting} className="lp-btn">
                      {isSubmitting ? (
                        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                          <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"lp-spin .7s linear infinite", display:"inline-block" }} />
                          Signing in…
                        </span>
                      ) : "Sign in →"}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="lp-a6" style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
                    <span style={{ fontSize:10, color:"#334155", fontWeight:700, letterSpacing:"0.08em" }}>SECURED ACCESS</span>
                    <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
                  </div>

                  {/* Trust badges */}
                  <div className="lp-a6" style={{ display:"flex", justifyContent:"center", gap:24 }}>
                    {[
                      { icon:"🔒", label:"SSL Encrypted" },
                      { icon:"🛡️", label:"SOC 2 Compliant" },
                      { icon:"✅", label:"99.9% Uptime" },
                    ].map((b, i) => (
                      <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        <span style={{ fontSize:16 }}>{b.icon}</span>
                        <span style={{ fontSize:9, color:"#334155", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          {/* Bottom credits */}
          <div style={{ position:"absolute", bottom:16, left:0, right:0, textAlign:"center", fontSize:11, color:"#1e293b", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.06em" }}>
            © 2026 WorkSphere · All rights reserved
          </div>
        </div>
      </div>
    </>
  );
}