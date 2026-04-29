# app/

Next.js App Router root. The entire frontend lives here — there is no `src/`, `pages/`, `lib/`, or `hooks/` folder.

## Purpose

Holds every route, layout, shared component, context provider, and utility. Authenticated and public pages are organised by Next.js route groups (`(public)`, `(private)`) which share layouts without affecting URLs.

## Key files

- `layout.tsx` — root layout. Inter font, wraps the tree with `AuthProvider` and `SnackbarProvider`.
- `page.tsx` — `/` route. Calls `isVerify()` on mount; redirects to `/profile` if logged in, else renders `<LoginPage>`.
- `globals.css` — Tailwind v4 entry + theme tokens.
- `emojis.tsx` — country-flag emoji polyfill (Windows fix); has a leftover `console.log` at line 9.
- `(public)/login/page.tsx` — Formik+Yup login form.
- `(private)/(dashboard)/layout.tsx` — TopNavbar + ThemeProvider + PermissionProvider + `useIdleLogout(5 * 60 * 1000)`.
- `(private)/(dashboard)/dashboard/page.tsx` — role-routed dashboard shell.
- `(private)/(dashboard)/profile/page.tsx` — editable profile (client state only — no API write).
- `(private)/punch/page.tsx` — punch in/out modal; uses `app/utils/getCurrentCoords.tsx`.
- `(private)/data/dashboardLinks.tsx` — sidebar menu definition + permission-filter helper.

## Data flow

Every page is a client component (`"use client"`). User action → page calls a helper from `services/allApi.tsx` → response is stored either in a Context (for auth/theme) or in local `useState` → component re-renders. There is no SSR data fetching, no server actions, no `loading.tsx`/`error.tsx` boundaries.

## Dependencies

- **Inbound:** `next` runtime serves these files based on the `app/` folder convention.
- **Outbound:** `services/allApi.tsx` for every backend call; `components/*` for UI primitives; `utils/*` for helpers; `components/contexts/*` for global state.

## Conventions

- `(public)/` for unauthenticated routes; `(private)/` for everything that requires a JWT.
- Nest under `(private)/(dashboard)/` to inherit the dashboard chrome (TopNavbar, theme, idle-logout). Use `(private)/<route>/` for full-screen flows like `/punch`.
- Page files are always `page.tsx`, layouts are `layout.tsx` (Next.js convention).
- The redirect target after login is inconsistent in the current code: `app/page.tsx:34` sends to `/profile`, but `(public)/login/page.tsx:103` sends to `/dashboard`. Pick one when next editing either.
- Two `requireAuth` files exist (`components/requireAuth.tsx` and `components/contexts/requireAuth.tsx`); only the former is imported anywhere.

## Common commands

None — runs as part of the parent repo. Use `npm run dev` from the repo root.
