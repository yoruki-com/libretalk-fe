# Codebase Structure

**Analysis Date:** 2026-02-17

## Directory Layout

```
fe/
├── app/                           # Expo Router file-based routes (screens)
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Entry route (auth/onboarding router)
│   ├── (auth)/                   # Auth route group
│   │   ├── _layout.tsx           # Auth layout
│   │   └── login.tsx             # Login screen
│   ├── (tabs)/                   # Main tab group (bottom navigation)
│   │   ├── _layout.tsx           # Tab layout with BottomNavigation
│   │   ├── chat.tsx              # Chat list screen
│   │   ├── vibes.tsx             # Vibes discovery screen
│   │   ├── community.tsx         # Community screen
│   │   └── settings.tsx          # Settings screen
│   ├── onboarding/               # Onboarding flow
│   │   ├── _layout.tsx           # Onboarding layout
│   │   ├── step1.tsx             # Step 1 (profile basics)
│   │   ├── step2.tsx             # Step 2 (personality/passions)
│   │   └── step3.tsx             # Step 3 (location/finalization)
│   ├── chat/                     # Chat detail routes
│   │   └── [id].tsx              # Individual chat conversation
│   ├── profile/                  # Profile routes
│   │   ├── [id].tsx              # Profile view
│   │   ├── edit.tsx              # Profile edit
│   │   └── passions.tsx          # Edit passions
│   ├── post/                     # Post/community routes
│   │   └── [id]/comments.tsx     # Post comments
│   ├── promo/                    # Promotional/marketing routes
│   │   └── [slug].tsx            # Dynamic promo page
│   ├── vip.tsx                   # VIP tier info
│   └── get-started.tsx           # Onboarding start screen
│
├── components/                    # Reusable UI components
│   └── ui/                       # UI component library
│       ├── index.ts              # Component exports (barrel file)
│       ├── Button.tsx            # Basic button
│       ├── ChatCard.tsx          # Chat list item
│       ├── ChatInput.tsx         # Message input
│       ├── ChatHeader.tsx        # Chat detail header
│       ├── MessageBubble.tsx     # Chat message bubble
│       ├── ProfileCard.tsx       # User profile card
│       ├── CommentCard.tsx       # Post comment
│       ├── CommentInput.tsx      # Comment form
│       ├── CommunityCard.tsx     # Community post card
│       ├── VibeCard.tsx          # Vibe/discovery card
│       ├── CityPicker.tsx        # City selection component
│       ├── MbtiPicker.tsx        # MBTI/personality picker
│       ├── PassionPicker.tsx     # Passion/interest picker
│       ├── CountryFlag.tsx       # Country flag display
│       ├── UserBadge.tsx         # User info badge
│       ├── DropdownMenu.tsx      # Dropdown menu component
│       ├── Header.tsx            # Screen header
│       ├── SearchInput.tsx       # Search field
│       ├── SearchBar.tsx         # Search with filtering
│       ├── ArchiveRow.tsx        # Archive/grouped item
│       ├── DateSeparator.tsx     # Message date divider
│       ├── SlideIndicator.tsx    # Carousel indicator
│       ├── RefreshableScrollView.tsx  # Scroll with refresh
│       ├── BottomNavigation.tsx  # Bottom tab bar
│       ├── CategoryChip.tsx      # Category selection chip
│       ├── SettingsMenuItem.tsx  # Settings item
│       ├── SettingsMenuGroup.tsx # Settings section
│       ├── LocationHeader.tsx    # Location display
│       └── edit-profile/         # Profile edit helpers
│           ├── index.ts          # Sub-exports
│           ├── Divider.tsx       # Horizontal divider
│           ├── FieldRow.tsx      # Form field wrapper
│           ├── SectionCard.tsx   # Section container
│           ├── SectionHeader.tsx # Section title
│           ├── IconRow.tsx       # Icon + text row
│           └── getZodiacSign.ts  # Zodiac calculation utility
│
├── services/                     # API communication layer
│   └── api/                      # API client and endpoints
│       ├── client.ts             # HTTP client with token injection
│       ├── config.ts             # API base URL configuration
│       ├── types.ts              # API response and entity types
│       ├── index.ts              # Service exports (barrel file)
│       ├── users.ts              # User endpoints
│       ├── conversations.ts      # Conversation + message endpoints
│       ├── vibes.ts              # Vibe/discovery endpoints
│       ├── comments.ts           # Comment endpoints
│       ├── likes.ts              # Like endpoints
│       ├── follows.ts            # Follow relationship endpoints
│       ├── uploads.ts            # File upload endpoints
│       ├── promotions.ts         # Promo endpoint
│       ├── countries.ts          # Country list endpoint
│       ├── languages.ts          # Language list endpoint
│       ├── passions.ts           # Interest/passion list endpoint
│
├── hooks/                        # Custom React hooks
│       ├── useCurrentUser.ts     # Fetch current user profile (external store pattern)
│       ├── useConversations.ts   # Fetch conversations with pagination
│       ├── useConversation.ts    # Fetch single conversation
│       ├── useComments.ts        # Fetch and manage comments
│       ├── useVibes.ts           # Fetch vibes/discovery cards
│       ├── useCommunity.ts       # Fetch community content
│       ├── useAvatarUpload.ts    # Handle avatar file upload
│       └── useChatHelpers.ts     # Chat utility functions
│
├── contexts/                     # React Context providers
│       ├── AuthContext.tsx       # Authentication state + Auth0 integration
│       └── ThemeContext.tsx      # Light/dark theme state
│
├── constants/                    # Static values and configuration
│       ├── routes.ts             # Route path constants
│       ├── theme.ts              # Light/dark theme objects
│       └── stickers.ts           # Sticker/emoji assets
│
├── utils/                        # Utility functions
│       ├── time.ts               # Time formatting helpers
│       └── conversation.ts       # Conversation display helpers
│
├── lib/                          # Third-party integrations
│       └── i18n.ts              # Internationalization setup
│
├── locales/                      # Translation files (i18n)
│       └── [language]/           # Language directories with translation JSONs
│
├── assets/                       # Static images, icons, etc.
│       └── images/               # App images (icons, splash, etc.)
│
├── plugins/                      # Expo plugins
│       └── withAuth0SchemeFixPlugin/  # Custom Auth0 deep link handler
│
├── .expo/                        # Expo CLI cache and metadata
├── android/                      # Android native project (generated)
├── .vscode/                      # VS Code workspace settings
│
├── app.json                      # Expo configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── expo-env.d.ts                 # Expo env types
├── nativewind-env.d.ts           # NativeWind types
├── tailwind.config.js            # Tailwind CSS config
├── global.css                    # Global styles
└── svg.d.ts                      # SVG import types
```

