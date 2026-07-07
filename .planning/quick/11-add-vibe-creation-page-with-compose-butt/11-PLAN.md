---
phase: quick-11
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - fe/components/ui/LocationHeader.tsx
  - fe/app/(tabs)/vibes.tsx
  - fe/app/vibe/create.tsx
  - fe/constants/routes.ts
  - fe/locales/en.json
  - fe/locales/it.json
autonomous: true
requirements: [VIBE-CREATE]

must_haves:
  truths:
    - "Blue + button is visible next to the notifications bell in the vibes header"
    - "Tapping the + button navigates to a vibe creation screen"
    - "User can type text content in the creation screen"
    - "Placeholder areas for future audio and photo attachments are visible but non-functional"
    - "Tapping Send posts the vibe via the existing vibes API and returns to vibes feed"
    - "Empty content cannot be submitted (Send button disabled)"
  artifacts:
    - path: "fe/app/vibe/create.tsx"
      provides: "Vibe creation screen"
      min_lines: 80
    - path: "fe/components/ui/LocationHeader.tsx"
      provides: "Updated header with compose button"
    - path: "fe/constants/routes.ts"
      provides: "VIBE_CREATE route constant"
  key_links:
    - from: "fe/app/(tabs)/vibes.tsx"
      to: "fe/app/vibe/create.tsx"
      via: "router.push(Routes.VIBE_CREATE)"
      pattern: "router\\.push.*VIBE_CREATE"
    - from: "fe/app/vibe/create.tsx"
      to: "vibesApi.create"
      via: "API call on submit"
      pattern: "vibesApi\\.create"
---

<objective>
Add a vibe (post) creation flow: a blue "+" compose button in the vibes screen header and a dedicated creation screen with text input, placeholder attachment areas, and a Send button wired to the existing POST /posts API.

Purpose: Let users create vibes from the feed, which is a core social feature currently missing from the frontend.
Output: New `fe/app/vibe/create.tsx` screen, updated LocationHeader with compose button, route constant, translations.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@fe/app/(tabs)/vibes.tsx
@fe/components/ui/LocationHeader.tsx
@fe/services/api/vibes.ts
@fe/services/api/types.ts
@fe/constants/routes.ts
@fe/hooks/useVibes.ts
@fe/app/_layout.tsx
@fe/app/post/[id]/comments.tsx (reference for screen patterns, navigation, theme usage)
@fe/locales/en.json
@fe/locales/it.json
@fe/components/ui/index.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add compose button to LocationHeader and wire navigation in vibes screen</name>
  <files>
    fe/components/ui/LocationHeader.tsx
    fe/app/(tabs)/vibes.tsx
    fe/constants/routes.ts
    fe/locales/en.json
    fe/locales/it.json
  </files>
  <action>
1. **fe/constants/routes.ts** -- Add `VIBE_CREATE: "/vibe/create"` to the Routes object.

2. **fe/components/ui/LocationHeader.tsx** -- Add an optional `onComposePress` callback prop to the interface. Render a blue circular "+" button (40x40, same size as the notification button) to the LEFT of the existing notification bell. Use `Ionicons` name `"add"` with size 22 and white color. The button background should be `#3B82F6` (Tailwind blue-500). Include `active:opacity-70` press feedback. Only render the compose button if `onComposePress` is provided. Layout: the right side of the header becomes a `flex-row items-center gap-2` containing [compose button, notification button].

3. **fe/app/(tabs)/vibes.tsx** -- In the `LocationHeader` usage, add `onComposePress={() => router.push(Routes.VIBE_CREATE as never)}`. The `as never` is needed because the route is a new dynamic segment not yet in Expo Router's generated types.

4. **fe/locales/en.json** -- Add to the `"vibes"` section:
   - `"createTitle": "New Vibe"`
   - `"contentPlaceholder": "What's on your mind?"`
   - `"send": "Send"`
   - `"sendingVibe": "Posting..."`
   - `"vibeCreated": "Vibe posted!"`
   - `"vibeCreateError": "Failed to post vibe. Try again."`
   - `"attachPhoto": "Photo"`
   - `"attachAudio": "Audio"`
   - `"comingSoon": "Coming soon"`

5. **fe/locales/it.json** -- Add matching Italian translations to the `"vibes"` section:
   - `"createTitle": "Nuovo Vibe"`
   - `"contentPlaceholder": "A cosa stai pensando?"`
   - `"send": "Invia"`
   - `"sendingVibe": "Pubblicazione..."`
   - `"vibeCreated": "Vibe pubblicato!"`
   - `"vibeCreateError": "Impossibile pubblicare il vibe. Riprova."`
   - `"attachPhoto": "Foto"`
   - `"attachAudio": "Audio"`
   - `"comingSoon": "Prossimamente"`
  </action>
  <verify>
    - `npx tsc --noEmit` from fe/ passes (or at minimum, no new errors introduced in modified files)
    - LocationHeader renders the blue + button when onComposePress is provided
    - Routes.VIBE_CREATE is defined
    - Both en.json and it.json have all new translation keys
  </verify>
  <done>Blue "+" compose button appears next to the notification bell in the vibes header. Tapping it navigates to /vibe/create. All translation keys for the create screen are in place.</done>
