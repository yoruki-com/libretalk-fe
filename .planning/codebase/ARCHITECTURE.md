# Architecture

**Analysis Date:** 2026-02-17

## Pattern Overview

**Overall:** Layered Client Architecture with Context-based State Management

The codebase implements a modern React Native mobile app using Expo Router for file-based routing and a layered architecture separating presentation (screens), reusable UI, business logic (hooks), and API communication. State is managed via React Context (global) and custom hooks (local), with special patterns for deduplication and persistence.

**Key Characteristics:**
- **Expo Router Navigation**: File-based routing system mirroring Next.js patterns with route groups for layout control
- **Context + Hooks State Management**: React Context for global state (Auth, Theme); custom hooks with `useState`/`useEffect` for features; singleton external store pattern for shared user profile
- **Type-Safe API Layer**: Centralized fetch-based HTTP client with TypeScript types, automatic Bearer token injection, and error mapping
- **Clean Separation of Concerns**: Strict layering prevents circular dependencies (UI → Hooks → API, never reverse)
- **Theme System**: Dual light/dark modes with runtime switching, persisted to AsyncStorage, injected via Context
- **Authentication**: Auth0 SDK for credential management with custom token getter pattern enabling automatic re-authentication

## Layers

**Presentation Layer (Routes & Screens):**
- Purpose: Handle user interactions and coordinate UI + hooks
- Location: `app/**/*.tsx` - Expo Router file-based routing
- Contains: Screen components (e.g., `app/(tabs)/chat.tsx`, `app/chat/[id].tsx`, `app/onboarding/step1.tsx`)
- Depends on: Hooks for data, UI components for rendering, contexts for global state
- Used by: Expo Router navigation system
- Pattern: Each screen imports hooks, calls them on mount, receives `{ data, isLoading, error, refresh, loadMore }`, renders conditionally

**Component Layer (UI Components):**
- Purpose: Reusable, stateless presentational components with consistent styling
- Location: `components/ui/**/*.tsx`
- Contains: Button, ChatCard, ChatInput, ChatHeader, ProfileCard, CommentCard, CommunityCard, DateSeparator, DropdownMenu, SearchInput, BottomNavigation, and 25+ other UI primitives
- Depends on: Theme context (for colors/spacing), constants (typography), React Native primitives
- Used by: Screens and other components
- Pattern: Accept props for content/styling, consume theme from ThemeContext via `useTheme()`, use NativeWind for Tailwind styling

**Business Logic Layer (Hooks):**
- Purpose: Encapsulate data fetching, state management, and side effects
- Location: `hooks/*.ts`
- Contains: Custom hooks like `useConversations`, `useComments`, `useCurrentUser`, `useVibes`, `useCommunity`, `useAvatarUpload`, `useChatHelpers`
- Depends on: API services, contexts, React hooks
- Used by: Screens and components
- Patterns:
  - **Standard Hook** (`useConversations`, `useComments`): `useState` + `useEffect` for fetch, return `{ data, isLoading, error, pagination, refresh, loadMore }`
  - **Singleton Cache** (`useCurrentUser`): Module-level store with `useSyncExternalStore()`, deduplicates concurrent requests across component tree
- Features: `autoFetch` flag for conditional loading, `enabled` parameter for conditional execution, pagination with `loadMore()`, manual `refresh()`

**API Service Layer:**
- Purpose: Expose typed API endpoints grouped by domain
- Location: `services/api/**/*.ts`
- Contains: Domain-specific modules: `users.ts`, `conversations.ts`, `vibes.ts`, `comments.ts`, `likes.ts`, `follows.ts`, `uploads.ts`, `promotions.ts`, `countries.ts`, `languages.ts`, `passions.ts`
- Depends on: API client, type definitions
- Used by: Hooks and directly by screens
- Pattern: Each module exports object (e.g., `usersApi`) with async methods (e.g., `getMe()`, `update(publicId, data)`) that delegate to `apiClient`
- Types: Request/response types defined in `services/api/types.ts` (ApiResponse, PaginatedResponse, User, Conversation, etc.)

