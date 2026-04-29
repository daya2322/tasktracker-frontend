# app/components

Flat folder of all shared UI components. Not feature-split — naming and casing are inconsistent (some camelCase, some PascalCase). About a third of the files here are orphaned (no importer).

## Purpose

Holds reusable UI primitives (inputs, buttons, dropdowns), the role-specific dashboard bodies, and miscellaneous widgets. Context providers live in `contexts/` and are not in this folder.

## Key files

- `customButton.tsx` — default-export `Button` (`React.FC<ButtonProps>`). Brand red `bg-[#EA0A2A]`. Canonical example of the simple-component pattern.
- `CustomTextInput.tsx`, `customPasswordInput.tsx`, `customDropdown.tsx`, `dismissibleDropdown.tsx` — form input primitives used by the login page and forms.
- `iconButton.tsx`, `iconButton1.tsx` (a.k.a. `SidebarBtn1`) — icon-only buttons.
- `Snackbar.tsx` — toast UI. Only consumer of `framer-motion`. Lines 1-58 are an earlier impl left commented in.
- `Loading.tsx` — fullscreen loader.
- `notificationPopover.tsx`, `punchModal.tsx`, `ResetPasswordSidebar.tsx` — overlays. `ResetPasswordSidebar` is broken: `handleSubmit` body is commented out (lines 44-67), so the "Update Password" button is a no-op. Also violates Rules of Hooks at lines 36-37.
- `smartLink.tsx` — back-aware `<Link>` wrapper.
- `requireAuth.tsx` — guard HOC; the duplicate at `contexts/requireAuth.tsx` is unused.
- `adminDashboard.tsx`, `companyDashboard.tsx`, `employeeDashboard.tsx` — role-specific dashboard bodies, rendered by `(private)/(dashboard)/dashboard/page.tsx`.
- `systemSettings.tsx` — admin "System Settings" panel (~1000 lines). 8 sections (General/Security/Notifications/Billing/Integrations/Appearance/API Keys/Backup) plus Reset All; wired to 24 `/api/admin/settings/*` endpoints via helpers in `../services/allApi.tsx`. Rendered by `adminDashboard.tsx` when `showSettings` is true.

## Data flow

Components receive props or read context (`useAuth`, `useTheme`, `useSnackbar`). They do not call APIs directly except for the dashboards, which call helpers from `../services/allApi.tsx`.

## Dependencies

- **Inbound:** pages in `app/(public)/` and `app/(private)/`; the dashboard layout and shell.
- **Outbound:** `../services/allApi.tsx` (dashboards only); `../components/contexts/*` for global state; `@iconify-icon/react` for icons; `framer-motion` (only `Snackbar.tsx`); `recharts` (only the empty stub `TaskSummaryChart.tsx`).

## Conventions

- Default-export presentational components; named-export the rare hook/util.
- Props are a TypeScript `interface` declared above the component.
- Defaults go in destructured params, not the body.
- Tailwind utility classes inline; brand color literal is `bg-[#EA0A2A]`.
- **Orphaned (zero importers — safe to delete after confirming):** `cardForLoginPage.tsx`, `FloatingAddButton.tsx`, `SubNavbar.tsx`, `TaskSummaryChart.tsx`, `TaskTable.tsx`, `TaskRow.tsx`, `logo.tsx`.

## Common commands

None — folder is part of the parent Next.js build.
