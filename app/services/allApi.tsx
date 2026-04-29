"use client";

import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ================= ERROR HANDLER ================= */
export function handleError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    console.error("API Error:", error.response.data);

    if (
      error.response.status === 401 &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return { error: true, data: error.response.data };
  }

  return {
    error: true,
    data: { message: "Unknown error occurred" },
  };
}

/* ================= TYPES ================= */

export interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  punch_in: string | null;
  punch_out: string | null;
  punch_in_address: string | null;
  punch_out_address: string | null;
  total_minutes: number;
  status: "PUNCHED_IN" | "PUNCHED_OUT" | "ABSENT" | "LEAVE" | "HALF_DAY";
  created_at: string;
  updated_at: string;
}

export interface TodayMeta {
  punched_in: boolean;
  punched_out: boolean;
  hours_today: string;
  total_minutes_today: number;
  is_live: boolean;
}

export interface WeeklyChartDay {
  label: string;   // "Mon" | "Tue" | ...
  hours: number;
  isToday: boolean;
}

export interface PunchStatus {
  punched_in: boolean;
  punched_out: boolean;
  punch_in_time: string | null;
  punch_out_time: string | null;
  is_live: boolean;
}

export interface DashboardSummary {
  hours_today: string;
  hours_today_minutes: number;
  week_total: string;
  week_total_minutes: number;
  week_target_minutes: number;
  attendance_pct: number;
  present_days: number;
  working_days: number;
  weekly_hours_chart: WeeklyChartDay[];
  punch_status: PunchStatus;
}

export interface RecentActivityEvent {
  type: "PUNCH_IN" | "PUNCH_OUT";
  title: string;
  time: string;
  icon: string;
  color: string;
  address: string | null;
}

export interface MonthlyOverview {
  present_days: number;
  total_minutes: number;
  avg_daily_hours: number;
  on_time_pct: number;
  work_streak_days: number;
  month_start: string;
  month_end: string;
}

export interface AttendanceHistoryParams {
  from?: string;   // YYYY-MM-DD
  to?: string;     // YYYY-MM-DD
  page?: number;
  limit?: number;
}

/* ================= AUTH ================= */

// LOGIN
export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const res = await API.post("/api/auth/login", credentials);
    return { error: false, data: res.data };
  } catch (error: unknown) {
    return handleError(error);
  }
};

// LOGOUT (frontend-controlled)
export const logout = async () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }
    return { error: false };
  } catch (error) {
    return handleError(error);
  }
};

// VERIFY TOKEN
export const isVerify = async () => {
  try {
    const res = await API.get("/api/auth/me");
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error);
  }
};

/* ================= ATTENDANCE — WRITE ================= */

// PUNCH IN
// Powers: ⚡ Punch In button in Attendance card
export const punchInApi = async (address: string) => {
  try {
    const res = await API.post("/api/attendance/punch-in", { address });
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error);
  }
};

// PUNCH OUT
// Powers: 🔴 Punch Out button in Attendance card
export const punchOutApi = async (address: string) => {
  try {
    const res = await API.post("/api/attendance/punch-out", { address });
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error);
  }
};

/* ================= ATTENDANCE — READ ================= */

// GET TODAY'S ATTENDANCE
// Powers: clock display, punch time label, "Currently working" status dot
export const getTodayAttendanceApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: AttendanceRecord | null; meta: TodayMeta };
}> => {
  try {
    const res = await API.get("/api/attendance/today");
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error) as never;
  }
};

// GET DASHBOARD SUMMARY
// Powers: "Hours today", "This week", Attendance % metric cards
//         + Weekly Hours bar chart + monthly attendance progress bar
export const getDashboardSummaryApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: DashboardSummary };
}> => {
  try {
    const res = await API.get("/api/attendance/dashboard-summary");
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error) as never;
  }
};

// GET RECENT ACTIVITY
// Powers: ⚡ Recent Activity feed at the bottom of the dashboard
export const getRecentActivityApi = async (limit = 5): Promise<{
  error: boolean;
  data: { status: boolean; count: number; data: RecentActivityEvent[] };
}> => {
  try {
    const res = await API.get("/api/attendance/recent-activity", {
      params: { limit },
    });
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error) as never;
  }
};

// GET MONTHLY OVERVIEW
// Powers: Performance KPIs strip — avg daily hours, on-time %, work streak 🔥
export const getMonthlyOverviewApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: MonthlyOverview };
}> => {
  try {
    const res = await API.get("/api/attendance/monthly-overview");
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error) as never;
  }
};

// GET ATTENDANCE HISTORY
// Powers: "View history ↗" button — paginated records with date range filter
export const getAttendanceHistoryApi = async (
  params: AttendanceHistoryParams = {}
): Promise<{
  error: boolean;
  data: {
    status: boolean;
    page: number;
    limit: number;
    count: number;
    data: AttendanceRecord[];
  };
}> => {
  try {
    const res = await API.get("/api/attendance/history", { params });
    return { error: false, data: res.data };
  } catch (error) {
    return handleError(error) as never;
  }
};

