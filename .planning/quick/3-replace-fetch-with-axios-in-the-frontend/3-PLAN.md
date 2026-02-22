---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - fe/package.json
  - fe/services/api/client.ts
  - fe/services/api/promotions.ts
  - fe/services/api/uploads.ts
  - fe/contexts/AuthContext.tsx
  - fe/app/profile/edit.tsx
  - fe/components/ui/CityPicker.tsx
autonomous: true
must_haves:
  truths:
    - "All HTTP requests use axios instead of fetch"
    - "apiClient methods (get/post/put/patch/delete) work identically via axios"
    - "Auth0 token exchange and userinfo calls work via axios"
    - "Mapbox geocoding calls work via axios"
    - "S3 presigned URL uploads work via axios"
    - "HTML content endpoint (promotions) returns text correctly via axios"
    - "Error handling (ApiError with status codes) works identically"
  artifacts:
    - path: "fe/package.json"
      provides: "axios dependency"
      contains: "axios"
    - path: "fe/services/api/client.ts"
      provides: "axios-based apiClient with all HTTP methods"
      exports: ["apiClient", "ApiError", "setTokenGetter", "clearTokenGetter"]
    - path: "fe/services/api/promotions.ts"
      provides: "axios-based promotions API (JSON + text/HTML)"
      exports: ["promotionsApi"]
    - path: "fe/services/api/uploads.ts"
      provides: "axios-based S3 upload"
      exports: ["uploadsApi"]
  key_links:
    - from: "fe/services/api/client.ts"
      to: "axios"
      via: "import axios"
      pattern: "import axios"
    - from: "fe/contexts/AuthContext.tsx"
      to: "axios"
      via: "import axios"
      pattern: "import axios"
---

<objective>
Replace all `fetch()` calls in the frontend codebase with `axios`, creating a consistent HTTP client layer.

Purpose: Standardize HTTP requests on axios for better error handling, interceptors, request/response transforms, and simpler API (no manual response.json() calls).
Output: All 6 files with fetch calls updated to use axios. Zero remaining fetch() usage.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
Frontend workspace: c:\Users\Anton\Develop\Personal\how-are-you\fe

Files containing fetch() calls (6 total):

- fe/services/api/client.ts — Core apiClient with GET/POST/PUT/PATCH/DELETE (5 fetch calls)
- fe/services/api/promotions.ts — Raw fetch for JSON + text/HTML endpoints (2 fetch calls)
- fe/services/api/uploads.ts — Raw fetch for reading file blob + S3 PUT upload (2 fetch calls)
- fe/contexts/AuthContext.tsx — Auth0 /userinfo (2 calls) + /oauth/token (1 call)
- fe/app/profile/edit.tsx — Mapbox reverse geocoding (1 fetch call)
- fe/components/ui/CityPicker.tsx — Mapbox forward geocoding (1 fetch call)
  </context>

<tasks>

<task type="auto">
  <name>Task 1: Install axios and rewrite apiClient core</name>
  <files>
    fe/package.json
    fe/services/api/client.ts
  </files>
  <action>
    1. Install axios in the frontend workspace:
       ```
       cd c:\Users\Anton\Develop\Personal\how-are-you\fe && bun add axios
       ```

    2. Rewrite `fe/services/api/client.ts` to use axios instead of fetch:

       - `import axios, { AxiosError } from "axios"` at the top
       - Remove the `handleResponse` function entirely (axios throws on non-2xx by default and auto-parses JSON)
       - Remove the `buildQueryString` helper (axios handles query params natively via `params` option)
       - Keep `ApiError` class, `tokenGetter`, `setTokenGetter`, `clearTokenGetter`, and `getAuthHeaders` exactly as-is

       - Rewrite each apiClient method:
         - `get<T>(endpoint, params?)`: Use `axios.get<T>(url, { headers, params })`. Return `response.data`.
           NOTE: The current `params` type is `PaginationParams & Record<string, unknown>`. Pass this directly as axios `params` option — axios will serialize it to query string automatically. Remove the `buildQueryString` call.
         - `post<T>(endpoint, data?)`: Use `axios.post<T>(url, data, { headers })`. Return `response.data`. No manual `JSON.stringify` needed — axios does it.
         - `put<T>(endpoint, data)`: Use `axios.put<T>(url, data, { headers })`. Return `response.data`.
         - `patch<T>(endpoint, data)`: Use `axios.patch<T>(url, data, { headers })`. Return `response.data`.
         - `delete<T>(endpoint, data?)`: Use `axios.delete<T>(url, { headers, data })`. Return `response.data`. Note: axios delete passes body via config `data` field.

       - Remove `credentials: "include"` from all calls (not applicable to axios; axios uses `withCredentials: true` if needed, but this is a React Native app hitting an API with Bearer tokens, so credentials/cookies are not used).

       - Add error handling: Wrap each method in try/catch. In the catch block, check if it's an `AxiosError` with a response:
         ```typescript
         catch (error) {
           if (axios.isAxiosError(error) && error.response) {
             const { status, data } = error.response;
             if (status === 401) {
               throw new ApiError(401, data?.message || "Unauthorized - Please sign in again", data);
             }
             throw new ApiError(status, data?.message || error.message, data);
           }
           throw error;
         }
         ```
         This preserves the exact same ApiError behavior as the current handleResponse function.

       - Do NOT remove the `Content-Type: application/json` header from `getAuthHeaders` — axios sets it automatically for POST/PUT/PATCH but keeping it explicit is fine and harmless.

    3. Ensure all exports remain identical: `apiClient`, `ApiError`, `setTokenGetter`, `clearTokenGetter`.

  </action>
  <verify>
    Run `cd c:\Users\Anton\Develop\Personal\how-are-you\fe && npx tsc --noEmit` to verify no TypeScript errors.
    Grep for any remaining `fetch(` in `fe/services/api/client.ts` — should find zero matches.
  </verify>
  <done>
    axios is installed in fe/package.json. apiClient.ts uses axios for all 5 HTTP methods. ApiError is thrown identically on error responses. No fetch() calls remain in client.ts.
  </done>
