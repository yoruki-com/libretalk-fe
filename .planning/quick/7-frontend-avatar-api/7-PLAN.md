---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - fe/services/api/users.ts
  - fe/hooks/useAvatar.ts
  - fe/services/api/types.ts
autonomous: true
requirements: [AVATAR-API-01, AVATAR-API-02]
must_haves:
  truths:
    - "Frontend can call GET /users/:publicId/avatar to retrieve a signed CloudFront avatar URL"
    - "A reusable hook exists that fetches and caches the signed avatar URL for a given publicId"
  artifacts:
    - path: "fe/services/api/users.ts"
      provides: "getAvatar API function"
      contains: "getAvatar"
    - path: "fe/hooks/useAvatar.ts"
      provides: "useAvatar hook for components"
      exports: ["useAvatar"]
  key_links:
    - from: "fe/hooks/useAvatar.ts"
      to: "fe/services/api/users.ts"
      via: "usersApi.getAvatar call"
      pattern: "usersApi\\.getAvatar"
---

<objective>
Add a frontend API service function and reusable hook for fetching signed avatar URLs from the new backend endpoint `GET /users/:publicId/avatar`.

Purpose: The backend now serves avatar images via signed CloudFront URLs through a dedicated endpoint. The frontend needs an API function and hook to call this endpoint so components can display avatars using fresh signed URLs instead of relying solely on the `avatarUrl` field stored on the user object.

Output: New `getAvatar` method on `usersApi`, new `useAvatar` hook that components can adopt.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@fe/services/api/users.ts
@fe/services/api/types.ts
@fe/services/api/client.ts
@fe/services/api/index.ts
@fe/hooks/useAvatarUpload.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add getAvatar API function and AvatarResponse type</name>
  <files>fe/services/api/users.ts, fe/services/api/types.ts</files>
  <action>
1. In `fe/services/api/types.ts`, add a new frontend-only type in the "Frontend-only types" section at the bottom:
   ```ts
   /** Avatar response from GET /users/:publicId/avatar */
   export interface AvatarResponse {
     avatarUrl: string;
   }
   ```
   This is a frontend-only type (not from the shared schemas) because the avatar endpoint is a simple dedicated endpoint.

2. In `fe/services/api/users.ts`:
   - Add `AvatarResponse` to the existing import from `./types`
   - Add a new method to the `usersApi` object:
     ```ts
     // Get user avatar (signed CloudFront URL)
     async getAvatar(publicId: string): Promise<ApiResponse<AvatarResponse>> {
       return apiClient.get(`/users/${publicId}/avatar`);
     },
     ```
   Place it after the `getByUsername` method to keep user-read operations grouped together.

Note: The endpoint returns `{ success: true, data: { avatarUrl: signedUrl } }` on success or 404 if no avatar. The 404 case will be handled by the existing `handleAxiosError` in `client.ts` which throws `ApiError` with status 404 — consumers (the hook) will catch this.
  </action>
  <verify>Run `cd fe && npx tsc --noEmit` — no new type errors introduced. Verify `getAvatar` appears in the usersApi object.</verify>
  <done>usersApi.getAvatar(publicId) exists, accepts a string publicId, and returns Promise of ApiResponse with AvatarResponse containing avatarUrl string.</done>
</task>

<task type="auto">
  <name>Task 2: Create useAvatar hook</name>
  <files>fe/hooks/useAvatar.ts</files>
  <action>
Create `fe/hooks/useAvatar.ts` — a reusable hook that fetches the signed avatar URL for a given user publicId.

```ts
import { useState, useEffect, useCallback } from "react";
import { usersApi, ApiError } from "@/services/api";

interface UseAvatarResult {
  avatarUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a signed CloudFront avatar URL for a given user.
 * Returns null avatarUrl if the user has no avatar (404) or on error.
 * Pass `enabled: false` to skip fetching (e.g., when publicId is not yet known).
 */
export function useAvatar(
  publicId: string | null | undefined,
  options?: { enabled?: boolean }
): UseAvatarResult {
  const enabled = options?.enabled ?? true;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!publicId || !enabled) {
      setAvatarUrl(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    usersApi
      .getAvatar(publicId)
      .then((response) => {
        if (!cancelled) {
          setAvatarUrl(response.data.avatarUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          // 404 means no avatar — not an error, just null
          if (err instanceof ApiError && err.status === 404) {
            setAvatarUrl(null);
          } else {
            setError(err instanceof Error ? err.message : "Failed to load avatar");
            setAvatarUrl(null);
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicId, enabled, refreshKey]);

  return { avatarUrl, isLoading, error, refetch };
}
```

Key design decisions:
- Returns `null` for avatarUrl on 404 (no avatar) — this is normal, not an error
- Has `enabled` option so callers can conditionally skip the fetch
- Has `refetch` for re-fetching after avatar upload
- Uses cancellation flag to prevent state updates on unmounted components
- Follows existing hook patterns in the codebase (similar structure to useAvatarUpload)
  </action>
  <verify>Run `cd fe && npx tsc --noEmit` — no type errors. Verify the hook file exists at `fe/hooks/useAvatar.ts` and exports `useAvatar`.</verify>
  <done>useAvatar hook exists, accepts publicId and optional enabled flag, returns { avatarUrl, isLoading, error, refetch }. Handles 404 gracefully by returning null avatarUrl. Hook is ready for component adoption.</done>
</task>

</tasks>

<verification>
1. `cd fe && npx tsc --noEmit` passes with no new errors
2. `usersApi.getAvatar` is callable with a string publicId
3. `useAvatar` hook is importable from `@/hooks/useAvatar`
4. The AvatarResponse type is exported from `fe/services/api/types.ts`
</verification>

<success_criteria>
- usersApi has a getAvatar(publicId) method that calls GET /users/:publicId/avatar
- AvatarResponse type exists with avatarUrl: string
- useAvatar hook fetches signed avatar URL, handles 404 as null (no avatar), and provides refetch capability
- All TypeScript compilation passes
</success_criteria>

<output>
After completion, create `.planning/quick/7-frontend-avatar-api/7-SUMMARY.md`
</output>
