---
phase: quick-7
plan: 01
subsystem: api
tags: [avatar, cloudfront, react-hook, signed-url]

# Dependency graph
requires:
  - phase: quick-6
    provides: CloudFront signed URL backend endpoint (GET /users/:publicId/avatar)
provides:
  - usersApi.getAvatar(publicId) API function for signed avatar URL retrieval
  - useAvatar hook for component-level avatar URL fetching with caching and refetch
affects: [profile-components, chat-components, avatar-display]

# Tech tracking
tech-stack:
  added: []
  patterns: [hook-with-cancellation, graceful-404-handling]

key-files:
  created:
    - fe/hooks/useAvatar.ts
  modified:
    - fe/services/api/types.ts
    - fe/services/api/users.ts

key-decisions:
  - "AvatarResponse is a frontend-only type (not from shared schemas) since the avatar endpoint is a simple dedicated endpoint"
  - "404 from avatar endpoint treated as null (no avatar), not as an error condition"
  - "useAvatar hook uses cancellation flag pattern consistent with existing hooks in codebase"

patterns-established:
  - "Graceful 404 handling: hooks that call endpoints which may 404 return null instead of throwing"
  - "Conditional fetch via enabled option: skip API calls when publicId is not yet available"

requirements-completed: [AVATAR-API-01, AVATAR-API-02]

# Metrics
duration: 3min
completed: 2026-02-18
---

# Quick Task 7: Frontend Avatar API Summary

**usersApi.getAvatar and useAvatar hook for fetching signed CloudFront avatar URLs with graceful 404 handling**

## Performance

- **Duration:** 3 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added AvatarResponse type and getAvatar(publicId) method to usersApi service
- Created useAvatar hook with enabled flag, refetch capability, and cancellation on unmount
- 404 responses (no avatar) handled gracefully as null rather than error state

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getAvatar API function and AvatarResponse type** - `11ccf4b` (feat)
2. **Task 2: Create useAvatar hook** - `48a00ed` (feat)

## Files Created/Modified
- `fe/services/api/types.ts` - Added AvatarResponse interface in frontend-only types section
- `fe/services/api/users.ts` - Added AvatarResponse import and getAvatar method to usersApi
- `fe/hooks/useAvatar.ts` - New reusable hook for fetching signed avatar URLs

## Decisions Made
- AvatarResponse kept as a frontend-only type (not extracted to shared schemas) since the avatar endpoint is a simple dedicated endpoint
- 404 from the avatar endpoint is treated as "no avatar" (null), not an error -- this matches the backend behavior where users without avatars simply have no avatar record
- Hook uses the cancellation flag pattern consistent with other hooks in the codebase (e.g., useAvatarUpload)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Steps
- Components can adopt useAvatar hook to display signed avatar URLs
- After avatar upload, call refetch() to get the newly signed URL

## Self-Check: PASSED

- [x] `fe/hooks/useAvatar.ts` - verified via git show HEAD (71 lines, 1 file)
- [x] `fe/services/api/types.ts` - verified via git show 11ccf4b (5 lines added)
- [x] `fe/services/api/users.ts` - verified via git show 11ccf4b (6 lines added)
- [x] Commit `11ccf4b` exists - verified via git log
- [x] Commit `48a00ed` exists - verified via git log
- [x] TypeScript compilation passes - npx tsc --noEmit returned no errors

---
*Quick Task: 7-frontend-avatar-api*
*Completed: 2026-02-18*