**API Client:**
- Purpose: Low-level HTTP abstraction with authentication and error handling
- Location: `services/api/client.ts`
- Contains: `apiClient` object with methods: `get(endpoint, params)`, `post(endpoint, data)`, `put(endpoint, data)`, `patch(endpoint, data)`, `delete(endpoint, data)`
- Features:
  - **Token Injection**: Async `getAuthHeaders()` calls registered `tokenGetter` function to fetch fresh token
  - **Error Mapping**: Wraps fetch errors in `ApiError` class with status, message, and server response data
  - **401 Handling**: Special case for unauthorized: "Unauthorized - Please sign in again"
  - **Credentials**: Includes `credentials: "include"` for cookie-based auth
- Depends on: Config (API_URL from `config.ts`), token getter function set by AuthContext
- Used by: All service modules

**Context/State Management:**
- Purpose: Global app state (authentication, theming)
- Location: `contexts/*.tsx`
- Contains: Two contexts with providers:
  - **AuthContext**: Auth state (user, isAuthenticated, accessToken, isLoading), sign-in methods (Apple, Google, Email), sign-out, token getter
  - **ThemeContext**: Theme state (themeMode: "light"|"dark", theme object, isDark flag), toggle/set methods
- Depends on: Auth0 SDK, AsyncStorage, Expo APIs
- Used by: Root layout, all screens, hooks
- Session Persistence: AuthContext checks for stored credentials on app mount; ThemeContext persists preference to AsyncStorage

**Utilities & Constants:**
- Purpose: Shared helpers, configuration, and static values
- Location: `utils/*.ts`, `constants/*.ts`, `lib/*.ts`
- Contains:
  - **constants/routes.ts**: Route path constants (AUTH_LOGIN, TABS_CHAT, ONBOARDING_STEP1, etc.)
  - **constants/theme.ts**: Light/dark theme objects, color palettes, typography (fontFamily, fontSize, lineHeight), spacing (xs, sm, md, lg, xl), borderRadius
  - **constants/stickers.ts**: Emoji/sticker assets
  - **utils/time.ts**: Time formatting helpers (relative time, date formatting)
  - **utils/conversation.ts**: Conversation display helpers
  - **lib/i18n.ts**: i18next initialization with language detection
- Depends on: Nothing (leaf layer)
- Used by: All layers

## Data Flow

**Authentication Flow:**

1. **App Launch**: `app/_layout.tsx` renders, wraps app with `AuthProvider` and `ThemeProvider`
2. **Session Check**: `AuthContext` useEffect runs `checkSession()` on mount, calls `Auth0.hasValidCredentials()` and `getCredentials()`
3. **Restore State**: If valid credentials found, sets `accessToken` and fetches user info from Auth0 userinfo endpoint
4. **Register Token Getter**: `AuthContext.useEffect()` calls `setTokenGetter(getToken)` - this callback registered with API client
5. **Conditional Navigation**: Index route (`app/index.tsx`) checks `isAuthenticated` and `profile.onboardingCompleted`, redirects accordingly:
   - Not authenticated → `/(auth)/login`
   - Authenticated but not onboarded → `/onboarding/step1`
   - Onboarded → `/(tabs)/chat`
6. **Token Refresh**: Auth0 SDK automatically refreshes token on expiry; API client always calls `tokenGetter()` for fresh token before each request

**Data Fetching Flow (example: useConversations):**

