---
phase: quick-8
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - contexts/AuthContext.tsx
  - app.json
  - plugins/withAuth0SchemeFixPlugin.js
  - .env.example
autonomous: true
requirements: []
user_setup:
  - service: logto
    why: "Logto OIDC auth provider replacing Auth0"
    env_vars:
      - name: EXPO_PUBLIC_LOGTO_ENDPOINT
        source: "Logto Console -> Applications -> your app -> Endpoint"
      - name: EXPO_PUBLIC_LOGTO_APP_ID
        source: "Logto Console -> Applications -> your app -> App ID"
    dashboard_config:
      - task: "Create a Native app in Logto Console"
        location: "Logto Console -> Applications -> Create application -> Native"
      - task: "Add redirect URI"
        location: "Application settings -> Redirect URIs -> add: libretalk://callback"
      - task: "Add post-logout redirect URI"
        location: "Application settings -> Post sign-out redirect URIs -> add: libretalk://callback"

must_haves:
  truths:
    - "App compiles without react-native-auth0 references"
    - "User can sign in via Logto universal login (browser redirect)"
    - "User can sign out and session is cleared"
    - "Access token is available to the API client after sign-in"
    - "User profile (id, email, name, avatar) is populated after sign-in"
  artifacts:
    - path: "contexts/AuthContext.tsx"
      provides: "Logto-backed auth context replacing Auth0"
      contains: "LogtoProvider"
    - path: "app.json"
      provides: "Expo config without react-native-auth0 plugin"
    - path: ".env.example"
      provides: "Logto env var documentation"
  key_links:
    - from: "contexts/AuthContext.tsx"
      to: "@logto/rn useLogto"
      via: "LogtoProvider wrapping AuthContextProvider"
      pattern: "useLogto"
    - from: "AuthContext getToken"
      to: "services/api/client setTokenGetter"
      via: "setTokenGetter(getToken) in useEffect"
      pattern: "setTokenGetter"
---

<objective>
Replace react-native-auth0 with @logto/rn throughout the frontend. The backend already validates Logto JWTs. This plan swaps the provider, rewrites AuthContext.tsx, updates app.json, cleans the dead Auth0 plugin, and updates env docs.

Purpose: The auth layer must use Logto so tokens are accepted by the backend.
Output: AuthContext.tsx powered by @logto/rn, Auth0 dependency removed, app builds cleanly.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/8-switch-frontend-auth-from-auth0-to-logto/8-PLAN.md
@contexts/AuthContext.tsx
@package.json
@app.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install @logto/rn and remove react-native-auth0</name>
  <files>package.json</files>
  <action>
    Run the following commands in order:

    1. Remove the old Auth0 SDK:
       `bun remove react-native-auth0`

    2. Add the Logto React Native SDK:
       `bun add @logto/rn`

    @logto/rn requires expo-web-browser and @react-native-async-storage/async-storage as peer deps — both are already present in package.json, so no extra installs needed.

    After installing, verify the package.json dependencies section contains `@logto/rn` and does NOT contain `react-native-auth0`.
  </action>
  <verify>
    `bun install` completes without errors.
    `grep "react-native-auth0" package.json` returns no output.
    `grep "@logto/rn" package.json` returns a line with the version.
  </verify>
  <done>package.json lists @logto/rn and has no react-native-auth0 entry.</done>
</task>