/* ================= LOCATION ================= */

export const getAddressFromCoords = async (
  latitude: number,
  longitude: number
) => {
  try {
    const res = await API.post("/api/location/reverse", {
      latitude,
      longitude,
    });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

interface Company {
  id: number;
  name: string;
  industry: string;
  plan: "Starter" | "Pro" | "Enterprise";
  employees: number;
  status: "active" | "suspended" | "trial";
  revenue: number;
  joinDate: string;
  owner: string;
  email: string;
  avatar: string;
}

type CompanyFormData = {
  name: string; industry: string; owner: string; email: string;
  phone: string; plan: Company["plan"]; employees: string;
  password: string;         // ← add
  confirmPassword: string;  // ← add
};


// GET /api/company/companies
export const fetchCompaniesApi = async () => {
  try {
    const res = await API.get("/api/company/companies");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

// POST /api/company/companies/create
export const createCompanyApi = async (payload: Omit<CompanyFormData, "confirmPassword">) => {
  try {
    const res = await API.post("/api/company/companies/create", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

// PATCH /api/company/companies/:id/suspend
export const toggleSuspendApi = async (id: number) => {
  try {
    const res = await API.patch(`/api/company/companies/${id}/suspend`);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

// DELETE /api/company/companies/:id
export const deleteCompanyApi = async (id: number) => {
  try {
    const res = await API.delete(`/api/company/companies/${id}`);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

// GET /api/dashboard/stats
export const fetchStatsApi = async () => {
  try {
    const res = await API.get("/api/dashboard/stats");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

// GET /api/dashboard/revenue
export const fetchRevenueApi = async () => {
  try {
    const res = await API.get("/api/dashboard/revenue");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

// GET /api/dashboard/plan-distribution
export const fetchPlanDistApi = async () => {
  try {
    const res = await API.get("/api/dashboard/plan-distribution");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

// GET /api/audit/logs
export const fetchAuditLogsApi = async () => {
  try {
    const res = await API.get("/api/audit/logs");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= DASHBOARD — SYSTEM HEALTH ================= */

export interface SystemHealth {
  uptime_seconds: number;
  process_uptime_seconds: number;
  memory: {
    total_bytes: number;
    free_bytes: number;
    used_bytes: number;
    used_pct: number;
  };
  process_memory: {
    heap_used_bytes: number;
    heap_total_bytes: number;
    rss_bytes: number;
  };
  cpu: {
    load_avg_1: number;
    load_avg_5: number;
    load_avg_15: number;
    cores: number;
    load_pct: number;
  };
  db_pool: {
    limit: number;
    active: number;
    free: number;
    active_pct: number;
  };
  checked_at: string;
}

// GET /api/dashboard/system-health
export const getSystemHealthApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: SystemHealth };
}> => {
  try {
    const res = await API.get("/api/dashboard/system-health");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

/* ================= ADMIN SETTINGS — TYPES ================= */

export interface GeneralSettings {
  platform_name?: string;
  primary_domain?: string;
  default_timezone?: string;
  default_language?: string;
  currency?: string;
  support_email?: string;
  max_companies?: string | number;
  max_users_per_co?: string | number;
  session_timeout_min?: string | number;
}

export interface SecuritySettings {
  id: number;
  two_factor_auth: 0 | 1 | boolean;
  force_https: 0 | 1 | boolean;
  ip_allowlist: 0 | 1 | boolean;
  brute_force_protection: 0 | 1 | boolean;
  audit_log_retention: 0 | 1 | boolean;
  auto_suspend_inactive: 0 | 1 | boolean;
  encrypted_data_at_rest: 0 | 1 | boolean;
  gdpr_compliance_mode: 0 | 1 | boolean;
  min_password_length: number;
  password_expiry_days: number;
  prevent_reuse_count: number;
}

export interface NotificationChannel {
  id: number;
  name: string;
  label: string;
  icon: string;
  color: string;
  is_active: 0 | 1;
}

export interface NotificationEvent {
  id: number;
  name: string;
  label: string;
  is_active: 0 | 1;
}

export interface BillingOverview {
  mrr: number;
  arr: number;
  avg_plan: number;
  churn_rate: string;
}

export interface BillingGateway {
  id: number;
  gateway: string;
  webhook_url: string | null;
  invoice_currency: string;
  gateway_api_key: string;
}

export interface Integration {
  id: number;
  name: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  status: "connected" | "disconnected";
}

export interface WebhookSettings {
  id: number;
  endpoint_url: string | null;
  retry_policy: string;
  signing_secret: string;
}

export interface AppearanceSettings {
  theme_mode?: "dark" | "light" | "system";
  accent_color?: string;
  density?: "compact" | "normal" | "relaxed";
}

export interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  key_preview: string;
  status: "active" | "revoked";
  last_used: string | null;
  created_at: string;
}

export interface RateLimits {
  id: number;
  req_per_minute: number;
  req_per_hour: number;
  burst_limit: number;
}

export interface BackupConfig {
  id: number;
  frequency: string;
  retention_period: string;
  destination: string | null;
  encryption_key_id: string | null;
}

export interface BackupHistoryEntry {
  id: number;
  type: string;
  status: "running" | "success" | "failed";
  size_gb: number | null;
  triggered_by: string;
  created_at: string;
}

/* ================= ADMIN SETTINGS — GENERAL ================= */

export const getGeneralSettingsApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: GeneralSettings; message?: string };
}> => {
  try {
    const res = await API.get("/api/admin/settings/general");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const updateGeneralSettingsApi = async (payload: Partial<GeneralSettings>) => {
  try {
    const res = await API.put("/api/admin/settings/general", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= ADMIN SETTINGS — SECURITY ================= */

export const getSecuritySettingsApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: SecuritySettings; message?: string };
}> => {
  try {
    const res = await API.get("/api/admin/settings/security");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const updateSecuritySettingsApi = async (payload: Partial<SecuritySettings>) => {
  try {
    const res = await API.put("/api/admin/settings/security", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= ADMIN SETTINGS — NOTIFICATIONS ================= */

export const getNotificationSettingsApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: { channels: NotificationChannel[]; events: NotificationEvent[] } };
}> => {
  try {
    const res = await API.get("/api/admin/settings/notifications");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const updateNotificationSettingsApi = async (payload: {
  channels?: { id: number; is_active: 0 | 1 | boolean }[];
  events?: { id: number; is_active: 0 | 1 | boolean }[];
}) => {
  try {
    const res = await API.put("/api/admin/settings/notifications", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= ADMIN SETTINGS — BILLING ================= */

export const getBillingOverviewApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: BillingOverview };
}> => {
  try {
    const res = await API.get("/api/admin/settings/billing/overview");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const getBillingGatewayApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: BillingGateway };
}> => {
  try {
    const res = await API.get("/api/admin/settings/billing/gateway");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const updateBillingGatewayApi = async (payload: Partial<BillingGateway>) => {
  try {
    const res = await API.put("/api/admin/settings/billing/gateway", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= ADMIN SETTINGS — INTEGRATIONS ================= */

export const getIntegrationsApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: Integration[] };
}> => {
  try {
    const res = await API.get("/api/admin/settings/integrations");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const toggleIntegrationApi = async (name: string) => {
  try {
    const res = await API.post(`/api/admin/settings/integrations/${encodeURIComponent(name)}/toggle`);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

export const getWebhookSettingsApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: WebhookSettings };
}> => {
  try {
    const res = await API.get("/api/admin/settings/integrations/webhook");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const updateWebhookSettingsApi = async (payload: Partial<WebhookSettings>) => {
  try {
    const res = await API.put("/api/admin/settings/integrations/webhook", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= ADMIN SETTINGS — APPEARANCE ================= */

export const getAppearanceSettingsApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: AppearanceSettings };
}> => {
  try {
    const res = await API.get("/api/admin/settings/appearance");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const updateAppearanceSettingsApi = async (payload: Partial<AppearanceSettings>) => {
  try {
    const res = await API.put("/api/admin/settings/appearance", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= ADMIN SETTINGS — API KEYS ================= */

export const getApiKeysApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: ApiKey[] };
}> => {
  try {
    const res = await API.get("/api/admin/settings/api-keys");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const generateApiKeyApi = async (payload: { name: string; type?: "live" | "test" | "ci" }) => {
  try {
    const res = await API.post("/api/admin/settings/api-keys", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

export const revokeApiKeyApi = async (id: number) => {
  try {
    const res = await API.delete(`/api/admin/settings/api-keys/${id}`);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

export const getRateLimitsApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: RateLimits };
}> => {
  try {
    const res = await API.get("/api/admin/settings/api-keys/rate-limits");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const updateRateLimitsApi = async (payload: Partial<Pick<RateLimits, "req_per_minute" | "req_per_hour" | "burst_limit">>) => {
  try {
    const res = await API.put("/api/admin/settings/api-keys/rate-limits", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= ADMIN SETTINGS — BACKUP ================= */

export const getBackupConfigApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: BackupConfig };
}> => {
  try {
    const res = await API.get("/api/admin/settings/backup/config");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const updateBackupConfigApi = async (payload: Partial<BackupConfig>) => {
  try {
    const res = await API.put("/api/admin/settings/backup/config", payload);
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

export const getBackupHistoryApi = async (): Promise<{
  error: boolean;
  data: { status: boolean; data: BackupHistoryEntry[] };
}> => {
  try {
    const res = await API.get("/api/admin/settings/backup/history");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e) as never; }
};

export const runBackupApi = async () => {
  try {
    const res = await API.post("/api/admin/settings/backup/run");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

export const verifyBackupApi = async () => {
  try {
    const res = await API.post("/api/admin/settings/backup/verify");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};

/* ================= ADMIN SETTINGS — RESET ================= */

export const resetAllSettingsApi = async () => {
  try {
    const res = await API.delete("/api/admin/settings/reset");
    return { error: false, data: res.data };
  } catch (e) { return handleError(e); }
};