</task>

<task type="auto">
  <name>Task 2: Create the vibe creation screen</name>
  <files>
    fe/app/vibe/create.tsx
  </files>
  <action>
Create `fe/app/vibe/create.tsx` as a full-screen route (not a modal). Follow the patterns from `post/[id]/comments.tsx` for theme, safe area, navigation, and layout conventions.

**Screen structure:**

1. **Header bar** -- A top bar with safe area inset padding. Left side: back arrow (`Ionicons` `"arrow-back"`) that calls `router.back()`. Center: title text `t("vibes.createTitle")` ("New Vibe"). Right side: Send button (a `Pressable` with text `t("vibes.send")`). The Send button text should be `theme.primary` color when enabled, `theme.textSecondary` when disabled. Disable Send when `content.trim().length === 0` or `isSubmitting` is true. Show `ActivityIndicator` in place of Send text when `isSubmitting`.

2. **Content area** -- A `KeyboardAvoidingView` (behavior "padding" on iOS, "height" on Android) wrapping a `ScrollView`. Inside:
   - **TextInput** -- Multi-line, auto-focus, placeholder `t("vibes.contentPlaceholder")`, no max height (let it grow), minimum height 150. Style: `theme.text` color, `theme.textSecondary` placeholder color, 16px font size, padding 16. No border. Use `theme.surface` as background.
   - **Character counter** -- Below the text input, right-aligned, show `${content.length} / 10000` in `theme.textSecondary`, font size 12. Only show when content.length > 0.

3. **Attachment placeholder strip** -- Below the text input area, a horizontal row of two rounded pill buttons:
   - Photo: `Ionicons` `"image-outline"`, label `t("vibes.attachPhoto")`
   - Audio: `Ionicons` `"mic-outline"`, label `t("vibes.attachAudio")`
   - Each pill: `theme.card` background, `theme.textSecondary` text/icon color, rounded-full, `px-4 py-2`, `flex-row items-center gap-1.5`.
   - On press: show `Alert.alert(t("vibes.comingSoon"))` -- these are non-functional placeholders.

**Submit logic:**

- Import `vibesApi` and `CreateVibeDto` from `@/services/api/vibes`.
- On Send press: set `isSubmitting = true`, call `await vibesApi.create({ content: content.trim() })`. The `CreatePostDto` requires `content` (string, 1-10000 chars); `visibility` defaults to "PUBLIC"; other fields are optional.
- On success: call `router.back()` to return to the vibes feed. The feed will auto-refresh via `useFocusEffect` already in `vibes.tsx`.
- On error: show `Alert.alert(t("vibes.vibeCreateError"))`, set `isSubmitting = false`.

**Imports needed:** `useRouter` from expo-router, `useSafeAreaInsets`, `useTheme`, `useTranslation`, `useAuth` (to guard -- but the tab is already authenticated, so no guard needed here), `vibesApi` from `@/services/api/vibes`, standard RN components.

**Styling:** Use `theme.background` for the screen background, `theme.surface` for the input area, `theme.border` for any subtle dividers. Keep it clean and modern. Use NativeWind utility classes where convenient, inline `style` for theme colors.
  </action>
  <verify>
    - File exists at `fe/app/vibe/create.tsx`
    - `npx tsc --noEmit` from fe/ passes (or no new type errors from this file)
    - Screen renders: header with back button + title + send button, multiline text input, character counter, two attachment placeholder pills
    - Send button is disabled when input is empty
    - Tapping Send with text calls `vibesApi.create({ content })` and navigates back on success
    - Tapping attachment pills shows "Coming soon" alert
  </verify>
  <done>Complete vibe creation screen at /vibe/create with text input, character counter, placeholder attachment pills (photo + audio), and a functional Send button that POSTs via vibesApi.create and returns to the feed on success.</done>
</task>

</tasks>

<verification>
1. Navigate to the vibes tab -- blue "+" button visible next to notification bell
2. Tap "+" -- navigates to vibe creation screen
3. Screen shows: back arrow, "New Vibe" title, disabled Send button
4. Type some text -- Send button becomes enabled, character counter appears
5. Tap Photo or Audio pill -- "Coming soon" alert appears
6. Tap Send -- vibe is posted, returns to feed, new vibe appears after feed refresh
7. Try to send empty content -- Send button remains disabled
</verification>

<success_criteria>
- Blue compose button visible in vibes header next to notification bell
- Tapping it opens the creation screen with text input and attachment placeholders
- Sending a vibe POSTs to the API and returns to feed
- Empty content cannot be submitted
- Both EN and IT translations present
- No type errors introduced
</success_criteria>

<output>
After completion, create `.planning/quick/11-add-vibe-creation-page-with-compose-butt/11-SUMMARY.md`
</output>
