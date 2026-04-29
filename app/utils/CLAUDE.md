# app/utils

Tiny pure helpers. Three small files, none of which call APIs.

## Purpose

Holds folder-agnostic utilities: a Promise-wrapped browser geolocation call, an idle-logout hook, and a sidebar reducer.

## Key files

- `getCurrentCoords.tsx` — wraps `navigator.geolocation.getCurrentPosition` in a Promise. Used by `app/(private)/punch/page.tsx`.
- `useIdleLogout.ts` — React hook. Wipes `localStorage["token"]` and redirects to `/login` after N ms of no user activity. Mounted by `app/(private)/(dashboard)/layout.tsx` with a 5-minute timeout.
- `linkDataReducer.tsx` — `useReducer`-style reducer for the sidebar's active-link state. Used by `app/(private)/(dashboard)/sidebar.tsx` (and the sidebar-link permission-filter pipeline).

## Data flow

These are leaf utilities. They take inputs, return outputs (or trigger side effects on `window` / `localStorage`). Nothing here mutates application state directly; consumers handle state.

## Dependencies

- **Inbound:** `app/(private)/punch/page.tsx` (`getCurrentCoords`); `app/(private)/(dashboard)/layout.tsx` (`useIdleLogout`); `app/(private)/(dashboard)/sidebar.tsx` (`linkDataReducer`).
- **Outbound:** browser APIs (`navigator.geolocation`, `localStorage`, `window`). No npm dependencies.

## Conventions

- Hooks start with `use*` (React convention) — see `useIdleLogout`.
- Pure helpers (no React) export a named function or const.
- One concept per file. Don't add catch-all helpers here — if a helper is feature-specific, keep it next to that feature.
- File extensions: `.tsx` if React types are referenced, `.ts` otherwise. (Mixed in this folder; `useIdleLogout.ts` is the only `.ts`.)

## Common commands

None.
