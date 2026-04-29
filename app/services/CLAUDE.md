# app/services

Cross-cutting providers and the single API client. Despite the name, this is not a "services layer" in the Express sense — it's mostly the axios instance and helpers.

## Purpose

Owns every backend call (`allApi.tsx`) and two providers (`loadingContext.tsx`, `snackbarContext.tsx`). All TypeScript types for backend entities also live in `allApi.tsx`.

## Key files

- `allApi.tsx` — the most important file in the frontend.
  - Axios instance `API` with `baseURL: process.env.NEXT_PUBLIC_API_URL`.
  - Request interceptor injects `Authorization: Bearer <localStorage.token>`.
  - `handleError(error)` — central error handler, redirects to `/login` on 401.
  - 17 API helpers grouped by section (`AUTH`, `ATTENDANCE — WRITE`, `ATTENDANCE — READ`, `LOCATION`, plus company/dashboard/audit helpers).
  - Entity types: `AttendanceRecord`, `TodayMeta`, `WeeklyChartDay`, `PunchStatus`, `DashboardSummary`, `RecentActivityEvent`, `MonthlyOverview`, `AttendanceHistoryParams`. (`Company`, `CompanyFormData` are declared locally near the bottom and are duplicated in `components/adminDashboard.tsx` — known drift.)
- `loadingContext.tsx` — `LoadingProvider` + `useLoading`. Global "show spinner" state.
- `snackbarContext.tsx` — `SnackbarProvider` + `useSnackbar`. Toast queue.

## Data flow

UI calls `<helper>()` from `allApi.tsx` → axios sends to `NEXT_PUBLIC_API_URL` with the JWT header → response wrapped as `{ error: false, data: <backend envelope> }` and returned. On axios error, `handleError` returns `{ error: true, data: ... }` and (on 401) wipes the token and navigates to `/login`.

## Dependencies

- **Inbound:** `app/components/contexts/authContext.tsx` imports `isVerify` and `login`; pages and dashboards import many other helpers.
- **Outbound:** `axios`. `loadingContext` and `snackbarContext` have no outbound deps beyond React.
- **Env:** `NEXT_PUBLIC_API_URL` (required, no fallback).

## Conventions

- Every helper follows the same shape: `try { const res = await API.<method>(...); return { error: false, data: res.data }; } catch (e) { return handleError(e); }`. Don't deviate — call sites rely on the `{ error, data }` envelope.
- Suffix every helper with `Api` (`loginApi`, `punchInApi`, `getDashboardSummaryApi`). Reserved for things that hit the backend.
- Section banner comments use `/* ================= NAME ================= */`.
- Add new entity types in this file, not in a separate `types/` folder. The project does not have one.
- For paginated/list endpoints, the helper signature should reflect the meta fields (`page`, `limit`, `count`) returned alongside `data` — see `getAttendanceHistoryApi` (lines 251-269) for the canonical typed example.

## Common commands

None.
