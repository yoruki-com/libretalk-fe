# Testing Patterns

**Analysis Date:** 2026-02-17

## Test Framework

**Status:** No testing framework currently configured

**Runner:** Not detected
- `package.json` contains no test-related scripts (`test`, `test:watch`, `test:coverage`)
- No Jest, Vitest, or other test runner configuration files found
- No `.test.ts`, `.spec.ts`, or `.test.tsx`, `.spec.tsx` files in source directories (`app/`, `components/`, `hooks/`, `services/`, `utils/`)

**Assertion Library:** Not applicable - no tests present

**Run Commands:** Not configured
- `bun run test` would be the expected command based on `bun` package manager usage
- No test coverage tools configured

## Test File Organization

**Current Status:** Test files not yet implemented

**Recommended Pattern (based on codebase structure):**
- Co-located tests: Place `.test.ts` or `.spec.ts` files alongside source files
- Example locations:
  - `hooks/useCurrentUser.test.ts` → tests for `hooks/useCurrentUser.ts`
  - `services/api/client.test.ts` → tests for `services/api/client.ts`
  - `components/ui/Button.test.tsx` → tests for `components/ui/Button.tsx`
  - `utils/time.test.ts` → tests for `utils/time.ts`

**Naming:**
- Recommended: `[filename].test.ts` or `[filename].spec.ts`
- Tests for `formatChatListTime` would be in `time.test.ts`

**Structure:**
```
hooks/
├── useCurrentUser.ts
├── useCurrentUser.test.ts
├── useConversations.ts
└── useConversations.test.ts

services/api/
├── client.ts
├── client.test.ts
├── conversations.ts
└── conversations.test.ts
```

## Test Structure

**No established patterns yet** - recommended approach based on codebase style:

**Suite Organization:**
```typescript
// Example pattern for services/api/client.test.ts
describe('ApiClient', () => {
  describe('get', () => {
    it('should fetch data successfully', async () => {
      // test implementation
    });

    it('should handle 401 errors as unauthorized', async () => {
      // test implementation
    });
  });

  describe('post', () => {
    it('should POST data and return response', async () => {
      // test implementation
    });
  });
});
```

**Patterns to implement:**
- Use `describe` blocks for grouping related tests
- Use `it` or `test` for individual test cases
- Arrange-Act-Assert pattern for test structure
- Clear test names describing what should happen

## Mocking

**Framework:** Not configured

**Recommended approach for this codebase:**

**Mocking API calls:**
```typescript
// Mock fetch for API client testing
global.fetch = jest.fn();

describe('apiClient.get', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should include auth headers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    await apiClient.get('/endpoint');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoint'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': expect.stringMatching(/^Bearer /),
        }),
      })
    );
  });
});
```

**Mocking React hooks:**
```typescript
// Mock useAuth hook for component tests
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ChatComponent', () => {
  it('should show loading when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });

    const { getByTestId } = render(<ChatComponent />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });
});
```

**Mocking async operations:**
```typescript
// For hooks like useCurrentUser that use external store pattern
jest.mock('@/services/api/users', () => ({
  usersApi: {
    getMe: jest.fn(),
  },
}));

describe('useCurrentUser', () => {
  it('should fetch profile on enable', async () => {
    const mockProfile = { publicId: '123', displayName: 'Test User' };
    (usersApi.getMe as jest.Mock).mockResolvedValue({
      data: mockProfile,
    });

    const { result, waitForNextUpdate } = renderHook(() => useCurrentUser(true));

    await waitForNextUpdate();

    expect(result.current.profile).toEqual(mockProfile);
  });
});
```

**What to Mock:**
- API calls (`fetch`, axios, etc.)
- Context/hooks (`useAuth`, `useTheme`, etc.)
- External services (Auth0 client)
- Time-dependent code (for consistent results)

**What NOT to Mock:**
- Pure utility functions (e.g., `formatChatListTime`, `getLastSeenText`)
- Internal React hooks (`useState`, `useEffect`, `useCallback`)
- Custom hooks that manage state (unless testing specific scenarios)
- Type definitions and constants

## Fixtures and Factories

**Not implemented** - recommended approach:

**Test Data Fixtures:**
```typescript
// services/api/__fixtures__/users.ts
export const mockUser = {
  publicId: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  bio: null,
  avatarUrl: null,
  isOnline: false,
  lastSeenAt: null,
  isProfilePublic: true,
  isActive: true,
  onboardingCompleted: true,
  followers: 10,
  following: 5,
};

export const mockConversation = {
  publicId: 'conv-123',
  name: 'Test Conversation',
  isGroup: false,
  participants: [mockUser],
  lastMessage: null,
  lastMessageAt: null,
};
```

