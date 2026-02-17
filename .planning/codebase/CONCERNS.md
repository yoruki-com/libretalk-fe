# Codebase Concerns

**Analysis Date:** 2026-02-17

## Tech Debt

**Large Component Files - Edit Profile Screen:**
- Issue: `app/profile/edit.tsx` contains 892 lines in a single component with complex modal state management, language selection logic, and multiple sections
- Files: `app/profile/edit.tsx`
- Impact: Difficult to test, debug, and maintain; high cognitive load for developers; difficult to reuse sub-sections
- Fix approach: Extract language selection into separate `<LanguagePicker>` component, extract personal info section into `<PersonalInfoSection>` component, separate modal logic into custom hooks

**Large Component Files - Profile Detail Screen:**
- Issue: `app/profile/[id].tsx` contains 717 lines with mixed data fetching, tab navigation, conversation checking, and vibes display
- Files: `app/profile/[id].tsx`
- Impact: Complex state management with multiple useEffect hooks; testing is difficult; section logic is entangled
- Fix approach: Extract profile header, vibes tab, and honor tab into separate components; move conversation checking into a custom hook

**Large Components - Community Feed:**
- Issue: `app/(tabs)/community.tsx` is 232 lines with complex filter logic, conversation tracking, and user card rendering
- Files: `app/(tabs)/community.tsx`
- Impact: Mixing data fetching (conversations) with UI rendering; makes refactoring risky
- Fix approach: Extract conversation fetching logic to separate hook (`useCommunityConversations`), extract card rendering to component

**Direct Fetch Calls in API Layers:**
- Issue: S3 upload and Auth0 token exchange use raw `fetch()` instead of centralized API client
- Files: `services/api/uploads.ts` (lines 27, 30), `contexts/AuthContext.tsx` (lines 71, 163, 197)
- Impact: Inconsistent error handling; token management bypasses auth interceptor; S3 upload failures lack standard error reporting
- Fix approach: Create specialized client methods for presigned URLs and token exchange; ensure all HTTP calls go through centralized client with consistent retry logic

**Empty Error Handlers:**
- Issue: Multiple catch blocks silently swallow errors without logging
- Files: `app/profile/edit.tsx` (line 132: `catch(() => {})`)
- Impact: Production errors go undetected; difficult to debug user-reported issues
- Fix approach: Add console.error() or error tracking (Sentry) to all catch blocks; at minimum log to help diagnose issues in production

**Console.log Usage in Production Code:**
- Issue: Unstructured console logging throughout codebase (28 console calls total)
- Files: `app/(tabs)/chat.tsx`, `app/(tabs)/community.tsx`, `contexts/AuthContext.tsx`, `services/api/client.ts` and others
- Impact: No centralized logging; debug statements pollute production; can't control log verbosity by environment
- Fix approach: Create logger utility with levels (debug, info, warn, error); integrate error tracking service for production

## Security Considerations

**Dependency Vulnerabilities:**
- Risk: Multiple known CVEs in transitive dependencies:
  - `@isaacs/brace-expansion`: High severity - Uncontrolled Resource Consumption (ReDoS attack)
  - `xml2js`: Moderate - Prototype Pollution vulnerability
  - `ajv`: Moderate - ReDoS when using `$data` option
  - `qs`: Low - arrayLimit bypass in comma parsing
- Files: `package.json`
- Current mitigation: None observed. Versions are pinned but contain known vulnerabilities.
- Recommendations:
  - Run `bun update` to patch transitive dependencies immediately
  - Establish regular security audit routine (weekly with `bun audit`)
  - Consider replacing unmaintained dependencies like `xml2js`

**API Token Exposure in Auth0 Token Exchange:**
- Risk: Raw `fetch()` calls to Auth0 endpoints expose access tokens in request bodies without protection
- Files: `contexts/AuthContext.tsx` (lines 163-174, 197-202)
- Current mitigation: None observed; tokens passed directly to third-party API with error exposed in logs
- Recommendations:
  1. Use Expo SecureStore instead of plain state for sensitive tokens
  2. Implement token refresh with automatic cleanup on expiry
  3. Add request timeout to prevent hanging auth requests (currently no timeout)
  4. Log token exchange errors without exposing token values in console