1. **Hook Mount**: Screen mounts `useConversations({ userPublicId, params, autoFetch: true, enabled: true })`
2. **Effect Triggers**: Hook's useEffect fires due to `[autoFetch, enabled, fetchConversations]` dependencies
3. **API Call**: `fetchConversations()` calls `conversationsApi.getByUser(userPublicId, { page, pageSize })` (or `getAll()` if no user)
4. **Service Method**: `conversationsApi.getByUser()` delegates to `apiClient.get("/conversations", params)`
5. **Token Injection**: API client calls async `getAuthHeaders()`, which calls `tokenGetter()` registered by AuthContext to get fresh token
6. **HTTP Request**: Fetch to `${API_URL}/api/v1/conversations?page=1&pageSize=20` with `Authorization: Bearer <token>`, `Content-Type: application/json`, `credentials: include`
7. **Response Handling**: On success, JSON parsed and set in hook state; on error, caught and stored as `error` field
8. **Component Render**: Component receives `{ conversations, isLoading, error, pagination, refresh, loadMore }` from hook
9. **Pagination**: User scrolls, calls `loadMore()`, fetches next page with `append: true` to merge results
10. **Manual Refresh**: User pulls-to-refresh, calls `refresh()` to fetch page 1 again with `append: false` to replace data

**State Management Patterns:**

- **Global State**: `AuthContext` holds auth state, synced with Auth0 SDK; `ThemeContext` holds theme preference, synced with AsyncStorage
- **Page-Level State**: Hooks manage feature data (conversations, comments, vibes) via `useState`; each hook instance is independent
- **Singleton Cache**: `useCurrentUser` uses module-level `profile`, `isLoading`, `fetchPromise` variables with `useSyncExternalStore()` - first hook instance triggers fetch, subsequent instances subscribe to same store, avoiding duplicate requests
- **Persistence**:
  - Auth: Auth0 SDK stores credentials in native secure storage
  - Theme: AsyncStorage in `ThemeProvider`
  - Everything else: In-memory via React state

**Token Management:**

- Auth0 SDK: Manages credential storage, refresh token flow, expiry detection
- `AuthContext.getToken()`: Async function that calls `getCredentials()` and returns access token; Auth0 SDK refreshes automatically if expired
- API Client Integration: Before every HTTP request, calls `tokenGetter()` to fetch fresh token
- Cleanup: On logout, `signOut()` clears AuthContext state and calls `resetCurrentUserCache()` to clear singleton store

## Key Abstractions

**API Service Modules (Domain Grouping):**
- Purpose: Organize endpoints by resource type for discoverability
- Examples:
  - `usersApi`: `getMe()`, `getById(id)`, `update(id, data)`, `updateMyLanguages(data)`, etc.
  - `conversationsApi`: `getAll(params)`, `getByUser(userId, params)`, `getById(id)`, `getMessages(id, params)`, etc.
  - `vibesApi`: `getAll(params)`, `getForCurrentUser(params)`, `createVibe(data)`, etc.
- Pattern: Exported object containing async methods that call `apiClient.get/post/put/patch/delete` and return typed responses
- Benefit: Centralized place to modify API contracts, type safety, no duplicate URL strings

**Custom Hooks (Data Encapsulation):**
- Purpose: Encapsulate fetch-and-manage patterns for reuse across components
- Examples:
  ```typescript
  const { conversations, isLoading, error, pagination, refresh, loadMore } = useConversations({ userPublicId });
  const { comments, isLoading, error, refresh } = useComments({ postId });
  const { profile, isLoading, error, refresh } = useCurrentUser(enabled);
  ```
- Pattern: Stateful hook with side-effects (useEffect for fetching), returns data object with isLoading/error/refresh/loadMore
- Features: `autoFetch` controls initial fetch, `enabled` conditionally disables hook, `refresh()` bypasses cache, `loadMore()` appends next page
- Deduplication: `useConversations` called by 3 components each triggers fetch; `useCurrentUser` called by 3 components first triggers fetch, others subscribe to singleton store

**Route Groups (Layout Control):**
- Purpose: Group related routes with shared layout behavior without affecting URL structure
- Examples:
  - `(auth)/` - Auth screens share `_layout.tsx` with `gestureEnabled: false` to prevent back gesture
  - `(tabs)/` - Tab screens share `_layout.tsx` rendering custom BottomNavigation component
  - `onboarding/` - Onboarding steps share layout, prevent back navigation
