# Codebase Concerns

**Analysis Date:** 2026-02-17

## Tech Debt

**Large Component Files - Edit Profile Screen:**
- Issue: `app/profile/edit.tsx` contains 892 lines in a single component with complex modal state management, language selection logic, and multiple sections
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/edit.tsx`
- Impact: Difficult to test, debug, and maintain; high cognitive load for developers; difficult to reuse sub-sections
- Fix approach: Extract language selection into separate `<LanguagePicker>` component, extract personal info section into `<PersonalInfoSection>` component, separate modal logic into custom hooks

**Large Component Files - Profile Detail Screen:**
- Issue: `app/profile/[id].tsx` contains 717 lines with mixed data fetching, tab navigation, conversation checking, and vibes display
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/[id].tsx`
- Impact: Complex state management with multiple useEffect hooks; testing is difficult; section logic is entangled
- Fix approach: Extract profile header, vibes tab, and honor tab into separate components; move conversation checking into a custom hook

**Direct Fetch Calls in API Layers:**
- Issue: S3 upload and Auth0 token exchange use raw `fetch()` instead of centralized API client
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/services/api/uploads.ts` (lines 27, 30), `C:/Users/Anton/Develop/Personal/how-are-you/fe/contexts/AuthContext.tsx` (lines 71, 163, 197)
- Impact: Inconsistent error handling; token management bypasses auth interceptor; S3 upload failures lack standard error reporting
- Fix approach: Create specialized client methods for presigned URLs and token exchange; ensure all HTTP calls go through centralized client with consistent retry logic

**Empty Error Handlers:**
- Issue: Multiple catch blocks silently swallow errors without logging
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/edit.tsx` (line 132: `catch(() => {})`)
- Impact: Production errors go undetected; difficult to debug user-reported issues
- Fix approach: Add console.error() or error tracking (Sentry) to all catch blocks; at minimum log to help diagnose issues in production

**Console.log Usage in Production Code:**
- Issue: Unstructured console logging throughout codebase (multiple console.log/error calls)
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/(tabs)/chat.tsx` (line 58: `console.log("Archive pressed")`), `C:/Users/Anton/Develop/Personal/how-are-you/fe/contexts/AuthContext.tsx` (multiple lines), and others
- Impact: No centralized logging; debug statements pollute production; can't control log verbosity by environment
- Fix approach: Create logger utility with levels (debug, info, warn, error); integrate error tracking service for production

## Security Considerations

**API Token Exposure in Auth0 Token Exchange:**
- Risk: Raw `fetch()` calls to Auth0 endpoints expose access tokens in request bodies and headers without retry/circuit breaker protection
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/contexts/AuthContext.tsx` (lines 163-174, 197-202)
- Current mitigation: None observed; tokens are passed directly to third-party API
- Recommendations:
  1. Use Expo SecureStore instead of plain state for sensitive tokens
  2. Implement token refresh with automatic cleanup on expiry
  3. Add request timeout to prevent hanging auth requests
  4. Log token exchange errors without exposing token values

**Location Data in Reverse Geocoding:**
- Risk: User location coordinates sent to Mapbox API without validation or rate limiting
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/edit.tsx` (lines 137-189)
- Current mitigation: None; coordinates sent directly to external API
- Recommendations:
  1. Add permission prompt UX before location collection
  2. Validate coordinates are within expected range before sending to Mapbox
  3. Consider rate limiting geocoding requests
  4. Add timeout to prevent indefinite location requests

**S3 Presigned URL Handling:**
- Risk: Presigned URLs are generated server-side but used immediately; no validation of URL origin
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/services/api/uploads.ts` (lines 22-41)
- Current mitigation: None
- Recommendations:
  1. Add URL origin validation before using presigned URL
  2. Implement request signing to validate S3 upload response
  3. Add Content-Length and Content-MD5 headers to detect tampering
  4. Implement upload timeout

## Performance Bottlenecks

**Mapbox Static Map Placeholder:**
- Problem: Profile screen has hardcoded placeholder Mapbox static map that's never updated with real location
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/[id].tsx` (line 31-32)
- Cause: Map generation logic not implemented
- Improvement path: Either implement dynamic map generation with actual coordinates or remove placeholder UI

**Nested API Calls on Profile Load:**
- Problem: Profile screen fetches user data, then conditionally fetches conversation data and vibes - creates waterfall request pattern
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/[id].tsx` (lines 54-96)
- Cause: Sequential useEffect hooks that depend on each other
- Improvement path: Use Promise.all() or parallel requests where possible; fetch conversation data only when needed (lazy load)

