---
phase: quick-8
plan: "01"
subsystem: auth
tags: [auth, logto, react-native, expo, migration]
dependency_graph:
  requires: []
  provides: [logto-auth-context]
  affects: [contexts/AuthContext.tsx, package.json, app.json, .env.example]
tech_stack:
  added: ["@logto/rn ^1.1.0"]
  removed: ["react-native-auth0 ^5.4.0"]
  patterns: [LogtoProvider, useLogto, expo-web-browser OAuth redirect]
key_files:
  created: []
  modified:
    - contexts/AuthContext.tsx
    - package.json
    - app.json
    - .env.example
  deleted:
    - plugins/withAuth0SchemeFixPlugin.js
decisions:
  - "Both signInWithEmail and signInWithGoogle call signIn(REDIRECT_URI) — Logto controls social connectors server-side"
  - "isLoading derived from !isInitialized || internalLoading to cover both Logto init and session fetch"
  - "getToken wraps getAccessToken with try/catch returning null instead of throwing"
metrics:
  duration: "~10 minutes"
  completed: "2026-02-19"
  tasks_completed: 3
  files_changed: 5
---

# Quick Task 8: Switch Frontend Auth from Auth0 to Logto — Summary

**One-liner:** Replaced react-native-auth0 with @logto/rn, rewired AuthContext to use LogtoProvider and useLogto, and cleaned all Auth0 config artifacts.

## What Was Built

The frontend auth layer now uses Logto exclusively. The `AuthContext.tsx` wraps the app with `LogtoProvider` and uses `useLogto()` to drive sign-in, sign-out, token retrieval, and user profile population. The public API (`AuthContextType` interface, `useAuth` hook, `User` interface) is unchanged, so no call sites required updates.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Install @logto/rn, remove react-native-auth0 | c6f611e | package.json, bun.lock |
| 2 | Rewrite AuthContext.tsx to use @logto/rn | 936b9bf | contexts/AuthContext.tsx |
| 3 | Update app.json and .env.example, remove Auth0 plugin | 8d09f96 | app.json, .env.example, deleted plugins/withAuth0SchemeFixPlugin.js |

## Key Implementation Details

**AuthContext.tsx changes:**
- `Auth0Provider` + `useAuth0` replaced by `LogtoProvider` + `useLogto`
- Session init uses `isInitialized` (Logto's equivalent of auth0Loading) and `isAuthenticated`
- `fetchUserInfo()` replaces the manual `axios.get` call to Auth0's `/userinfo` endpoint
- `getToken` wraps `getAccessToken()` with error handling, returning `null` on failure
- `signOut` resets local state in a `finally` block for resilience against errors
- Removed `axios` import — no longer needed since `fetchUserInfo` is built into @logto/rn

**app.json changes:**
- Removed `react-native-auth0` plugin entry (was configuring domain + customScheme)
- Removed `./plugins/withAuth0SchemeFixPlugin` entry
- `"scheme": "libretalk"` preserved at top level for OAuth redirect URI `libretalk://callback`

**.env.example changes:**
- Auth0 block (`EXPO_PUBLIC_AUTH0_DOMAIN`, `EXPO_PUBLIC_AUTH0_CLIENT_ID`, `EXPO_PUBLIC_AUTH0_AUDIENCE`) replaced
- New Logto block: `EXPO_PUBLIC_LOGTO_ENDPOINT` and `EXPO_PUBLIC_LOGTO_APP_ID`

## Deviations from Plan

None — plan executed exactly as written.

## Decisions Made

1. **isLoading derived from both sources:** `!isInitialized || isLoading` combines Logto's initialization state with the internal session-fetch loading state. This ensures the app never shows authenticated UI before both are resolved.

2. **signInWithGoogle identical to signInWithEmail:** Both call `signIn(REDIRECT_URI)`. Logto's console controls which social connectors appear on the universal login screen. No client-side connection param needed.

3. **getToken returns null on error:** The plan specified `Promise<string | null>` return type. `getAccessToken()` in @logto/rn throws rather than returning null, so the catch block returns null to match the expected interface.

## Verification Results

- `bunx tsc --noEmit` — zero TypeScript errors
- No `react-native-auth0` references in any `.ts`, `.tsx`, `.js`, or `.json` file
- No `AUTH0` env var references in any `.ts` or `.tsx` file
- `LogtoProvider` and `useLogto` present in `contexts/AuthContext.tsx`
- `"scheme": "libretalk"` preserved in `app.json`
- `plugins/withAuth0SchemeFixPlugin.js` deleted

## User Setup Required

Before running the app, set these env vars (see `.env.example`):

| Variable | Source |
|----------|--------|
| `EXPO_PUBLIC_LOGTO_ENDPOINT` | Logto Console → Applications → your app → Endpoint |
| `EXPO_PUBLIC_LOGTO_APP_ID` | Logto Console → Applications → your app → App ID |

Also configure in Logto Console:
- Create a Native app
- Add redirect URI: `libretalk://callback`
- Add post-logout redirect URI: `libretalk://callback`

## Self-Check: PASSED

| Item | Status |
|------|--------|
| contexts/AuthContext.tsx | FOUND |
| app.json | FOUND |
| .env.example | FOUND |
| plugins/withAuth0SchemeFixPlugin.js | DELETED (confirmed by git status D) |
| commit c6f611e (Task 1) | FOUND |
| commit 936b9bf (Task 2) | FOUND |
| commit 8d09f96 (Task 3) | FOUND |