- Pattern: Directory wrapped in parentheses; `_layout.tsx` inside defines layout, child screens nested below
- URL Mapping: `app/(tabs)/chat.tsx` → `/chat`, `app/chat/[id].tsx` → `/chat/123`

**Singleton External Store Pattern (useCurrentUser):**
- Purpose: Prevent duplicate API calls when multiple components use same hook simultaneously
- Implementation:
  ```typescript
  let profile: UserMe | null = null;
  let fetchPromise: Promise<void> | null = null;
  const subscribers = new Set<() => void>();

  // useCurrentUser uses useSyncExternalStore(subscribe, getSnapshot)
  // First call triggers fetchProfile(), stores promise
  // Subsequent calls wait for same promise
  ```
- Benefits: Single fetch regardless of component count; instant state sync across tree
- Usage: `useCurrentUser()` called 10 times → 1 API request

**Type Safety via TypeScript:**
- Purpose: Enforce contracts at compile time
- Examples:
  - `ApiResponse<T>`: `{ success: boolean; data: T; timestamp: string }`
  - `PaginatedResponse<T>`: `{ data: T[]; pagination: { page, pageSize, totalPages, hasNextPage } }`
  - `User`: `{ id, email, name, avatar, onboardingCompleted, ...}`
- Usage: Service methods return `Promise<ApiResponse<User>>` - compiler enforces response shape
- Validation: No runtime schema validation; API response shape validated by JSON parse (fail if invalid)

## Entry Points

**Root Layout (`app/_layout.tsx`):**
- Triggers: App initialization
- Responsibilities:
  1. Import global styles (`global.css` with Tailwind)
  2. Import i18n setup (`lib/i18n`)
  3. Load custom fonts (NunitoSans via expo-google-fonts)
  4. Wrap app with `AuthProvider` and `ThemeProvider`
  5. Render Expo Router Stack with root screens
  6. Configure stack options (headerShown: false, contentStyle with theme background)
- Code: Wraps `RootLayoutContent` (which renders Stack) with two contexts

**Index Route (`app/index.tsx`):**
- Triggers: Navigation to root path after providers loaded
- Responsibilities:
  1. Check `useAuth()` for isAuthenticated, isLoading
  2. Check `useCurrentUser()` for profile and onboardingCompleted
  3. Show loading spinner while checking
  4. Redirect to login (`Routes.AUTH_LOGIN`) if not authenticated
  5. Redirect to onboarding (`Routes.ONBOARDING_STEP1`) if not completed
  6. Redirect to chat tab (`Routes.TABS_CHAT`) if authenticated and onboarded
- Code: Simple redirect logic, no UI rendering

**Auth Flow (`app/(auth)/login.tsx`):**
- Triggers: When `isAuthenticated === false`
- Responsibilities:
  1. Display sign-in buttons (Apple, Google, Email)
  2. Call `useAuth().signInWithApple/Google/Email()` on button press
  3. Show loading during auth flow
  4. Handle errors and present retry UI
- Code: Screen rendering auth buttons, calling Auth0 methods via context

**Main Tab Navigation (`app/(tabs)/_layout.tsx`):**
- Triggers: After successful authentication and onboarding completion
- Responsibilities:
  1. Render `Tabs` (from expo-router) component
  2. Configure bottom tab bar with custom `BottomNavigation` component
  3. Define tab screens: vibes, community, chat, settings
  4. Map navigation presses to route changes
- Code: Tabs component wrapping with tabBar prop containing custom component

**Onboarding Flow (`app/onboarding/step[1-3].tsx`):**
- Triggers: After login if `profile.onboardingCompleted === false`
- Responsibilities:
  - step1.tsx: Collect basics (name, avatar, gender, age)
  - step2.tsx: Collect personality (MBTI, passions/interests)
  - step3.tsx: Collect location (city/country)
  - Finalization: Call `usersApi.updateMe()` with all data, set `onboardingCompleted: true`, redirect to tabs