**Language Selection List Filtering:**
- Problem: Filters all languages on every keystroke without debounce or memoization
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/edit.tsx` (lines 256-268)
- Cause: No useMemo for filtered list
- Improvement path: Memoize filteredModalLanguages with useMemo; consider debouncing search input

## Fragile Areas

**AuthContext Token Management:**
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/contexts/AuthContext.tsx`
- Why fragile: Complex token handling with multiple state sources (Auth0 lib, local state, credentials getter); fallback logic can mask real errors; token refresh logic not visible
- Safe modification: Add comprehensive error logging before changing auth flow; add integration tests for token refresh; document all fallback paths
- Test coverage: No visible test coverage; Apple Sign-In fallback path is untested

**Edit Profile Language Synchronization:**
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/edit.tsx` (lines 214-229)
- Why fragile: Languages updated separately only if `languagesChanged` flag is true; flag can become out of sync with actual changes; no validation that both languages are selected before update
- Safe modification: Add explicit validation before language API call; consider storing language state in separate hook; add unit tests for language update logic
- Test coverage: No tests for language selection and update flow

**Reverse Geocoding with Mapbox:**
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/edit.tsx` (lines 137-189)
- Why fragile: Deeply nested promise chains with multiple error points; country lookup depends on exact code matching; city name parsing is fragile across different locales
- Safe modification: Add error handling for each geocoding step; validate country code format before lookup; add fallback when country match fails
- Test coverage: Likely no tests for geocoding fallback behavior or international locale handling

**useCurrentUser Cache with Module-Level State:**
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/hooks/useCurrentUser.ts`
- Why fragile: Module-level singleton state can cause issues in tests; concurrent fetch requests might race; cache invalidation is manual
- Safe modification: Add request deduplication tests; verify logout properly clears cache across all components; test concurrent hook usage
- Test coverage: No visible tests for concurrent fetch deduplication or cache invalidation

## Known Bugs

**Archive Button Placeholder:**
- Symptoms: Archive button in chat list is non-functional
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/(tabs)/chat.tsx` (line 57-59)
- Trigger: Click "Archive" button in chat list
- Workaround: None; feature not implemented

**Placeholder Mapbox Token in Profile:**
- Symptoms: Map static image may not render correctly if token is invalid
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/[id].tsx` (line 32)
- Trigger: View profile page
- Workaround: None; placeholder needs to be replaced with real implementation

## Test Coverage Gaps

**Authentication Flows:**
- What's not tested: Apple Sign-In token exchange, Auth0 fallback flow, token refresh logic, session recovery
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/contexts/AuthContext.tsx`
- Risk: Silent auth failures; users unable to login if token exchange fails; no visibility into auth state corruption
- Priority: High - Auth is critical path

**Profile Edit Validation:**
- What's not tested: Language selection edge cases (selecting same language for native and learning), dateOfBirth validation, city field with special characters
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/edit.tsx`
- Risk: Invalid data sent to API; user experience broken for edge cases
- Priority: High - User data integrity

**API Error Handling:**
- What's not tested: Network timeout scenarios, 401 response handling, malformed API responses, retry behavior
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/services/api/client.ts`
- Risk: Unhandled errors crash app or hang indefinitely; 401 errors don't trigger logout
- Priority: High - Affects all API operations

**S3 Upload Flow:**
- What's not tested: Presigned URL expiration, failed blob conversion, S3 timeout, upload cancellation
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/services/api/uploads.ts`
- Risk: Avatar upload hangs or fails silently; no recovery mechanism
- Priority: Medium - Affects user profile completion

**Geolocation and Reverse Geocoding:**
- What's not tested: Location permission denial, geocoding API failure, international locale handling, timeout scenarios
- Files: `C:/Users/Anton/Develop/Personal/how-are-you/fe/app/profile/edit.tsx` (lines 137-189)
- Risk: User stuck waiting for location; confusing error messages; doesn't work in certain regions
- Priority: Medium - Feature completeness

---

*Concerns audit: 2026-02-17*