## Directory Purposes

**app/:**
- Purpose: Expo Router file-based routing - each file is a route
- Contains: Screen components representing full-screen views
- Key files: `_layout.tsx` (layouts), `index.tsx` (entry point), named files (routes), `[id].tsx` (dynamic routes)
- Pattern: Directory structure maps to URL structure; `(name)` indicates route group with shared layout

**components/ui/:**
- Purpose: Reusable presentational components for screens
- Contains: All UI components, form inputs, cards, modals, etc.
- Key files: Barrel export in `index.ts` for cleaner imports
- Pattern: One component per file, exported and re-exported through index

**services/api/:**
- Purpose: Centralized API communication with type safety
- Contains: HTTP client, endpoint definitions, request/response types
- Key files: `client.ts` (core HTTP logic), `types.ts` (shared types), module files (endpoint groups)
- Pattern: Singleton client instance, service modules delegate to it, types define contracts

**hooks/:**
- Purpose: Encapsulate data fetching and state management logic
- Contains: Custom hooks for specific features
- Key files: Each hook file contains one hook (sometimes with helpers)
- Pattern: Hooks accept options, return data + metadata + action methods, handle loading/error states

**contexts/:**
- Purpose: App-wide shared state via React Context
- Contains: Context providers and their associated state logic
- Key files: AuthContext (authentication), ThemeContext (theming)
- Pattern: Context creation, Provider component, custom useContext hook

**constants/:**
- Purpose: Static values, configuration, and type-safe constants
- Contains: Route paths, theme definitions, configuration values
- Key files: `routes.ts` (centralized route definitions), `theme.ts` (color/spacing system)
- Pattern: Exported objects or constants for single source of truth

**utils/:**
- Purpose: Pure utility functions and helpers
- Contains: Formatting, transformation, and helper functions
- Key files: `time.ts` (date formatting), `conversation.ts` (display helpers)
- Pattern: Simple pure functions, no side effects

**lib/:**
- Purpose: Integration with third-party libraries and frameworks
- Contains: Setup code for external dependencies
- Key files: `i18n.ts` (i18next initialization)

**locales/:**
- Purpose: Internationalization translation files
- Contains: Language-specific translation JSON objects
- Pattern: Loaded and managed by react-i18next via lib/i18n.ts

**assets/:**
- Purpose: Static media assets
- Contains: Images, icons, splash screens, fonts
- Pattern: Organized by asset type (images/, etc.)