**Location Data in Reverse Geocoding:**
- Risk: User location coordinates sent to Mapbox API without validation or rate limiting
- Files: `app/profile/edit.tsx` (lines 137-189)
- Current mitigation: None; coordinates sent directly to external API
- Recommendations:
  1. Add permission prompt UX before location collection
  2. Validate coordinates are within expected range before sending to Mapbox
  3. Consider rate limiting geocoding requests
  4. Add timeout to prevent indefinite location requests

**S3 Presigned URL Handling:**
- Risk: Presigned URLs are generated server-side but used immediately; no validation of URL origin
- Files: `services/api/uploads.ts` (lines 22-41), `hooks/useAvatarUpload.ts` (line 51)
- Current mitigation: URL comes from authenticated API endpoint but no additional client-side validation
- Recommendations:
  1. Add URL origin validation before using presigned URL: validate domain/bucket
  2. Implement request signing to validate S3 upload response
  3. Add Content-Length header to detect tampering
  4. Implement upload timeout to prevent indefinite hangs

**API Error Responses Not Validated:**
- Risk: `handleResponse` in API client assumes all error responses have `.message` property. Malformed response could throw unhandled error.
- Files: `services/api/client.ts` (lines 47-55)
- Current mitigation: `.catch(() => null)` on JSON parse, but subsequent property access could fail
- Recommendations: Add type guard for error response structure; provide fallback message

**Type Casting Bypasses Type Safety:**
- Issue: `as any` cast used in edit profile for MBTI type (line 881) and tab navigation (line 13)
- Files: `app/profile/edit.tsx` (line 881), `app/(tabs)/_layout.tsx` (line 13)
- Risk: Bypasses TypeScript safety; could introduce runtime type errors
- Fix: Create proper type union or const assertion; avoid `as any`

## Performance Bottlenecks

**Mapbox Static Map Placeholder:**
- Problem: Profile screen has hardcoded placeholder Mapbox static map that's never updated with real location
- Files: `app/profile/[id].tsx` (line 31-32)
- Cause: Map generation logic not implemented
- Improvement path: Either implement dynamic map generation with actual coordinates or remove placeholder UI

**Nested API Calls on Profile Load:**
- Problem: Profile screen fetches user data, then conditionally fetches conversation data and vibes - creates waterfall request pattern
- Files: `app/profile/[id].tsx` (lines 54-96)
- Cause: Sequential useEffect hooks that depend on each other
- Improvement path: Use Promise.all() or parallel requests where possible; fetch conversation data only when needed (lazy load)

**Missing Optimistic Updates Error Handling:**
- Problem: `useVibes.toggleLike` and `useComments.toggleLike` perform optimistic updates but if error occurs, UI state could be inconsistent
- Files: `hooks/useVibes.ts` (lines 85-131), `hooks/useComments.ts` (lines 111-160)
- Cause: Optimistic update completes before API call; if API fails, revert logic relies on stale closure variable
- Improvement path:
  - Store optimistic transaction ID to prevent double-reverts
  - Add loading state for each item during like operation
  - Consider using React Query for robust state management

**Language Selection List Filtering:**
- Problem: Filters all languages on every keystroke without debounce or memoization
- Files: `app/profile/edit.tsx` (lines 256-268)
- Cause: No useMemo for filtered list; language search state triggers re-filter
- Improvement path: Memoize filteredModalLanguages with useMemo; add debounce to search input

**Heavy Render on Community Screen:**
- Problem: `app/(tabs)/community.tsx` fetches conversations on mount, then for each user card checks against `existingChatMap`
- Files: `app/(tabs)/community.tsx` (lines 44-56, 59-70)
- Cause: Map recomputed on every render if conversations/profile changes; no pagination on user list
- Improvement path:
  - Pagination for community feed (not currently implemented)
  - Lazy load conversation data only when opening chat
  - Optimize memoization of conversation map

**No Pagination on Conversations:**
- Problem: `conversationsApi.getByUser()` loads all conversations at once with no limit/pagination
- Files: `app/(tabs)/community.tsx` (line 47)
- Cause: API call includes all user conversations without pagination params
- Improvement path: Add pagination to conversations fetch; load conversations on demand when opening chat

