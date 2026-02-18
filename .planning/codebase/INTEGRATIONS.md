# External Integrations

**Analysis Date:** 2026-02-17

## APIs & External Services

**Authentication:**
- Auth0 - OAuth2 identity provider and user management
  - SDK/Client: `react-native-auth0` 5.4.0
  - Domain: `EXPO_PUBLIC_AUTH0_DOMAIN` env var
  - Client ID: `EXPO_PUBLIC_AUTH0_CLIENT_ID` env var
  - Audience: `EXPO_PUBLIC_AUTH0_AUDIENCE` env var
  - Endpoints:
    - `/oauth/token` - Token exchange (line 163 in AuthContext.tsx)
    - `/userinfo` - User information retrieval (line 72, 197 in AuthContext.tsx)

**Maps & Location:**
- Mapbox - Mapping and geolocation visualization
  - SDK/Client: `@rnmapbox/maps` 10.2.10
  - Auth: `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN` env var
  - Used for: Map display in location-based features

**Custom Backend API:**
- LibreTalk Backend - REST API for application data
  - Base URL: `EXPO_PUBLIC_API_BASE_URL` (default: `http://localhost:3000`)
  - API Version: `v1` (configured in `services/api/config.ts`)
  - Port: 3000 (development)
  - Auth: Bearer token via Authorization header

## Data Storage

**Databases:**
- None directly integrated in frontend
- Backend manages PostgreSQL/database (external to frontend)
- Accessed via REST API at `EXPO_PUBLIC_API_BASE_URL/api/v1`

**Local Storage:**
- Async Storage via `@react-native-async-storage/async-storage` 2.2.0
  - Used for: Local data persistence
  - Implementation: Platform-specific storage (iOS Keychain/Android SharedPreferences)

**File Storage:**
- Amazon S3 (presigned URLs)
  - Upload flow:
    1. Request presigned URL from backend (`/uploads/presigned-url`)
    2. Client uploads directly to S3 via presigned URL
    3. Backend returns public URL after upload
  - Implementation: `services/api/uploads.ts` - `uploadsApi.uploadToS3()`
  - Supported folders: `avatars`
  - Supported content types: `image/webp`, `image/jpeg`, `image/png`

**Caching:**
- None detected - Real-time data via REST API

## Authentication & Identity

**Auth Provider:**
- Auth0 (libretalk-dev.eu.auth0.com)
  - Implementation: OAuth2 with Authorization Code flow
  - Location: `contexts/AuthContext.tsx`
  - Methods supported:
    1. Apple Sign-In (native on iOS, Universal Login fallback on Android)
    2. Google Sign-In (via Universal Login)
    3. Email Sign-In (via Universal Login)

**Token Management:**
- Bearer tokens stored in Auth0 session
- Token getter pattern: `setTokenGetter()` in `services/api/client.ts`
- Token retrieval: `getToken()` callback via `useAuth()` hook
- Token refresh: Handled by Auth0 SDK

**Authorization:**
- JWT-based via Authorization header
- Format: `Authorization: Bearer {accessToken}`

## API Endpoints

**Base Structure:**
- Base: `http://localhost:3000/api/v1` (development)
- Version: v1
- Authentication: Bearer token in Authorization header

**User Endpoints:**
- `GET /users` - List all users (paginated)
- `GET /users/me` - Current user profile
- `GET /users/active` - Active users
- `GET /users/online` - Online users
- `GET /users/{id}` - User by ID
- `GET /users/username/{username}` - User by username
- `PATCH /users/{id}` - Update user
- `PATCH /users/{id}/online-status` - Set online status
- `POST /users/{id}/last-seen` - Update last seen time
- `PATCH /users/me` - Update current user
- `PUT /users/me/languages` - Update user languages
- `PUT /users/me/passions` - Update user passions

**Reference Data Endpoints:**
- `GET /countries` - List countries
- `GET /languages` - List languages
- `GET /passions` - List passions

**Conversation Endpoints:**
- `GET /conversations` - List conversations
- `POST /conversations` - Create conversation
- `GET /conversations/{id}` - Get conversation
- `PATCH /conversations/{id}` - Update conversation

**Messaging Endpoints:**
- `GET /conversations/{id}/messages` - List messages
- `POST /conversations/{id}/messages` - Send message

**Social Endpoints:**
- `GET /vibes` - List vibes/posts
- `POST /vibes` - Create vibe
- `GET /vibes/{id}/comments` - List comments
- `POST /vibes/{id}/comments` - Post comment
- `POST /likes` - Like vibe/comment
- `DELETE /likes/{id}` - Unlike

**Follow Endpoints:**
- `POST /follows` - Follow user
- `DELETE /follows/{id}` - Unfollow user

**Upload Endpoints:**
- `POST /uploads/presigned-url` - Get S3 presigned URL

## Webhooks & Callbacks

**Incoming:**
- Auth0 callback URL: `libretalk://` (custom scheme configured in app.json)
- Used for: OAuth redirect after authentication

**Outgoing:**
- None detected

## HTTP Client

**Implementation:**
- Native Fetch API (no axios detected in codebase)
- Location: `services/api/client.ts`
- Custom wrapper: `apiClient` object
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`
- Features:
  - Automatic Bearer token injection
  - Error handling with custom `ApiError` class
  - Query parameter building
  - JSON serialization

**Error Handling:**
- Custom `ApiError` class with status code and error data
- HTTP 401 (Unauthorized) handling with message override
- Standard HTTP error status/message fallback

## Environment Configuration

**Required env vars:**
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_AUTH0_DOMAIN=libretalk-dev.eu.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your-client-id
EXPO_PUBLIC_AUTH0_AUDIENCE=https://api.libre-talk.local
EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN=xxx
```

**Secrets location:**
- `.env` file (local development)
- Environment variables (production, set via deployment platform)
- See `.env.example` for template

## Platform-Specific Features

**iOS:**
- Native Apple Sign-In via `expo-apple-authentication`
- Token exchange with Auth0 for seamless integration
- Fallback to Universal Login if exchange fails

**Android:**
- Google authentication via Auth0 Universal Login
- Apple authentication via Auth0 Universal Login

---

*Integration audit: 2026-02-17*