**plugins/:**
- Purpose: Custom Expo plugins for native configuration
- Contains: JavaScript files that modify native project configuration
- Pattern: Plugins are listed in app.json and executed during prebuild

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root layout, initializes providers (Auth, Theme), loads fonts
- `app/index.tsx`: Index route, implements auth/onboarding redirect logic
- `app/(auth)/login.tsx`: Authentication screen with Auth0 methods
- `app/(tabs)/_layout.tsx`: Main navigation after login

**Configuration:**
- `package.json`: Dependencies, scripts, project metadata
- `app.json`: Expo configuration (permissions, plugins, iOS/Android specifics)
- `tsconfig.json`: TypeScript compilation settings with `@/*` path alias
- `expo-env.d.ts`: Type definitions for Expo environment variables

**Core Logic:**
- `services/api/client.ts`: HTTP client with token injection and error handling
- `contexts/AuthContext.tsx`: Authentication state, session management, login methods
- `contexts/ThemeContext.tsx`: Theme state, persistence to AsyncStorage
- `hooks/useCurrentUser.ts`: Fetch and cache current user profile with external store pattern

**Testing:**
- No test files found in codebase (testing coverage not yet implemented)

## Naming Conventions

**Files:**
- `[ComponentName].tsx`: React components (PascalCase)
- `[functionName].ts`: Utility files with functions (camelCase)
- `_layout.tsx`: Expo Router layout files (required name)
- `[id].tsx`: Dynamic route segments (square brackets)
- `_[segment].tsx`: Route segments to hide in URL (leading underscore)
- `(group)/`: Route groups (parentheses, no URL segment)

**Directories:**
- `[feature]/`: Feature-related directories (kebab-case preferred in routes)
- `ui/`: UI component subdirectory
- `api/`: API service subdirectory
- `edit-profile/`: Sub-feature directories (kebab-case)

**Exports:**
- `index.ts`: Barrel files re-exporting from sibling files
- Named exports: `export const`, `export interface`, `export type`
- Default exports: Used for route screens and component files

**API/Service Files:**
- `[domain]Api` or `[domain]api` object: Exported service with CRUD methods
- `[Domain]Dto`: Data Transfer Object for request bodies
- `[Domain]Response`: Response type wrapper

## Where to Add New Code

**New Feature (e.g., new tab or screen):**
- Primary code: `app/[feature]/page.tsx` (or `app/(group)/feature.tsx` if grouped)
- Components: `components/ui/[FeatureSpecificComponent].tsx`
- Hooks: `hooks/use[Feature].ts` (if data fetching needed)
- Constants: `constants/[feature].ts` (if feature-specific constants)
- Tests: `app/[feature]/page.test.tsx` (co-located with route)

**New UI Component:**
- Implementation: `components/ui/[ComponentName].tsx`
- Export: Add to `components/ui/index.ts` barrel file
- Tests: `components/ui/[ComponentName].test.tsx` (co-located)

**New API Endpoint:**
- Service module: `services/api/[domain].ts` (create or add to existing domain file)
- Types: Update `services/api/types.ts` with request/response types
- Export: Add to `services/api/index.ts` barrel file
- Usage: Import service in hooks or directly in screens

**New Utility:**
- Implementation: `utils/[utility-name].ts`
- Tests: `utils/[utility-name].test.ts` (co-located)

**New Constant:**
- Add to existing file in `constants/` if category exists
- Create new file if introducing new category (e.g., `constants/payment.ts`)

**Authentication/Global State:**
- Modify `contexts/AuthContext.tsx` for auth flow changes
- Modify `contexts/ThemeContext.tsx` for theming changes
- Avoid adding new context unless truly global

## Special Directories

**node_modules/:**
- Purpose: Dependency storage (Bun package manager)
- Generated: Yes
- Committed: No (.gitignore)

**android/, ios/:**
- Purpose: Native platform projects
- Generated: Partially (from prebuild process based on app.json)
- Committed: No (gitignore via Expo)

**.expo/:**
- Purpose: Expo CLI cache and metadata
- Generated: Yes
- Committed: No

**.vscode/:**
- Purpose: VS Code workspace settings
- Generated: No (manual configuration)
- Committed: Yes

**locales/:**
- Purpose: Translation files for i18n
- Generated: No
- Committed: Yes
- Structure: Each language in subdirectory (e.g., `locales/en/`, `locales/es/`)

**plugins/:**
- Purpose: Custom Expo plugins applied during prebuild
- Generated: No
- Committed: Yes
- Pattern: Each plugin in its own directory, exports a function for expo config

---

*Structure analysis: 2026-02-17*
