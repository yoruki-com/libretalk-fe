# Architecture

**Analysis Date:** 2026-02-17

## Pattern Overview

**Overall:** Expo-based React Native mobile app with file-system routing (Expo Router) and layered architecture separating presentation, business logic, and API communication.

**Key Characteristics:**
- **Expo Router Navigation**: File-based routing system mirroring Next.js patterns
- **Context-Based State Management**: Uses React Context for auth and theme state with external store pattern for user profile
- **Layered Architecture**: Clear separation between routes (presentation), components (UI), hooks (business logic), and services (API communication)
- **Type-Safe API Client**: Centralized HTTP client with TypeScript types and authentication token injection
- **Multi-Platform Support**: Targets iOS, Android, and Web through Expo
- **Authentication Flow**: Auth0 integration with Apple Sign-In fallback, automatic token management

## Layers

**Presentation Layer (Routes & Screens):**
- Purpose: Handle screen rendering, user interactions, and navigation
- Location: `app/`
- Contains: Screen components using Expo Router file-based routing
- Depends on: Hooks, contexts, and component library
- Used by: React Native navigator and Expo Router

**Component Layer (UI Components):**
- Purpose: Reusable UI elements with consistent styling and behavior
- Location: `components/ui/`
- Contains: Button, ChatCard, MessageBubble, ProfileCard, pickers, forms, and specialized components for onboarding/profile editing
- Depends on: Theme context, utility functions, React Native primitives
- Used by: Route screens and other components

**Business Logic Layer (Hooks):**
- Purpose: Encapsulate data fetching, state management, and side effects
- Location: `hooks/`
- Contains: `useCurrentUser`, `useConversations`, `useComments`, `useVibes`, `useCommunity`, custom hooks for specific features
- Depends on: API services, contexts, React hooks
- Used by: Route screens and components

**API Service Layer:**
- Purpose: Centralized HTTP client and API endpoint definitions
- Location: `services/api/`
- Contains: Client configuration, endpoint modules (conversations, users, vibes, etc.), type definitions
- Depends on: Fetch API, environment variables
- Used by: Hooks and directly by screens for specific operations

**Context Layer (State Management):**
- Purpose: App-wide state and configuration
- Location: `contexts/`
- Contains: AuthContext (authentication state, token, user info), ThemeContext (light/dark mode)
- Depends on: AsyncStorage for persistence, Auth0 SDK
- Used by: All screens and components

**Utilities & Constants:**
- Purpose: Helper functions, type definitions, and application constants
- Location: `utils/`, `constants/`, `lib/`
- Contains: Time formatting, conversation helpers, route definitions, theme configuration, i18n setup
- Used by: All layers

## Data Flow

**Authentication Flow:**

1. App launches → Index route checks auth state via `useAuth` hook
2. AuthContext initializes Auth0 provider and checks for existing session
3. If no valid credentials → Redirect to login screen `/(auth)/login`
4. User authenticates via Apple, Google, or Email
5. Auth0 returns access token stored in context
6. Token getter function registered with API client via `setTokenGetter`
7. On successful auth → Check onboarding completion via `useCurrentUser` hook
8. If not completed → Redirect to onboarding flow `onboarding/step[1-3]`
9. If completed → Redirect to main tab navigation `/(tabs)/chat`

**Data Fetching Flow:**

1. Screen/component mounts and initializes hook (e.g., `useConversations`)
2. Hook calls API service method (e.g., `conversationsApi.getByUser`)
3. API client (`apiClient`) fetches token via `tokenGetter` function
4. Request includes Authorization header: `Bearer {token}`
5. Response parsed and cached in hook state
6. Component receives data and renders
7. Manual refresh or pagination triggers `refresh()`/`loadMore()` methods
8. Updates are merged (append for pagination, replace for refresh)

**State Management:**

- **Global State**: Auth state (AuthContext), Theme (ThemeContext)
- **Shared State**: User profile with external store pattern in `useCurrentUser` - deduplicates concurrent fetches
- **Component State**: Local state managed within hooks (conversations, comments, vibes)
- **Persistence**: Auth credentials via Auth0 SDK, theme preference via AsyncStorage

## Key Abstractions

**API Client:**
- Purpose: Unified HTTP interface with automatic authentication and error handling
- Examples: `services/api/client.ts`
- Pattern: Singleton instance with methods for GET, POST, PUT, PATCH, DELETE - all async
- Features: Token injection, error mapping to ApiError class, automatic retry capability via response handling