</task>

<task type="auto">
  <name>Task 2: Replace fetch in service files (promotions, uploads)</name>
  <files>
    fe/services/api/promotions.ts
    fe/services/api/uploads.ts
  </files>
  <action>
    1. Rewrite `fe/services/api/promotions.ts`:
       - Add `import axios from "axios"` and `import { API_URL } from "./config"`
       - `getActive()`: Replace `fetch` with `axios.get(url)`. Return `response.data.data` (axios auto-parses JSON, and the API returns `{ data: PromotionMeta[] }`).
         Error handling: axios throws on non-2xx automatically, so the `if (!response.ok)` check is replaced by a try/catch or just letting it throw. Keep the same error message by wrapping:
         ```typescript
         try {
           const response = await axios.get(`${API_URL}/promotions/active`);
           return response.data.data;
         } catch {
           throw new Error("Failed to fetch active promotions");
         }
         ```
       - `getContent(slug)`: This returns HTML as TEXT (not JSON). Use `axios.get(url, { responseType: "text" })` and return `response.data` (which will be a string).
         ```typescript
         try {
           const response = await axios.get<string>(`${API_URL}/promotions/${slug}/content`, { responseType: "text" });
           return response.data;
         } catch {
           throw new Error(`Failed to fetch promotion content for "${slug}"`);
         }
         ```
         IMPORTANT: The `responseType: "text"` is critical — without it, axios will try to parse HTML as JSON and fail.

    2. Rewrite `fe/services/api/uploads.ts`:
       - Add `import axios from "axios"`
       - `getPresignedUrl()` already uses `apiClient.post` — leave it unchanged, it will automatically use axios through the updated client.
       - `uploadToS3(presignedUrl, fileUri, contentType)`:
         Current behavior: reads blob from fileUri via `fetch(fileUri)`, then PUTs blob to presigned S3 URL.
         In React Native, we need to handle this carefully:

         Replace with:
         ```typescript
         async uploadToS3(presignedUrl: string, fileUri: string, contentType: string): Promise<void> {
           // Read the file as a blob from the local URI
           const fileResponse = await axios.get(fileUri, { responseType: "blob" });
           const blob = fileResponse.data;

           // Upload to S3
           const uploadResponse = await axios.put(presignedUrl, blob, {
             headers: { "Content-Type": contentType },
           });

           if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
             throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
           }
         }
         ```
         Note: axios does not throw for 2xx, and PUT to S3 returns 200, so the status check is technically redundant but kept as a safety net matching original intent. Actually, axios DOES throw on non-2xx by default, so simplify to just let it throw naturally:
         ```typescript
         async uploadToS3(presignedUrl: string, fileUri: string, contentType: string): Promise<void> {
           const fileResponse = await axios.get(fileUri, { responseType: "blob" });

           await axios.put(presignedUrl, fileResponse.data, {
             headers: { "Content-Type": contentType },
           });
         }
         ```

  </action>
  <verify>
    Run `cd c:\Users\Anton\Develop\Personal\how-are-you\fe && npx tsc --noEmit` to verify no TypeScript errors.
    Grep for `fetch(` in `fe/services/api/promotions.ts` and `fe/services/api/uploads.ts` — should find zero matches.
  </verify>
  <done>
    promotions.ts uses axios for both JSON and HTML endpoints. uploads.ts uses axios for file reading and S3 upload. No fetch() calls remain in either file.
  </done>
</task>

