# LibreTalk — Frontend

LibreTalk is a cross-platform social mobile app for meeting and talking to people
around the world. Users discover others through **Vibes**, share and interact in a
**Community** feed, exchange real-time **Chat** messages, and connect over voice
**Calls** — all built around rich profiles (languages, passions, location and
personality).

This repository contains the **frontend** (mobile + web) built with
[Expo](https://expo.dev) and React Native. The backend lives in a separate
workspace (`be/`).

## Features

- **Authentication** — OIDC sign-in and session management via [Logto](https://logto.io).
- **Onboarding** — multi-step profile setup (basics, personality/passions, location).
- **Vibes** — a discovery feed for finding and connecting with nearby or relevant people.
- **Community** — social feed with posts, comments, likes and follows.
- **Chat** — one-to-one conversations with real-time updates over WebSocket.
- **Calls** — voice calling (microphone access) between users.
- **Profiles** — editable profiles with avatar upload, languages, passions, MBTI, country flags and zodiac.
- **Notifications** — push notifications with per-category preferences.
- **Maps & location** — nearby discovery powered by Mapbox and device geolocation.
- **Theming** — light/dark mode with runtime switching, persisted locally.
- **Internationalization** — multi-language support (English, Italian) via i18next.

## Tech Stack

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| Framework | React Native `0.81` + Expo `54` |
| UI runtime | React `19` |
| Routing | Expo Router (file-based) |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Auth | Logto (`@logto/rn`) |
| Networking | Axios-based typed API client + WebSocket for real-time |
| Maps | Mapbox (`@rnmapbox/maps`) + Expo Location |
| i18n | i18next / react-i18next |
| Notifications | Expo Notifications |
| Animations | React Native Reanimated + Worklets |
| Package manager | Bun |

## Project Structure

The app follows a layered client architecture with a strict dependency direction:
**screens → hooks → API services → HTTP/WebSocket client**. Global state lives in
React Contexts; feature state lives in custom hooks.

```
fe/
├── app/                # Expo Router file-based routes (screens)
│   ├── _layout.tsx     # Root layout — wraps app in Auth, Theme & WebSocket providers
│   ├── index.tsx       # Entry route — redirects based on auth/onboarding state
│   ├── (auth)/         # Auth route group (login)
│   ├── (tabs)/         # Main tabs: vibes, community, chat, call, settings
│   ├── onboarding/     # Multi-step onboarding flow
│   ├── chat/[id].tsx   # Individual conversation screen
│   ├── profile/        # Profile view, edit and passions
│   ├── post/           # Post detail & comments
│   ├── promo/          # Dynamic promotional pages
│   └── settings/       # Settings sub-screens (e.g. notifications)
│
├── components/ui/      # Reusable presentational components (barrel-exported)
├── services/api/       # Typed API layer: HTTP client, config, types + domain modules
│                       # (users, conversations, vibes, comments, likes, follows,
│                       #  uploads, notifications, device-tokens, reports, …)
├── hooks/              # Data-fetching & feature hooks (useConversations, useVibes,
│                       #  useCurrentUser, useNotifications, usePushToken, …)
├── contexts/           # Global state: AuthContext, ThemeContext, WebSocketContext
├── constants/          # Route paths, theme tokens, stickers
├── utils/              # Pure helpers (time formatting, conversation display)
├── lib/                # Third-party setup (i18n initialization)
├── locales/            # Translation files (en, it)
├── assets/             # Images, icons, country flags, fonts
├── plugins/            # Custom Expo config plugins (applied during prebuild)
│
├── app.json            # Expo configuration
├── tailwind.config.js  # Tailwind / NativeWind configuration
└── tsconfig.json       # TypeScript config (with `@/*` path alias)
```

### Architecture notes

- **Presentation layer** (`app/**`): screens coordinate UI and hooks, and render
  conditionally on `{ data, isLoading, error, refresh, loadMore }`.
- **Hooks layer** (`hooks/*`): encapsulate fetching, pagination and side effects.
  `useCurrentUser` uses a singleton external store to deduplicate concurrent requests.
- **API layer** (`services/api/*`): domain-grouped modules delegating to a central,
  typed client that injects the Logto access token before each request.
- **Contexts** (`contexts/*`): `AuthContext` (Logto session & token getter),
  `ThemeContext` (persisted light/dark theme) and `WebSocketContext` (real-time
  chat events).

## Getting Started

This project uses **[Bun](https://bun.sh)** as its package manager and runtime.

### Prerequisites

- Bun
- Expo tooling (installed via dependencies) and a device/emulator:
  - Android Studio emulator, iOS simulator, or a physical device with a
    [development build](https://docs.expo.dev/develop/development-builds/introduction/).

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | Backend API base URL (default: `http://localhost:3000`) |
| `EXPO_PUBLIC_LOGTO_ENDPOINT` | Logto instance endpoint |
| `EXPO_PUBLIC_LOGTO_APP_ID` | Logto application ID |
| `EXPO_PUBLIC_LOGTO_RESOURCE` | API resource URI registered in Logto (for JWT access tokens) |
| `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN` | Mapbox public token for map rendering |

### 3. Run the app

Because the app relies on native modules (Mapbox, Logto, image cropping, etc.),
use a **development build** rather than Expo Go:

```bash
# Start the dev server (development client)
bun run dev

# Or build & run on a platform
bun run android
bun run ios

# Web
bun run web
```

## Available Scripts

| Script | Description |
| --- | --- |
| `bun run start` | Start the Expo dev server |
| `bun run dev` | Start the dev server with the development client |
| `bun run dev:tunnel` | Start the dev server over a tunnel |
| `bun run android` | Build and run on Android |
| `bun run ios` | Build and run on iOS |
| `bun run web` | Run in the browser |
| `bun run prebuild:clean` | Regenerate native projects from `app.json` |
| `bun run eas:build:android` | Trigger an EAS Android development build |
| `bun run lint` | Run ESLint |
| `bunx tsc --noEmit` | Type-check the project |

## Conventions

- **Package manager:** always use `bun` / `bunx` / `bun run` (not npm/npx).
- **Path alias:** import from the project root with `@/*` (e.g. `@/components/ui`).
- **Planning artifacts:** frontend planning docs live in `fe/.planning/`.
- **New code:** add screens under `app/`, reusable UI under `components/ui/`,
  data logic under `hooks/`, and API calls under `services/api/`.
