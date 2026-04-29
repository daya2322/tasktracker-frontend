# app/components/contexts

React Context providers for global state. Wraps the app at `app/layout.tsx` (auth, snackbar) and `app/(private)/(dashboard)/layout.tsx` (theme, permission).

## Purpose

Owns auth state (`AuthProvider`), theme state (`ThemeProvider`), and a permission/menu provider (mostly stubbed). Each file exports a `<X>Provider` component and a `use<X>` hook.

## Key files

- `authContext.tsx` — `AuthProvider` + `useAuth`. State: `{ user, loading }`. Methods: `login(credentials)` (calls `loginApi`), `logout()`. On mount: reads `localStorage["token"]`, calls `isVerify()`, sets `user` from `res.data.data`.
- `themeContext.tsx` — `ThemeProvider` + `useTheme`. Persists to `localStorage["dashboard-theme"]`.
- `permissionContext.tsx` — `PermissionProvider`. **Largely a no-op:** `fetchFilteredMenu` (lines 130-145) and the body of `refreshPermissions` (lines 156-195) are entirely commented out. References a removed `secureAuth.getRole()` helper.
- `usePermission.tsx` — `usePermissionManager` hook. Body is fully commented out.
- `requireAuth.tsx` — duplicate of `app/components/requireAuth.tsx`. **Unused — only the sibling copy is imported.**

## Data flow

`AuthProvider` reads `localStorage["token"]` on mount → calls `isVerify()` → stores user → exposes via `useAuth()`. `login()` calls `loginApi()`, stores the returned token in `localStorage`, sets user state.

## Dependencies

- **Inbound:** `app/layout.tsx` mounts `AuthProvider`; `app/(private)/(dashboard)/layout.tsx` mounts `ThemeProvider` and `PermissionProvider`.
- **Outbound:** `@/app/services/allApi` (`isVerify`, `login`).

## Conventions

- All files start with `"use client";`.
- Provider component is a named export (`export function XProvider`); hook is a named export (`export const useX`).
- The hook throws if called outside its provider — see `useAuth` (line 113).
- `User` shape includes optional profile fields (`phone`, `department`, `location`, etc.) plus a strange required `message: string[]` field — ignore the latter, it's not actually populated by the backend.
- **Note:** `authContext.tsx:59` reads `res.data.data` from `isVerify()` but `app/page.tsx:28` reads `res.data.role.id` — two different shape assumptions for the same response. Confirm before refactoring.
- Do not extend the commented-out `permissionContext` further — the surface is dead. Either fix or delete.

## Common commands

None.
