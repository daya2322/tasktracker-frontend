# app/(private)/(dashboard)

Nested route group that gives every page inside it the shared dashboard chrome — TopNavbar, theme, idle-logout. The `(dashboard)` folder name is a Next.js route group (parens) and does not appear in URLs.

## Purpose

Holds the two dashboard-shelled routes (`/dashboard`, `/profile`) plus the layout, sidebar, and topnav that they share. Anything authenticated that is **not** a full-screen flow (like `/punch`) belongs here.

## Key files

- `layout.tsx` — wraps children with `<ThemeProvider>`, `<PermissionProvider>`, `<LoadingProvider>`, `<TopNavbar>`, and registers `useIdleLogout(5 * 60 * 1000)`.
- `topNavbar.tsx` — top nav with profile menu + notifications. ~23 KB, the largest single component in the repo.
- `sidebar.tsx` — left sidebar with permission-filtered menu links. ~21 KB. Uses `linkDataReducer` from `app/utils/`.
- `dashboard/page.tsx` — `/dashboard`. Calls `isVerify()` and renders one of `<EmployeeDashboard>` / `<CompanyDashboard>` / `<AdminDashboard>` from `app/components/`.
- `profile/page.tsx` — `/profile`. Editable profile form. **No API write** — edits live only in client state.
- `main.tsx` — layout helper for sidebar offsets. **Orphaned** — no importer.

## Data flow

Request hits the layout → providers wrap children → page component renders → page calls helpers from `app/services/allApi.tsx` to load data → updates local `useState` → re-renders. The role from `useAuth()` decides which dashboard component renders.

## Dependencies

- **Inbound:** `app/(private)/(dashboard)/dashboard/page.tsx` and `profile/page.tsx` are the routed pages.
- **Outbound:**
  - `app/components/contexts/{themeContext, permissionContext}` for providers
  - `app/components/{adminDashboard, companyDashboard, employeeDashboard}` for the role-specific bodies
  - `app/utils/useIdleLogout`, `app/utils/linkDataReducer`
  - `app/(private)/data/dashboardLinks.tsx` for the sidebar menu definition
  - `app/services/allApi.tsx` for backend calls

## Conventions

- All files in this folder are client components (`"use client"`).
- New authenticated pages that need the dashboard chrome go in a sibling folder under `(dashboard)/`. Full-screen flows (no chrome) go under `app/(private)/<route>/` instead — `punch/` is the existing precedent.
- The layout file mounts the providers; do **not** mount them again at the page level.
- Sidebar and topnav are large — prefer extending the existing files over duplicating into new ones.
- Do not import from `main.tsx`; it's orphaned and not part of the live render tree.

## Common commands

None — folder is part of the parent Next.js build. Use `npm run dev` from the repo root.