- Code: Form screens updating user profile via API

## Error Handling

**Strategy:** Layered error handling with specific recovery at each level

**API Client Level (`services/api/client.ts`):**
- Approach: Validate HTTP response, parse error from JSON, map to `ApiError` class
- Code:
  ```typescript
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401) {
      throw new ApiError(401, "Unauthorized - Please sign in again", errorData);
    }
    throw new ApiError(response.status, errorData?.message || response.statusText, errorData);
  }
  ```
- Special case: 401 triggers re-auth flow in consuming code

**Hook Level (`hooks/*.ts`):**
- Approach: Catch errors from API calls, store in state, expose to component
- Code:
  ```typescript
  try {
    const response = await conversationsApi.getAll(params);
    setConversations(response.data);
  } catch (err) {
    setError(err instanceof Error ? err : new Error("Failed to fetch"));
  }
  ```
- Deduplication: Each hook instance catches independently; exceptions don't propagate

**Screen Level (`app/**/*.tsx`):**
- Approach: Check `error` field from hook, render error UI or retry button
- Code:
  ```typescript
  if (error) {
    return <View><Text>{error.message}</Text><Button onPress={refresh} /></View>;
  }
  ```
- User Experience: Error message displayed, manual retry available

**Auth Error Handling (`contexts/AuthContext.tsx`):**
- Apple Sign-In: Catches `ERR_REQUEST_CANCELED` for user cancellation vs actual failure
- Google Sign-In: Checks for `user_cancelled` in error message
- Token Exchange: Fails over to Universal Login if token exchange fails
- Session Check: Errors logged but don't block app initialization

## Cross-Cutting Concerns

**Logging:**
- Approach: Direct `console.error()`, `console.log()` throughout; no centralized logging framework
- Examples: "[AuthContext] Error getting token", "[API Client] Error getting auth token", "Apple Sign-In cancelled"
- Production: No structured logging service; console output lost in production

**Validation:**
- Compile-time: TypeScript type system enforces API contracts (ApiResponse<T>, User shape, etc.)
- Runtime: JSON.parse() will throw if response invalid; no schema validation library (Zod, etc.)
- Assumption: Server provides valid JSON; client doesn't validate server response

**Authentication:**
- Provider: Auth0 via `react-native-auth0` SDK
- Credentials: Stored by Auth0 SDK in native secure storage
- Token Injection: Dynamic via `setTokenGetter()` callback - API client calls before each request
- Refresh: Automatic by Auth0 SDK on token expiry
- Session Check: Automatic on app mount in `AuthContext.useEffect()`

**Theming:**
- Implementation: Two theme objects (light, dark) in `constants/theme.ts` defining colors, typography, spacing
- Distribution: `ThemeContext` provides `theme` object and `isDark` flag to entire tree
- Switching: `ThemeContext.setThemeMode("dark"|"light")` toggles and persists to AsyncStorage
- Usage: Components call `useTheme()` and access `theme.primary`, `theme.background`, etc.
- Styling: NativeWind (Tailwind for RN) for utility classes; theme context for dynamic colors

**Internationalization:**
- Framework: i18next with react-i18next
- Setup: `lib/i18n.ts` initializes i18next, configures language detection, loads locales
- Locales: `locales/en.json` (English), `locales/it.json` (Italian) - standard i18n format
- Usage: Components call `useTranslation()` and use `t('key')` to access translated strings
- Language Switching: i18next can switch on-the-fly; app must re-render to reflect changes

**Pagination:**
- Pattern: Hooks track `currentPage` state, support `loadMore()` for infinite scroll
- API Contract: `PaginatedResponse<T>` returns `{ data: T[]; pagination: { page, pageSize, totalPages, hasNextPage, hasPreviousPage } }`
- Strategy: `fetchConversations(page, append)` - append=true appends to existing data, false replaces
- Usage: UI detects `pagination.hasNextPage` and offers "load more" button or auto-load on scroll

---

*Architecture analysis: 2026-02-17*
