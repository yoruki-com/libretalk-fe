---
phase: quick
plan: 3
subsystem: api
tags: [axios, fetch, http-client, react-native, expo]

# Dependency graph
requires: []
provides:
  - axios-based HTTP client layer for all frontend API calls
  - Consistent error handling via axios interceptors pattern
affects: [frontend, api-client]

# Tech tracking
tech-stack:
  added: [axios@1.13.5]
  patterns: [centralized axios error handler, axios params for query strings, responseType text for HTML endpoints]

key-files:
  created: []
  modified:
    - fe/services/api/client.ts
    - fe/services/api/promotions.ts
    - fe/services/api/uploads.ts
    - fe/contexts/AuthContext.tsx
    - fe/app/profile/edit.tsx
    - fe/components/ui/CityPicker.tsx
    - fe/package.json

key-decisions:
  - "Centralized handleAxiosError helper with return type never for clean error flow"
  - "Token exchange error uses try/catch with early return instead of if (!response.ok) pattern"
  - "responseType text for HTML promotion content endpoint to prevent JSON parse errors"

patterns-established:
  - "axios.get/post/put/patch/delete with typed generics for all HTTP calls"
  - "axios params option replaces manual URLSearchParams construction"
  - "responseType blob for file reading, responseType text for non-JSON responses"

# Metrics
duration: 3min
completed: 2026-02-17
---

# Quick Task 3: Replace fetch with axios in the frontend

**All 14 fetch() calls across 6 frontend files replaced with axios, adding typed request params, automatic JSON handling, and centralized error translation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-17T19:52:02Z
- **Completed:** 2026-02-17T19:55:18Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Replaced all 14 fetch() calls across 6 files with axios equivalents
- Centralized error handling via handleAxiosError helper that preserves ApiError contract
- Eliminated manual URLSearchParams, JSON.stringify, and response.json() boilerplate
- HTML content endpoint uses responseType "text" to avoid JSON parse failures
- S3 upload uses responseType "blob" for file reading via axios
- TypeScript compiles cleanly with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install axios and rewrite apiClient core** - `b0e9109` (feat)
2. **Task 2: Replace fetch in promotions and uploads services** - `ce82214` (feat)
3. **Task 3: Replace fetch in AuthContext and UI components** - `81eb0ae` (feat)

Note: All commits are in the `fe/` repository (separate from `be/`).

## Files Created/Modified
- `fe/package.json` - Added axios 1.13.5 dependency
- `fe/bun.lock` - Updated lockfile
- `fe/services/api/client.ts` - Rewrote apiClient with axios, removed handleResponse/buildQueryString helpers
- `fe/services/api/promotions.ts` - axios.get for JSON and text/HTML endpoints
- `fe/services/api/uploads.ts` - axios.get for blob file reading, axios.put for S3 upload
- `fe/contexts/AuthContext.tsx` - axios for Auth0 /userinfo and /oauth/token calls
- `fe/app/profile/edit.tsx` - axios for Mapbox reverse geocoding
- `fe/components/ui/CityPicker.tsx` - axios for Mapbox forward geocoding

## Decisions Made
- Used centralized `handleAxiosError` with return type `never` to consolidate error handling instead of duplicating try/catch in each method
- Token exchange in signInWithApple restructured to use try/catch with early return (cleaner than checking response.ok then falling through)
- Kept `Content-Type: application/json` in getAuthHeaders even though axios sets it automatically (explicit is harmless and documents intent)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Steps
- All frontend HTTP calls now use axios consistently
- Future API additions should follow the axios patterns established here

## Self-Check: PASSED

All 7 modified files verified on disk. All 3 task commits verified in git log (b0e9109, ce82214, 81eb0ae).

---
*Quick Task: 3*
*Completed: 2026-02-17*
