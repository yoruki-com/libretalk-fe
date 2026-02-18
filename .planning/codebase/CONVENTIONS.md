# Coding Conventions

**Analysis Date:** 2026-02-17

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Button.tsx`, `ChatInput.tsx`, `AuthContext.tsx`)
- Services/API modules: camelCase (e.g., `client.ts`, `conversations.ts`, `config.ts`)
- Utilities: camelCase (e.g., `time.ts`, `conversation.ts`)
- Hooks: camelCase starting with `use` (e.g., `useCurrentUser.ts`, `useChatHelpers.ts`, `useConversations.ts`)
- Constants: camelCase or SCREAMING_SNAKE_CASE (e.g., `routes.ts`, `theme.ts`, `Routes` object with SCREAMING_SNAKE_CASE properties)
- Context files: PascalCase (e.g., `AuthContext.tsx`, `ThemeContext.tsx`)
- Route layouts: `_layout.tsx` for directory layouts

**Functions:**
- camelCase for all functions (e.g., `formatChatListTime`, `getLastSeenText`, `buildQueryString`)
- Prefix hooks with `use` (e.g., `useCurrentUser`, `useGetLastSeenText`)
- Event handlers: camelCase prefixed with `on` (e.g., `onPress`, `onChangeText`, `onSend`)
- Internal utilities: camelCase with descriptive verb (e.g., `getAuthHeaders`, `handleResponse`, `subscribe`, `emitChange`)

**Variables:**
- camelCase for all variables and parameters (e.g., `isAuthenticated`, `isLoading`, `maxInputHeight`, `fetchPromise`)
- Boolean variables prefixed with `is` or `has` (e.g., `isLoading`, `isAuthenticated`, `hasValidCredentials`, `isPinned`)
- Constants in services: camelCase (e.g., `API_URL` imported as uppercase, but internally stored as `API_URL`)
- Private module-level state: camelCase (e.g., `profile`, `isLoading`, `error`, `subscribers`)
- State setters: `set` + PascalCaseName (e.g., `setUser`, `setAccessToken`, `setIsLoading`)

**Types:**
- Interfaces: PascalCase (e.g., `ApiResponse`, `ButtonProps`, `AuthContextType`, `UserLanguage`)
- Type aliases: PascalCase (e.g., `ButtonVariant`, `MessageType`, `PersonalityType`, `Gender`)
- DTO types: PascalCase with `Dto` suffix (e.g., `CreateConversationDto`, `UpdateUserDto`, `UpdateUserPassionsDto`)
- Props interfaces: PascalCase with `Props` suffix (e.g., `ButtonProps`, `ChatInputProps`, `ChatHeaderProps`)

## Code Style

**Formatting:**
- Tool: ESLint with expo config (`eslint.config.js`)
- TailwindCSS for styling via className attributes
- Inline styles using `style` prop for dynamic/theme-based values
- Spacing and indentation managed by ESLint and Prettier via expo config

**Linting:**
- Tool: ESLint with `eslint-config-expo`
- Config: `C:/Users/Anton/Develop/Personal/how-are-you/fe/eslint.config.js`
- Ignores: `dist/*` directory

**Line Length:** No strict limit enforced, but code is generally kept readable (typically <100 chars)

## Import Organization

**Order:**
1. React Native and React imports
2. External library imports (Expo, icon libraries, third-party packages)
3. Type imports (using `type` keyword)
4. Local service/context imports
5. Local utility and hook imports
6. Local type imports

**Example from codebase:**
```typescript
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import type { Message } from "@/services/api";
```

**Path Aliases:**
- `@/*` maps to root directory (defined in `tsconfig.json`)
- Used extensively: `@/contexts/`, `@/hooks/`, `@/services/`, `@/constants/`, `@/utils/`, `@/components/`, etc.

## Error Handling

**Patterns:**
- Try-catch blocks used throughout async functions (e.g., in `useConversations.ts`, `useComments.ts`)
- Error type assertions: `err instanceof Error` to safely handle unknown error types
- Custom error class: `ApiError` in `C:/Users/Anton/Develop/Personal/how-are-you/fe/services/api/client.ts` with status, message, and data properties
- Errors logged to console with context prefix (e.g., `[API Client]`, `[AuthContext]`)
- In hooks: Errors stored in state and returned to caller for UI handling
- In API client: 401 status triggers specialized error message "Unauthorized - Please sign in again"
- Fallback handling: When primary approach fails (e.g., token exchange), fallback to Universal Login

**Example from client.ts:**
```typescript
try {
  const token = await tokenGetter();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
} catch (error) {
  console.error("[API Client] Error getting auth token:", error);
}
```

## Logging

**Framework:** `console` object (no dedicated logging library)

**Patterns:**
- Used for error tracking and debugging
- Prefixed with context/scope in brackets (e.g., `[API Client]`, `[AuthContext]`)
- Four log levels observed: `console.log()` (info), `console.error()` (errors)
- Typically includes error object and contextual message
- Example: `console.error("[API Client] Error getting auth token:", error);`

**Best Practice:** Use context prefix to identify source when debugging

## Comments

**When to Comment:**
- Function descriptions for utilities: JSDoc-style comments with `/**` blocks
- Complex logic that isn't immediately obvious
- Intent of unusual error handling (e.g., "Fallback to Universal Login if token exchange fails")
- Input descriptions and parameters when not obvious
- NOT used for obvious code (e.g., variable assignments, simple conditionals)

**JSDoc/TSDoc:**
- Used for public utility functions with formal documentation
- Example from `time.ts`:
  ```typescript
  /**
   * Format a timestamp for chat list display.
   * Returns HH:MM for today, "Yesterday", weekday name for <7 days, or short date.
   */
  export function formatChatListTime(
    dateString: string | null,
    labels: { yesterday: string },
  ): string
  ```
- Includes parameter descriptions and return type descriptions
- Not consistently used on all functions, only on utilities and public APIs

## Function Design

**Size:** Generally small to medium (10-50 lines typical)
- Utility functions: Pure, focused on single responsibility
- Hooks: Medium-sized, contain state management and side effects
- Component functions: 20-100+ lines depending on JSX complexity

**Parameters:**
- Destructured params in function signatures when multiple props
- Props interfaces used for component parameters
- Type safety: All parameters typed in TypeScript
- Optional parameters marked with `?` in interfaces

**Return Values:**
- Functions return typed values (generic `<T>` used in API calls)
- Hooks return objects with related state/methods (e.g., `UseCurrentUserResult` interface)
- Async functions return Promises with typed responses
- API methods wrapped in try-catch return type-safe results or throw ApiError

## Module Design

**Exports:**
- Named exports preferred for functions and types
- Default exports used for some components and context providers
- Services typically use named object exports (e.g., `export const apiClient = { ... }`, `export const conversationsApi = { ... }`)
- Types exported with `export interface` and `export type` keywords

**Barrel Files:**
- `C:/Users/Anton/Develop/Personal/how-are-you/fe/services/api/index.ts` aggregates API exports
- Used to simplify imports from services layer

**Example from conversations.ts:**
```typescript
export const conversationsApi = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Conversation>> {
    return apiClient.get("/conversations", params);
  },
  // ... more methods
  messages: {
    async getAll(...) { ... },
    // ... nested methods
  },
};
```

## Styling Patterns

**TailwindCSS:**
- Utility classes applied via `className` prop (e.g., `className="flex-row items-center justify-center gap-3"`)
- Dynamic theming via inline styles with theme object from context
- Custom colors defined in `tailwind.config.js`: primary, dark, light, gray variants, border
- Custom font families: `sans`, `sans-medium`, `sans-semibold`, `sans-bold`
- Custom sizes: `heading-4`, `link-normal`, `body-small`
- Border radius tokens: `card` (32px), `button` (999px)

**Inline Styles:**
- Used for theme-dependent values: colors, backgrounds, borders
- Example: `style={{ backgroundColor: theme.primary }}`
- Dimensions calculated dynamically (e.g., `maxHeight: maxInputHeight`)

## Type Safety

**TypeScript Configuration:**
- Strict mode enabled in `tsconfig.json`
- JSX set to `react-jsx`
- All source files included in compilation

**Usage:**
- All function parameters typed
- All return types explicitly specified
- Generic types used for API responses (e.g., `get<T>(...)`)
- Type guards used for unsafe operations (e.g., `err instanceof Error`)
- Optional fields marked with `?` in interfaces
- Union types for discriminated unions (e.g., `MessageType`, `Gender`)

---

*Convention analysis: 2026-02-17*