<task type="auto">
  <name>Task 3: Replace fetch in AuthContext and UI components</name>
  <files>
    fe/contexts/AuthContext.tsx
    fe/app/profile/edit.tsx
    fe/components/ui/CityPicker.tsx
  </files>
  <action>
    1. Rewrite fetch calls in `fe/contexts/AuthContext.tsx`:
       - Add `import axios from "axios"` at the top

       - In `checkSession` (line ~71): Replace the `/userinfo` fetch:
         ```typescript
         const response = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
           headers: { Authorization: `Bearer ${credentials.accessToken}` },
         });
         const userInfo = response.data;
         ```
         Remove the `if (response.ok)` check — axios throws on non-2xx, so wrap in try/catch (which already exists around this code).

       - In `signInWithApple` (line ~163): Replace the `/oauth/token` fetch:
         ```typescript
         const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
           grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
           client_id: AUTH0_CLIENT_ID,
           subject_token: appleCredential.identityToken,
           subject_token_type: "http://auth0.com/oauth/token-type/apple-authz-code",
           scope: "openid profile email offline_access",
         });
         ```
         For the error check (line ~176 `if (!response.ok)`): axios throws on non-2xx, so move the fallback logic to a catch block. The structure becomes:
         ```typescript
         try {
           const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, { ... });
           const tokens = response.data;
           setAccessToken(tokens.access_token);
           setIsAuthenticated(true);
           // Fetch user info
           const userInfoResponse = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
             headers: { Authorization: `Bearer ${tokens.access_token}` },
           });
           const userInfo = userInfoResponse.data;
           // ... set user state
         } catch (tokenExchangeError) {
           console.error("Token exchange error:", tokenExchangeError);
           // Fallback to Universal Login
           await authorize(...);
           // ... existing fallback logic
         }
         ```
         Note: The original code logged `await response.json()` as the error. With axios, the error response data is at `error.response?.data`. You can log it: `console.error("Token exchange error:", axios.isAxiosError(tokenExchangeError) ? tokenExchangeError.response?.data : tokenExchangeError);`

       - Second `/userinfo` call (line ~197): Replace similarly with `axios.get` and use `response.data` instead of `await response.json()`.

    2. Rewrite fetch in `fe/app/profile/edit.tsx`:
       - Add `import axios from "axios"` at the top
       - In `handleLocate` (line ~157): Replace the Mapbox reverse geocoding fetch:
         ```typescript
         const params = new URLSearchParams({ ... });
         const res = await axios.get(`https://api.mapbox.com/search/geocode/v6/reverse`, { params: {
           longitude: longitude.toString(),
           latitude: latitude.toString(),
           types: "place",
           limit: "1",
           access_token: MAPBOX_PUBLIC_TOKEN ?? "",
         }});
         const data = res.data;
         ```
         Remove the `URLSearchParams` construction — pass params directly to axios. Rest of the logic (reading `data.features`) stays the same.

    3. Rewrite fetch in `fe/components/ui/CityPicker.tsx`:
       - Add `import axios from "axios"` at the top
       - In `searchCities` (line ~60): Replace the Mapbox forward geocoding fetch:
         ```typescript
         const res = await axios.get(`https://api.mapbox.com/search/geocode/v6/forward`, {
           params: {
             q: text.trim(),
             types: "place",
             limit: "5",
             language: "en",
             access_token: MAPBOX_PUBLIC_TOKEN ?? "",
           },
         });
         const data = res.data;
         ```
         Remove the `URLSearchParams` construction. Rest of the logic stays the same.

  </action>
  <verify>
    Run `cd c:\Users\Anton\Develop\Personal\how-are-you\fe && npx tsc --noEmit` to verify no TypeScript errors.
    Grep for `fetch(` across the entire `fe/` directory (excluding node_modules) — should find ZERO matches in .ts and .tsx files.
  </verify>
  <done>
    All 3 files use axios. AuthContext Auth0 calls, Mapbox geocoding in edit.tsx and CityPicker.tsx all use axios. Zero fetch() calls remain anywhere in the frontend source code.
  </done>
</task>

</tasks>

<verification>
Final verification across the entire frontend:
1. `grep -r "fetch(" fe/services/ fe/contexts/ fe/app/ fe/components/ --include="*.ts" --include="*.tsx"` returns no results
2. `grep -r "import axios" fe/services/ fe/contexts/ fe/app/ fe/components/ --include="*.ts" --include="*.tsx"` shows axios imported in all 6 modified files (client.ts imports it, and the 5 consumer files that had direct fetch calls import it)
3. TypeScript compiles with no errors
4. `axios` is listed in fe/package.json dependencies
</verification>

<success_criteria>

- axios is installed as a dependency in fe/package.json
- Zero `fetch()` calls remain in any .ts/.tsx file under fe/ (excluding node_modules)
- apiClient preserves identical public API (get/post/put/patch/delete methods with same signatures)
- ApiError is still thrown with same status/message/data shape on HTTP errors
- HTML content endpoint (promotions getContent) returns string, not parsed JSON
- S3 upload in uploads.ts works with blob via axios
- TypeScript compiles cleanly with no errors
  </success_criteria>

<output>
After completion, create `.planning/quick/3-replace-fetch-with-axios-in-the-frontend/3-SUMMARY.md`
</output>
