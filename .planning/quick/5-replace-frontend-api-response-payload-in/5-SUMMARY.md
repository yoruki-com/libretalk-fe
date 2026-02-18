---
phase: quick-5
plan: 01
subsystem: frontend-api-types
tags: [types, shared-schemas, frontend, deduplication]
dependency-graph:
  requires: ["@yoruki-com/libretalk-mythos-schemas@0.0.4"]
  provides: ["frontend-shared-types"]
  affects: ["fe/services/api/*", "fe/hooks/*", "fe/app/*"]
tech-stack:
  added: []
  patterns: ["type-re-export-with-aliases", "pagination-field-alignment"]
key-files:
  created: []
  modified:
    - be/libs/mythos-schemas/package.json
    - fe/package.json
    - fe/bun.lock
    - fe/services/api/types.ts
    - fe/services/api/vibes.ts
    - fe/services/api/likes.ts
    - fe/services/api/follows.ts
    - fe/services/api/promotions.ts
    - fe/services/api/uploads.ts
    - fe/services/api/index.ts
    - fe/hooks/useComments.ts
    - fe/hooks/useConversation.ts
    - fe/hooks/useConversations.ts
    - fe/hooks/useVibes.ts
    - fe/app/(tabs)/community.tsx
    - fe/app/profile/[id].tsx
    - fe/app/profile/edit.tsx
decisions:
  - "Frontend-specific DTOs (CreateCommentDto, LikePostDto, LikeCommentDto) kept local because they include fields not in backend schemas (authorPublicId, userPublicId)"
  - "Type aliases (User = UserResponse, Vibe = PostResponse, etc.) maintain backward compatibility so consumer files need minimal changes"
  - "Pagination fields renamed to match backend canonical names (totalItems, hasPrevPage)"
  - "PresignedUrlRequest kept local in frontend (identical shape but decoupled from backend Zod schema)"
metrics:
  duration: "5min"
  completed: "2026-02-18"
---

# Quick Task 5: Replace Frontend API Response Payload Types Summary

Replace locally-defined API response interfaces in fe/services/api/ with shared types from @yoruki-com/libretalk-mythos-schemas, eliminating type duplication between backend and frontend.

## What Was Done

### Task 1: Publish mythos-schemas 0.0.4

Bumped @yoruki-com/libretalk-mythos-schemas from 0.0.3 to 0.0.4 to include the payload types and common.types.ts exports (SuccessPayload, PaginatedPayload, ListPayload, PaginationMeta) that were merged after the last publish. Updated the frontend dependency and verified the installed package contains all required declaration files.

### Task 2: Replace Frontend Local Interfaces

Rewrote `fe/services/api/types.ts` from 248 lines of hand-written interfaces to a lean re-export module that imports from the shared schema library. Created type aliases for all existing frontend names to maintain backward compatibility:

- Entity types: `User = UserResponse`, `Conversation = ConversationResponse`, `Message = MessageResponse`, etc.
- Derived types: `UserMe`, `UserLanguage`, `ConversationParticipant`, `MessageSender`, etc. extracted via TypeScript utility types
- Enum types: `PersonalityType`, `Gender`, `LanguageProficiency`, `MessageType`, `MessageStatus` extracted from response types
- API wrappers: `ApiResponse<T> = SuccessPayload<T>`, `PaginatedResponse<T> = PaginatedPayload<T>`

Removed duplicate interfaces from vibes.ts, likes.ts, follows.ts, promotions.ts, and uploads.ts. Updated 4 hooks (useComments, useConversation, useConversations, useVibes) to use backend-canonical pagination field names.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CreateConversationDto `isGroup` field required by backend schema**
- **Found during:** Task 2 TypeScript verification
- **Issue:** Backend `CreateConversationDto` uses `z.boolean().default(false)` for `isGroup`, which in Zod 4 makes the field required in the output/inferred type. Frontend called `create({ participantIds: [...] })` without `isGroup`.
- **Fix:** Added explicit `isGroup: false` to both call sites (community.tsx, profile/[id].tsx).
- **Files modified:** `fe/app/(tabs)/community.tsx`, `fe/app/profile/[id].tsx`
- **Commit:** ca9fa2b

**2. [Rule 1 - Bug] LanguageResponse includes createdAt/updatedAt not in old Language type**
- **Found during:** Task 2 TypeScript verification
- **Issue:** Backend `LanguageResponse` has `createdAt` and `updatedAt` fields. The edit profile screen constructs `Language` objects from user language data (code, name, nativeName) without these fields, causing type errors.
- **Fix:** Added empty string stubs for `createdAt` and `updatedAt` in the constructed objects (values unused in UI).
- **Files modified:** `fe/app/profile/edit.tsx`
- **Commit:** ca9fa2b

**3. [Rule 1 - Bug] Conflicting CreateCommentDto/LikePostDto/LikeCommentDto exports**
- **Found during:** Task 2 TypeScript verification
- **Issue:** Backend DTOs (`CreateCommentDto`, `LikePostDto`, `LikeCommentDto`) lack fields that the frontend versions need (`authorPublicId`, `userPublicId`). Re-exporting both from index.ts caused TS2308 ambiguity errors.
- **Fix:** Excluded backend versions from types.ts re-exports. Frontend-specific versions (with extra fields) in vibes.ts and likes.ts are the authoritative exports.
- **Files modified:** `fe/services/api/types.ts`, `fe/services/api/index.ts`
- **Commit:** ca9fa2b

## Commits

| Task | Commit | Description | Repository |
|------|--------|-------------|------------|
| 1 | 668307c | Bump mythos-schemas to 0.0.4 and publish | be |
| 1 | d7cb6bc | Update frontend to mythos-schemas 0.0.4 | fe |
| 2 | ca9fa2b | Replace frontend local types with mythos-schemas imports | fe |

## Verification Results

- `bunx tsc --noEmit` passes with 0 errors
- No `interface User {` in fe/services/api/ (replaced by type alias)
- No `interface Conversation {` in fe/services/api/ (replaced by type alias)
- No `interface Message {` in fe/services/api/ (replaced by type alias)
- `@yoruki-com/libretalk-mythos-schemas` imports found in fe/services/api/types.ts
- No `totalCount` references remain in fe/ (replaced with totalItems)
- No `hasPreviousPage` references remain in fe/ (replaced with hasPrevPage)

## Self-Check: PASSED

All files exist and all commits verified.