## Fragile Areas

**AuthContext Token Getter Initialization:**
- Files: `contexts/AuthContext.tsx`
- Why fragile: Token getter is registered in `useEffect` (line 130) but called from outside React lifecycle. If `getToken` callback doesn't update properly, API client won't refresh tokens. The `isAuthenticated` dependency in `getToken` line 126 could cause stale closures.
- Safe modification:
  - Add explicit dependency array to useEffect: `[getToken]`
  - Consider moving token getter registration to initialization phase, not in effect
  - Add unit tests for token refresh flow
- Test coverage: No tests exist for token expiration/refresh scenarios

**useCurrentUser Cache with Module-Level State:**
- Files: `hooks/useCurrentUser.ts`
- Why fragile: Module-level singleton state can cause issues in tests; concurrent fetch requests might race; cache invalidation is manual
- Safe modification:
  - Add request deduplication tests; verify logout properly clears cache across all components
  - Test concurrent hook usage and race conditions
  - Consider using React Query for more robust caching
- Test coverage: No visible tests for concurrent fetch deduplication or cache invalidation

**Language and MBTI Modal State in Edit Profile:**
- Files: `app/profile/edit.tsx` (lines 60-90, 276-290)
- Why fragile: State scattered across component (languageModalVisible, languageModalTarget, languageSearch, allLanguages). Closing modal doesn't reset search, leading to stale filtering. MBTI state uses `as any` cast (line 881) which bypasses type safety.
- Safe modification:
  - Extract modal as separate component with isolated state
  - Reset search on modal open
  - Remove `as any` cast; properly type personality type
  - Add validation for language selection
- Test coverage: No tests for modal state transitions

**Edit Profile Language Synchronization:**
- Files: `app/profile/edit.tsx` (lines 214-229)
- Why fragile: Languages updated separately only if `languagesChanged` flag is true; flag can become out of sync with actual changes; no validation that both languages are selected before update
- Safe modification: Add explicit validation before language API call; consider storing language state in separate hook; add unit tests for language update logic
- Test coverage: No tests for language selection and update flow

**Reverse Geocoding with Mapbox:**
- Files: `app/profile/edit.tsx` (lines 137-189)
- Why fragile: Deeply nested promise chains with multiple error points; country lookup depends on exact code matching; city name parsing is fragile across different locales
- Safe modification: Add error handling for each geocoding step; validate country code format before lookup; add fallback when country match fails
- Test coverage: Likely no tests for geocoding fallback behavior or international locale handling

**API Client Token Getter Could Fail Silently:**
- Files: `services/api/client.ts` (lines 31-40)
- Why fragile: If `tokenGetter` throws, error is caught and logged but request continues without auth token. Could make unauthenticated requests silently.
- Safe modification:
  - Re-throw error after logging in critical cases
  - Add telemetry to track token fetch failures
  - Consider circuit breaker for repeated failures

## Known Bugs

**Incomplete In-App Purchase Integration:**
- Symptoms: Purchase button in promo screen logs message but doesn't execute purchase flow
- Files: `app/promo/[slug].tsx` (line 71)
- Trigger: User clicks purchase action in WebView
- Workaround: None - feature is stubbed out
- Status: Noted with TODO comment; should be implemented before launch

**Archive Button Placeholder:**
- Symptoms: Archive button in chat list is non-functional
- Files: `app/(tabs)/chat.tsx` (line 57-59)
- Trigger: Click "Archive" button in chat list
- Workaround: None; feature not implemented

**Placeholder Mapbox Token in Profile:**
- Symptoms: Map static image may not render correctly if token is invalid
- Files: `app/profile/[id].tsx` (line 32)
- Trigger: View profile page
- Workaround: None; placeholder needs to be replaced with real implementation

## Scaling Limits

**Conversations Storage in Community Screen:**
- Current capacity: All conversations for user stored in memory
- Limit: Users with 500+ conversations could see memory/performance degradation
- Scaling path: Implement pagination with cursor-based loading; lazy load conversations only when needed

