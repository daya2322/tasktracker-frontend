# tasktracker-frontend

Next.js 16 (App Router, React 19) frontend for the TaskTracker / WorkSphere app. Tailwind CSS v4, axios, Formik+Yup, JWT in `localStorage`. No tests, no CI, no deploy config.

## Purpose

Renders the entire UI: login, role-routed dashboards (Admin / Company / Employee), profile page, and geolocation-based punch in/out. Talks to the backend at `process.env.NEXT_PUBLIC_API_URL` via a single axios instance.

## Key files

- `app/layout.tsx` — root layout. Inter font, `AuthProvider`, `SnackbarProvider`, country-flag emoji polyfill.
- `app/page.tsx` — root route `/`. Verifies token, redirects to `/profile` if valid, else renders `<LoginPage>`.
- `app/services/allApi.tsx` — axios instance + 17 API helpers + entity TypeScript types. **Single source of truth for backend calls.**
- `app/components/contexts/authContext.tsx` — `useAuth`, `login`, `logout`, mount-time `isVerify` check.
- `app/(public)/login/page.tsx` — Formik+Yup login form, brand "WorkSphere".
- `app/(private)/(dashboard)/layout.tsx` — TopNavbar + theme + `useIdleLogout(5min)` for all dashboard pages.
- `app/(private)/(dashboard)/dashboard/page.tsx` — role-routed: renders one of `<EmployeeDashboard>` / `<CompanyDashboard>` / `<AdminDashboard>`.
- `app/(private)/punch/page.tsx` — punch in/out modal flow with browser geolocation.
- `next.config.ts` — empty (defaults only).
- `tsconfig.json` — `strict: false`, `noImplicitAny: false`, alias `@/* → ./*`.
- `package.json` — 11 deps. `lucide-react`, `recharts`, `framer-motion` are largely unused (see `../docs/CODEBASE_AUDIT.md §11`).

## Data flow

User action → page event handler → API helper from `app/services/allApi.tsx` → axios `API.<method>(path, body)` → `Authorization: Bearer <token>` injected by interceptor → backend at `NEXT_PUBLIC_API_URL` → response → context state update via `setUser` / similar → re-render. On 401, the interceptor wipes the token and redirects to `/login`.

## Dependencies

- **Outbound:** `tasktracker-backend` (every endpoint listed in `../docs/ARCHITECTURE.md §5`); Iconify CDN; Google Fonts; browser Geolocation API.
- **Required env var:** `NEXT_PUBLIC_API_URL` — no fallback.

## Conventions

- App Router only — no `pages/`. Public routes under `app/(public)/`, authenticated under `app/(private)/`.
- Interactive files start with `"use client";`.
- Default-export components, named-export hooks/providers/utilities/types.
- Cross-feature imports use the `@/*` alias; intra-folder imports stay relative.
- All entity types live in `app/services/allApi.tsx`. There is no `types/` folder.
- See [`../docs/PATTERNS.md`](../docs/PATTERNS.md) for the full style guide.

## Common commands

```
npm install
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm start        # next start
npm run lint     # eslint
npm audit        # 11 known vulns as of 2026-04-29 (Next.js itself is the largest)
```

There is no `test` script. There is no Dockerfile, vercel.json, or CI config.