<task type="auto">
  <name>Task 2: Rewrite AuthContext.tsx to use @logto/rn</name>
  <files>contexts/AuthContext.tsx</files>
  <action>
    Replace the entire contents of contexts/AuthContext.tsx. The public API of the context (AuthContextType interface and useAuth hook) must remain identical so no call sites need updating.

    Key implementation details:

    - Read env vars:
      ```ts
      const LOGTO_ENDPOINT = process.env.EXPO_PUBLIC_LOGTO_ENDPOINT!;
      const LOGTO_APP_ID = process.env.EXPO_PUBLIC_LOGTO_APP_ID!;
      const REDIRECT_URI = "libretalk://callback";
      ```

    - `AuthProvider` wraps with `LogtoProvider` (config: `{ endpoint: LOGTO_ENDPOINT, appId: LOGTO_APP_ID }`), then `AuthContextProvider` inside.

    - `AuthContextProvider` calls `useLogto()` to get: `signIn`, `signOut`, `getAccessToken`, `isAuthenticated`, `isLoading`, `fetchUserInfo`.

    - Session init in `useEffect` on mount (depends on `isLoading`):
      - When `!isLoading && isAuthenticated`, call `getAccessToken()` and `fetchUserInfo()`.
      - Map fetchUserInfo result to `User`: `{ id: userInfo.sub, email: userInfo.email, name: userInfo.name, avatar: userInfo.picture }`.
      - Set `accessToken` state and `user` state.

    - `signInWithEmail` calls `await signIn(REDIRECT_URI)` — Logto opens universal login in browser. After redirect back, `isAuthenticated` becomes true and the mount effect will refresh tokens/user info. Handle user cancellation gracefully (catch and return without throwing).

    - `signInWithGoogle` — Logto does not expose a direct connection param in @logto/rn. Implement identically to `signInWithEmail` (both call `signIn(REDIRECT_URI)`). The Logto console controls which social connectors appear on the login screen. Add a comment: `// Google connector configured server-side in Logto Console`.

    - `signOut` calls `await signOut(REDIRECT_URI)`. In the catch block, still reset local state and call `resetCurrentUserCache()` to be resilient.

    - `getToken` calls `await getAccessToken()`, updates `accessToken` state, returns the token string or null on error.

    - Register token getter: `useEffect(() => { setTokenGetter(getToken); return () => clearTokenGetter(); }, [getToken])` — same as before.

    - Preserve all existing imports: `axios` import can be removed since fetchUserInfo replaces the manual userinfo call.

    Do NOT import or reference anything from react-native-auth0.
  </action>
  <verify>
    `bunx tsc --noEmit` passes with no errors referencing AuthContext.tsx.
    `grep "react-native-auth0" contexts/AuthContext.tsx` returns nothing.
    `grep "LogtoProvider" contexts/AuthContext.tsx` returns a match.
    `grep "useLogto" contexts/AuthContext.tsx` returns a match.
  </verify>
  <done>
    AuthContext.tsx compiles cleanly, exports AuthProvider (using LogtoProvider), useAuth hook, and the User interface. No Auth0 references remain.
  </done>
</task>

<task type="auto">
  <name>Task 3: Update app.json and .env.example, remove Auth0 Expo plugin</name>
  <files>app.json, plugins/withAuth0SchemeFixPlugin.js, .env.example</files>
  <action>
    **app.json:**
    Remove the two Auth0-specific plugin entries from the `plugins` array:
    - `["react-native-auth0", { "domain": "...", "customScheme": "libretalk" }]`
    - `"./plugins/withAuth0SchemeFixPlugin"`

    The `"scheme": "libretalk"` top-level field must remain — Logto needs it for the redirect URI `libretalk://callback`.

    No new plugins need to be added for @logto/rn; it uses expo-web-browser which is already in dependencies.

    **plugins/withAuth0SchemeFixPlugin.js:**
    Delete the file entirely (it was only needed because Auth0's Expo plugin conflicted with the scheme). Use the Bash tool to run: `rm plugins/withAuth0SchemeFixPlugin.js`

    **.env.example:**
    Replace the Auth0 section with Logto:
    ```
    # Logto Configuration
    EXPO_PUBLIC_LOGTO_ENDPOINT=https://your-logto-instance.logto.app
    EXPO_PUBLIC_LOGTO_APP_ID=your-app-id
    ```
    Remove:
    ```
    # Auth0 Configuration
    EXPO_PUBLIC_AUTH0_DOMAIN=...
    EXPO_PUBLIC_AUTH0_CLIENT_ID=...
    EXPO_PUBLIC_AUTH0_AUDIENCE=...
    ```
    Keep all other existing env vars (API_BASE_URL, MAPBOX_PUBLIC_TOKEN) unchanged.
  </action>
  <verify>
    `grep "react-native-auth0" app.json` returns nothing.
    `grep "withAuth0SchemeFixPlugin" app.json` returns nothing.
    `grep "EXPO_PUBLIC_LOGTO_ENDPOINT" .env.example` returns a match.
    `ls plugins/withAuth0SchemeFixPlugin.js` returns "No such file".
    `grep "\"scheme\": \"libretalk\"" app.json` returns a match (scheme preserved).
  </verify>
  <done>
    app.json has no Auth0 plugin references. .env.example documents Logto vars. The Auth0 scheme fix plugin file is deleted. The libretalk scheme is preserved for OAuth redirects.
  </done>
</task>

</tasks>

<verification>
After all tasks:

1. `bunx tsc --noEmit` — zero TypeScript errors across the project.
2. `grep -r "react-native-auth0" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json"` — no matches (except possibly bun.lockb binary, which is acceptable).
3. `grep -r "AUTH0" . --include="*.ts" --include="*.tsx"` — no matches.
4. The app can be started with `bun run start` without module resolution errors.
</verification>

<success_criteria>
- @logto/rn is the only auth SDK in package.json
- AuthContext.tsx uses LogtoProvider and useLogto exclusively
- signInWithEmail, signInWithGoogle, signOut, getToken all function via Logto APIs
- app.json has no Auth0 plugin config
- .env.example documents EXPO_PUBLIC_LOGTO_ENDPOINT and EXPO_PUBLIC_LOGTO_APP_ID
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/8-switch-frontend-auth-from-auth0-to-logto/8-SUMMARY.md`
</output>