**Service Modules:**
- Purpose: Group API endpoints by domain
- Examples: `services/api/conversations.ts`, `services/api/users.ts`, `services/api/vibes.ts`
- Pattern: Exported object containing async methods that delegate to apiClient
- Benefits: Clear endpoint organization, reusable types, single responsibility per module

**Custom Hooks:**
- Purpose: Encapsulate data fetching logic with loading/error states
- Examples: `useConversations`, `useCurrentUser`, `useComments`
- Pattern: Accept configuration options, return data + state + refresh methods
- Features: Automatic fetch on mount (controlled by `enabled` flag), error handling, pagination support

**UI Component Pattern:**
- Purpose: Standardized, theme-aware reusable components
- Examples: `Button.tsx`, `ChatCard.tsx`, `MessageBubble.tsx`
- Pattern: Accept props for content/actions, consume theme from ThemeContext
- Features: NativeWind styling integration, accessibility considerations, consistent naming

**Route Groups:**
- Purpose: Organize routes with shared layout behaviors
- Examples: `(auth)/`, `(tabs)/`, `onboarding/`
- Pattern: Parentheses indicate layout group - no URL segment added, grouped routes share `_layout.tsx`
- Benefits: Ability to prevent gestures, apply consistent styling, manage navigation flow

## Entry Points

**Root Layout:**
- Location: `app/_layout.tsx`
- Triggers: App initialization
- Responsibilities: Initialize providers (AuthProvider, ThemeProvider), setup fonts, configure global navigation stack

**Index Route:**
- Location: `app/index.tsx`
- Triggers: Navigation to root path after provider setup
- Responsibilities: Check auth + onboarding state, redirect to appropriate flow (login, onboarding, or tabs)

**Auth Flow:**
- Location: `app/(auth)/login.tsx`
- Triggers: Unauthenticated user
- Responsibilities: Present sign-in options (Apple, Google, Email) via Auth0

**Main Tab Navigation:**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: Authenticated user who completed onboarding
- Responsibilities: Configure bottom tab navigation with custom BottomNavigation component, route between tabs (vibes, community, chat, settings)

**Onboarding Flow:**
- Location: `app/onboarding/_layout.tsx`, `step1.tsx`, `step2.tsx`, `step3.tsx`
- Triggers: Authenticated user without onboarding completion
- Responsibilities: Collect user profile info (MBTI, passions, location, gender), update profile on backend, mark onboarding complete

## Error Handling

**Strategy:** Layered error handling with specific recovery paths

**Patterns:**

1. **API Level (`services/api/client.ts`):**
   - Catch response errors, parse error message from server
   - Map to `ApiError` class with status code and data
   - 401 errors get specific message: "Unauthorized - Please sign in again"
   - Other errors use server message or statusText

2. **Hook Level (`hooks/*.ts`):**
   - Try/catch around API calls
   - Convert caught exceptions to Error objects
   - Store error in local state (`error` property)
   - Expose error to component for conditional rendering

3. **Screen/Component Level:**
   - Check `error` property from hook
   - Render error UI with message (see `(tabs)/chat.tsx` pattern)
   - Provide retry mechanism via `refresh()` method

4. **Auth Errors:**
   - AuthContext catches session errors, remains authenticated until explicit logout
   - API client 401 errors trigger auth recovery flow in consuming components
   - Failed user info fetch doesn't block auth state

## Cross-Cutting Concerns

**Logging:** Console logging for debugging errors and flow tracking (e.g., "Error getting auth token", "Error fetching user info"). No production logging framework.

**Validation:** Type safety via TypeScript and Zod-like type definitions in `services/api/types.ts`. API responses validated by response parsing (JSON will throw if invalid).

**Authentication:** Centralized in AuthContext with Auth0 provider. Token getter pattern allows API client to dynamically fetch fresh tokens. Token-based auth with Bearer scheme.

**Theme:** ThemeContext provides light/dark mode toggle, persisted to AsyncStorage. All components consume theme object for colors, typography, spacing.

**Internationalization:** i18n setup in `lib/i18n.ts` with react-i18next. Components import `useTranslation` hook to access translated strings.

**Pagination:** Implemented in data-fetching hooks with PaginationParams type. Supports page-based pagination with hasNextPage/hasPreviousPage indicators. Append vs. replace logic handled in hook.

---

*Architecture analysis: 2026-02-17*
