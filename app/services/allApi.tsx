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