**Factory Functions:**
```typescript
// services/api/__factories__/users.ts
export function createMockUser(overrides?: Partial<User>): User {
  return {
    ...mockUser,
    ...overrides,
  };
}

export function createMockUserMe(overrides?: Partial<UserMe>): UserMe {
  return {
    ...createMockUser(),
    languages: [],
    passions: [],
    ...overrides,
  };
}
```

**Location:**
- `__fixtures__/` directory alongside tests
- `__factories__/` directory for factory functions
- Or inline in test files for simple/one-off data

## Coverage

**Requirements:** None enforced

**Recommended targets based on codebase:**
- Services (api/): 80%+ coverage
- Utilities (time.ts, conversation.ts): 90%+ coverage
- Hooks: 70%+ coverage (complex state management)
- Components: 60%+ coverage (mostly rendering tests)

**View Coverage:**
```bash
# When testing framework is added
bun run test:coverage

# Or specific coverage reports
bun run test -- --coverage

# View in browser
bun run test -- --coverage --coverageReporters=html
open coverage/index.html
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, hooks, utilities
- Approach: Test inputs and outputs in isolation
- Examples needed:
  - `time.ts` functions: Test formatting logic with various date inputs
  - `client.ts` ApiClient: Test HTTP methods with mocked fetch
  - `useCurrentUser` hook: Test fetch logic, state updates, error handling

**Integration Tests:**
- Scope: Multiple components/modules working together
- Approach: Test real interactions between services
- Examples to implement:
  - AuthContext + useCurrentUser: Test profile loading after auth
  - API client + conversations hook: Test real conversation fetching
  - Multiple hooks in component: Test data flow between layers

**E2E Tests:**
- Framework: Not configured (could use Detox for React Native)
- Not yet implemented
- Would test: Full user flows like onboarding, messaging, profile updates

## Common Patterns

**Async Testing:**
```typescript
// Jest/Vitest pattern for async hooks
describe('useCurrentUser', () => {
  it('should handle async profile fetch', async () => {
    (usersApi.getMe as jest.Mock).mockResolvedValue({
      data: { publicId: '123' },
    });

    const { result } = renderHook(() => useCurrentUser(true));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check result
    expect(result.current.profile?.publicId).toBe('123');
  });
});
```

**Error Testing:**
```typescript
// Testing error states in hooks
describe('useConversations', () => {
  it('should capture error when fetch fails', async () => {
    const testError = new Error('Network failed');
    (conversationsApi.getAll as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.error).toBe(testError);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle API errors with custom messages', async () => {
    const apiError = new ApiError(
      401,
      'Unauthorized - Please sign in again',
      { code: 'TOKEN_EXPIRED' }
    );
    (conversationsApi.getAll as jest.Mock).mockRejectedValue(apiError);

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.error?.status).toBe(401);
      expect(result.current.error?.message).toContain('Please sign in');
    });
  });
});
```

**Component Snapshot Testing:**
```typescript
// Testing component rendering
describe('ChatInput', () => {
  it('should render with placeholder', () => {
    const { getByPlaceholderText } = render(
      <ChatInput placeholder="Custom placeholder" />
    );

    expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('should call onSend when send button pressed', async () => {
    const mockOnSend = jest.fn();
    const { getByTestId } = render(
      <ChatInput value="test message" onSend={mockOnSend} />
    );

    fireEvent.press(getByTestId('send-button'));

    expect(mockOnSend).toHaveBeenCalled();
  });
});
```

**Testing with Theme Context:**
```typescript
// Tests that use theme context
describe('ChatInput with Theme', () => {
  it('should use theme colors', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ChatInput />
      </ThemeProvider>
    );

    const input = getByTestId('chat-input');
    expect(input).toHaveStyle({ color: '#FFFFFF' }); // Or theme.text
  });
});
```

## Setup Recommendations

**To enable testing:**

1. **Install test framework:**
   ```bash
   bun add -d vitest @testing-library/react-native @testing-library/jest-dom
   ```

2. **Add scripts to package.json:**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:watch": "vitest --watch",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

3. **Create vitest.config.ts:**
   ```typescript
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: ['./test/setup.ts'],
     },
   });
   ```

4. **Create test/setup.ts for common mocks:**
   ```typescript
   import '@testing-library/jest-dom';

   // Mock fetch globally
   global.fetch = jest.fn();
   ```

---

*Testing analysis: 2026-02-17*