**Vibes Feed Infinite Scroll:**
- Current capacity: `useVibes` hook stores all loaded vibes in state; no memory limit
- Limit: Loading 100+ pages (5000+ vibes) could exhaust device memory
- Scaling path: Implement windowed list with virtual scrolling, implement pagination with older posts removed from memory

**Language List in Edit Profile:**
- Current capacity: All languages fetched once and stored in component state (`allLanguages`)
- Limit: If language list grows beyond ~500, filtering could become slow
- Scaling path: Implement virtual list for language modal, add debounce to search

## Dependencies at Risk

**react-native-auth0 (v5.4.0):**
- Risk: Auth0 React Native SDK is maintained but v5.4.0 may have unresolved issues. Custom token exchange logic for Apple Sign-In adds complexity.
- Impact: If Auth0 SDK breaks, token exchange logic in AuthContext would need rewriting
- Migration plan: Evaluate alternative: `@react-native-firebase/auth` (Firebase) or `supabase-js` (Supabase) for simpler auth flow. Current implementation has fragile fallback logic (lines 180-189 in AuthContext).

**react-native-image-crop-picker (v0.51.1):**
- Risk: Older version; breaking changes expected. Gallery/camera permissions handling is device-specific and fragile.
- Impact: Changes to camera/gallery APIs in React Native could break image picker
- Migration plan: Monitor for v0.52+ releases. Consider expo-image-picker alternative for Expo projects.

**@rnmapbox/maps (v10.2.10):**
- Risk: Mapbox SDK requires native compilation; version mismatches common across platforms
- Impact: Android/iOS build failures if native version drifts from package version
- Migration plan: Lock native Mapbox SDK versions explicitly in Xcode/Gradle configs. Monitor for breaking changes in Mapbox SDK updates.

## Missing Critical Features

**No Error Boundary:**
- Problem: App has no error boundary. Crash in component tree crashes entire app with no recovery.
- Blocks: User cannot recover from runtime errors without force-closing app
- Recommendation: Implement React ErrorBoundary at app root; fall back to error screen showing basic info

**No Offline Mode:**
- Problem: App requires internet connection for all features. No offline storage or sync.
- Blocks: Users cannot browse cached profiles/vibes when offline
- Recommendation: Implement local-first caching with sync on reconnect using AsyncStorage or SQLite

**No Rate Limiting on Client:**
- Problem: Hooks like `useVibes.loadMore()` can be called rapidly without throttling
- Blocks: Users could DOS backend by clicking "Load more" repeatedly
- Recommendation: Add debounce/throttle to infinite scroll handlers

## Test Coverage Gaps

**Authentication Flows:**
- What's not tested: Apple Sign-In token exchange, Auth0 fallback flow, token refresh logic, session recovery
- Files: `contexts/AuthContext.tsx`
- Risk: Silent auth failures; users unable to login if token exchange fails; no visibility into auth state corruption
- Priority: High - Auth is critical path

**Profile Edit Validation:**
- What's not tested: Language selection edge cases (selecting same language for native and learning), dateOfBirth validation, city field with special characters
- Files: `app/profile/edit.tsx`
- Risk: Invalid data sent to API; user experience broken for edge cases
- Priority: High - User data integrity

**API Error Handling:**
- What's not tested: Network timeout scenarios, 401 response handling, malformed API responses, retry behavior
- Files: `services/api/client.ts`
- Risk: Unhandled errors crash app or hang indefinitely; 401 errors don't trigger logout
- Priority: High - Affects all API operations

**S3 Upload Flow:**
- What's not tested: Presigned URL expiration, failed blob conversion, S3 timeout, upload cancellation
- Files: `services/api/uploads.ts`, `hooks/useAvatarUpload.ts`
- Risk: Avatar upload hangs or fails silently; no recovery mechanism
- Priority: Medium - Affects user profile completion

**Geolocation and Reverse Geocoding:**
- What's not tested: Location permission denial, geocoding API failure, international locale handling, timeout scenarios
- Files: `app/profile/edit.tsx` (lines 137-189)
- Risk: User stuck waiting for location; confusing error messages; doesn't work in certain regions
- Priority: Medium - Feature completeness

---

*Concerns audit: 2026-02-17*
