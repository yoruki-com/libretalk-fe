---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - be/libs/mythos-schemas/package.json
  - fe/package.json
  - fe/bun.lock
  - fe/services/api/types.ts
  - fe/services/api/index.ts
  - fe/services/api/vibes.ts
  - fe/services/api/likes.ts
  - fe/services/api/follows.ts
  - fe/services/api/promotions.ts
  - fe/services/api/uploads.ts
  - fe/services/api/users.ts
  - fe/services/api/conversations.ts
  - fe/services/api/countries.ts
  - fe/services/api/languages.ts
  - fe/services/api/passions.ts
  - fe/services/api/client.ts
  - fe/app/profile/[id].tsx
  - fe/app/profile/edit.tsx
  - fe/app/onboarding/step2.tsx
  - fe/app/onboarding/step3.tsx
  - fe/app/(tabs)/community.tsx
  - fe/hooks/useCommunity.ts
  - fe/hooks/useComments.ts
  - fe/hooks/useChatHelpers.ts
  - fe/hooks/useConversation.ts
  - fe/hooks/useConversations.ts
  - fe/hooks/useCurrentUser.ts
  - fe/utils/conversation.ts
  - fe/components/ui/MbtiPicker.tsx
  - fe/components/ui/PassionPicker.tsx
autonomous: true
must_haves:
  truths:
    - "Frontend API service files import response payload types from @yoruki-com/libretalk-mythos-schemas instead of defining local duplicates"
    - "Frontend types.ts has no duplicate entity interfaces that exist in mythos-schemas"
    - "All frontend files that consumed the old local types compile without errors"
    - "API wrapper types (ApiResponse, PaginatedResponse, PaginationParams) use backend canonical shapes"
  artifacts:
    - path: "fe/services/api/types.ts"
      provides: "Re-exports from mythos-schemas + frontend-only types"
      contains: "@yoruki-com/libretalk-mythos-schemas"
    - path: "fe/services/api/vibes.ts"
      provides: "Vibe API using PostResponse from shared lib"
      contains: "@yoruki-com/libretalk-mythos-schemas"
  key_links:
    - from: "fe/services/api/types.ts"
      to: "@yoruki-com/libretalk-mythos-schemas"
      via: "import + re-export"
      pattern: "from [\"']@yoruki-com/libretalk-mythos-schemas[\"']"
---

<objective>
Replace locally-defined API response payload interfaces in the frontend (`fe/services/api/`) with shared types from `@yoruki-com/libretalk-mythos-schemas`.

Purpose: Eliminate type duplication between backend and frontend. The backend defines canonical response shapes as Zod-inferred types in `mythos-schemas`. The frontend currently duplicates these as hand-written interfaces in `fe/services/api/types.ts` and several module files. Replacing them with the shared package ensures type safety and single source of truth.

Output: Frontend API layer imports entity types from `@yoruki-com/libretalk-mythos-schemas` instead of local duplicates. All consumer files updated accordingly.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@be/.planning/STATE.md
@be/libs/mythos-schemas/src/index.ts
@be/libs/mythos-schemas/src/common.types.ts
@be/libs/mythos-schemas/package.json
@fe/package.json
@fe/services/api/types.ts
@fe/services/api/index.ts
@fe/services/api/vibes.ts
@fe/services/api/likes.ts
@fe/services/api/follows.ts
@fe/services/api/promotions.ts
@fe/services/api/uploads.ts
@fe/services/api/users.ts
@fe/services/api/conversations.ts
@fe/services/api/countries.ts
@fe/services/api/languages.ts
@fe/services/api/passions.ts
@fe/services/api/client.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Publish mythos-schemas 0.0.4 with payload types</name>
  <files>be/libs/mythos-schemas/package.json</files>
  <action>
The payload types (reply payloads) were merged into mythos-schemas after version 0.0.3 was published. The frontend currently has 0.0.3 which lacks the payload types and `common.types.ts` exports.

1. Bump version in `be/libs/mythos-schemas/package.json` from `"0.0.3"` to `"0.0.4"`.
2. Build: `cd be && bun run mythos-schemas:publish` (this runs nx build then npm publish). If publish fails due to auth, create a checkpoint for the user to publish manually. If it succeeds, proceed.
3. Update `fe/package.json` to reference `"@yoruki-com/libretalk-mythos-schemas": "0.0.4"`.
4. Run `cd fe && bun install` to pull the new version.
5. Verify the installed package has the payload types: check that `fe/node_modules/@yoruki-com/libretalk-mythos-schemas/dist/src/common.types.d.ts` exists.
  </action>
  <verify>
`ls fe/node_modules/@yoruki-com/libretalk-mythos-schemas/dist/src/common.types.d.ts` exists.
`ls fe/node_modules/@yoruki-com/libretalk-mythos-schemas/dist/src/modules/user/user.payloads.d.ts` exists.
  </verify>
  <done>mythos-schemas 0.0.4 published and installed in frontend with all payload types available.</done>
</task>

<task type="auto">
  <name>Task 2: Replace frontend local interfaces with mythos-schemas imports</name>
  <files>
fe/services/api/types.ts
fe/services/api/index.ts
fe/services/api/vibes.ts
fe/services/api/likes.ts
fe/services/api/follows.ts
fe/services/api/promotions.ts
fe/services/api/uploads.ts
fe/services/api/users.ts
fe/services/api/conversations.ts
fe/services/api/countries.ts
fe/services/api/languages.ts
fe/services/api/passions.ts
fe/services/api/client.ts
fe/app/profile/[id].tsx
fe/app/profile/edit.tsx
fe/app/onboarding/step2.tsx
fe/app/onboarding/step3.tsx
fe/app/(tabs)/community.tsx
fe/hooks/useCommunity.ts
fe/hooks/useComments.ts
fe/hooks/useChatHelpers.ts
fe/hooks/useConversation.ts
fe/hooks/useConversations.ts
fe/hooks/useCurrentUser.ts
fe/utils/conversation.ts
fe/components/ui/MbtiPicker.tsx
fe/components/ui/PassionPicker.tsx
  </files>
  <action>
**IMPORTANT type mapping reference (frontend local name -> mythos-schemas export):**

Entity response types (direct replacements):
- `User` -> `UserResponse` (from user.schemas)
- `UserMe` -> does NOT exist as a separate type in backend. `UserResponse` has `languages?` and `passions?` as optional fields. Create a local type alias: `type UserMe = UserResponse & { languages: UserLanguageResponse[]; passions: PassionResponse[] }` where `UserLanguageResponse` is the inferred type from `userLanguageResponseSchema`. NOTE: `userLanguageResponseSchema` is not exported by name from the package. The shape is `{ code, name, nativeName, proficiency, isLearning }`. Either use `UserResponse["languages"]` to extract the type or keep a local `UserMe` that extends `UserResponse` making `languages` and `passions` required. Simplest: `type UserMe = Required<Pick<UserResponse, "languages" | "passions">> & Omit<UserResponse, "languages" | "passions">`.
- `UserLanguage` -> use the array element type from `UserResponse["languages"]` (i.e., `NonNullable<UserResponse["languages"]>[number]`)
- `Language` -> `LanguageResponse` (from language.schemas -- but check: frontend `Language` has `{publicId, code, name, nativeName, isActive}`. Backend `LanguageResponse` -- need to verify. Read `language.schemas.ts`.)
- `Country` -> `CountryResponse` (from country.schemas)
- `Passion` -> `PassionResponse` (inlined in user.schemas response, also from passion.schemas if exported separately)
- `Conversation` -> `ConversationResponse`
- `ConversationParticipant` -> inferred from conversation schema (not separately exported, part of ConversationResponse)
- `ConversationSpace` -> part of ConversationResponse
- `ConversationLastMessage` -> part of ConversationResponse
- `Message` -> `MessageResponse`
- `MessageSender` -> part of MessageResponse
- `Like` -> `LikeResponse`
- `LikeUser` -> part of LikeResponse (the `user` field)
- `ToggleLikeResponse` -> `ToggleLikeResponse` (same name, from like.schemas)
- `ToggleFollowResponse` -> `ToggleFollowResponse` (same name, from follow.schemas)
- `PresignedUrlResponse` -> `PresignedUrlResponse` (same name, from upload.payloads)
- `PromotionMeta` -> `PromotionResponse` (different name)

Vibe types (vibes = posts in the frontend):
- `Vibe` -> `PostResponse` (re-export as `type Vibe = PostResponse` for frontend naming)
- `VibeAuthor` -> author is part of PostResponse, extract: `type VibeAuthor = PostResponse["author"]`. NOTE: frontend has extra `role: string | null` field. Backend does NOT have `role`. Remove `role` from frontend type or add `& { role: string | null }` if actually used. Grep fe/ for `.role` usage on VibeAuthor to decide.
- `VibeAuthorLanguage` -> part of PostResponse author languages
- `CommentAuthor` -> part of CommentResponse
- `Comment` -> `CommentResponse`
- `CommentWithReplies` -> `CommentWithRepliesResponse`

DTO / request types (direct replacements where they exist in backend):
- `CreateUserDto` -> `CreateUserDto` (from user.schemas)
- `UpdateUserDto` -> `UpdateUserDto` (from user.schemas)
- `UpdateUserLanguagesDto` -> `UpdateUserLanguagesDto` (from user.schemas)
- `UpdateUserPassionsDto` -> `UpdateUserPassionsDto` (from user.schemas)
- `CreateConversationDto` -> `CreateConversationDto` (from conversation.schemas)
- `UpdateConversationDto` -> `UpdateConversationDto` (from conversation.schemas)
- `CreateMessageDto` -> `CreateMessageDto` (from conversation.schemas)
- `CreateVibeDto` -> does NOT exist in backend as named. Backend has `CreatePostDto`. Create alias: `type CreateVibeDto = CreatePostDto`
- `UpdateVibeDto` -> does NOT exist in backend as named. Backend has `UpdatePostDto`. Create alias: `type UpdateVibeDto = UpdatePostDto`
- `CreateCommentDto` -> `CreateCommentDto` (from comment.schemas). NOTE: frontend version has extra `authorPublicId` field not in backend schema. Keep local version if needed, or check if backend handles this differently.
- `UpdateCommentDto` -> `UpdateCommentDto` (from comment.schemas)
- `LikePostDto` / `LikeCommentDto` -> `LikePostDto` / `LikeCommentDto` (from like.schemas). NOTE: frontend versions have extra `userPublicId` field not in backend schemas. Keep local if needed.

Enum types:
- `PersonalityType` -> infer from `UserResponse["personalityType"]` or keep local (Zod enum inferred types work). Simplest: `type PersonalityType = NonNullable<UserResponse["personalityType"]>`
- `Gender` -> `type Gender = NonNullable<UserResponse["gender"]>`
- `LanguageProficiency` -> extract from UserLanguage type
- `MessageType` -> `type MessageType = MessageResponse["type"]`
- `MessageStatus` -> `type MessageStatus = MessageResponse["status"]`

API wrapper types (these are structural, not entity types):
- `ApiResponse<T>` -> Replace with `SuccessPayload<T>` from `common.types.ts`. Note: backend uses `success: true` (literal), frontend uses `success: boolean`. The backend is the source of truth. Replace `ApiResponse` with `SuccessPayload` everywhere, or re-export as alias: `type ApiResponse<T> = SuccessPayload<T>`.
- `PaginatedResponse<T>` -> Replace with `PaginatedPayload<T>` from `common.types.ts`. CRITICAL: field names differ:
  - Frontend: `pagination.totalCount` -> Backend: `pagination.totalItems`
  - Frontend: `pagination.hasPreviousPage` -> Backend: `pagination.hasPrevPage`
  - Backend lacks `pagination.pageSize` as a direct field name issue -- check actual backend PaginationMeta.
  The backend `PaginationMeta` is: `{ page, pageSize, totalItems, totalPages, hasNextPage, hasPrevPage }`.
  The frontend `PaginatedResponse.pagination` is: `{ page, pageSize, totalPages, totalCount, hasNextPage, hasPreviousPage }`.
  These DO differ. Use `PaginatedPayload<T>` from the shared lib. Then grep the frontend codebase for `totalCount` and `hasPreviousPage` references and update them to `totalItems` and `hasPrevPage`.
- `PaginationParams` -> This is a REQUEST type (query params), not a response type. Backend exports it from shared-schemas or shared-types. Check if `PaginationParams` exists in `@yoruki-com/libretalk-mythos-schemas`. If not, keep as local. The package does NOT export PaginationParams (it exports pagination query/response schemas but the query type may not match). Keep PaginationParams local.
- `ListPayload<T>` -> new type from backend, used for non-paginated lists. Import from shared lib.

**Step-by-step execution:**

1. First, grep `fe/` for all usages of `totalCount` and `hasPreviousPage` to understand the blast radius of pagination field renames.

2. **Rewrite `fe/services/api/types.ts`:**
   - Remove ALL locally-defined entity interfaces and enums that have equivalents in mythos-schemas
   - Import and re-export from `@yoruki-com/libretalk-mythos-schemas`:
     ```typescript
     // Re-export response types from shared schema library
     export type {
       UserResponse,
       CreateUserDto,
       UpdateUserDto,
       UpdateUserLanguagesDto,
       UpdateUserPassionsDto,
       ConversationResponse,
       CreateConversationDto,
       UpdateConversationDto,
       MessageResponse,
       CreateMessageDto,
       PostResponse,
       CreatePostDto,
       UpdatePostDto,
       CommentResponse,
       CommentWithRepliesResponse,
       CreateCommentDto,
       UpdateCommentDto,
       LikeResponse,
       ToggleLikeResponse,
       LikePostDto,
       LikeCommentDto,
       ToggleFollowResponse,
       LanguageResponse,
       CountryResponse,
       PassionResponse,
       PromotionResponse,
       PresignedUrlResponse,
       // Wrapper types
       SuccessPayload,
       PaginatedPayload,
       ListPayload,
       PaginationMeta,
     } from "@yoruki-com/libretalk-mythos-schemas";
     ```
   - Create local aliases for frontend naming conventions:
     ```typescript
     import type { UserResponse, PostResponse, UpdatePostDto, CreatePostDto, PaginatedPayload, SuccessPayload } from "@yoruki-com/libretalk-mythos-schemas";

     // Frontend aliases
     export type User = UserResponse;
     export type UserMe = Required<Pick<UserResponse, "languages" | "passions">> & Omit<UserResponse, "languages" | "passions">;
     export type UserLanguage = NonNullable<UserResponse["languages"]>[number];
     export type Language = LanguageResponse;
     export type Country = CountryResponse;
     export type Passion = PassionResponse;
     export type Conversation = ConversationResponse;
     export type ConversationParticipant = ConversationResponse["participants"][number];
     export type ConversationSpace = NonNullable<ConversationResponse["space"]>;
     export type ConversationLastMessage = NonNullable<ConversationResponse["lastMessage"]>;
     export type Message = MessageResponse;
     export type MessageSender = MessageResponse["sender"];
     export type Like = LikeResponse;
     export type LikeUser = LikeResponse["user"];

     // Enum extractions
     export type PersonalityType = NonNullable<UserResponse["personalityType"]>;
     export type Gender = NonNullable<UserResponse["gender"]>;
     export type LanguageProficiency = NonNullable<UserLanguage["proficiency"]>;
     export type MessageType = MessageResponse["type"];
     export type MessageStatus = MessageResponse["status"];

     // API wrapper aliases (backend canonical names)
     export type ApiResponse<T> = SuccessPayload<T>;
     export type PaginatedResponse<T> = PaginatedPayload<T>;

     // PaginationParams stays local (request-side type, not in shared lib)
     export interface PaginationParams {
       page?: number;
       pageSize?: number;
       sortBy?: string;
       sortOrder?: "asc" | "desc";
       [key: string]: string | number | undefined;
     }
     ```

3. **Update `fe/services/api/vibes.ts`:**
   - Remove local `VibeAuthorLanguage`, `VibeAuthor`, `Vibe`, `CreateVibeDto`, `UpdateVibeDto`, `VibesFilterParams`, `CommentAuthor`, `Comment`, `CommentWithReplies`, `CreateCommentDto`, `UpdateCommentDto` interfaces.
   - Import from `./types` (which re-exports from shared lib): `PostResponse`, `CommentResponse`, `CommentWithRepliesResponse`.
   - Keep `Vibe` as alias: `export type Vibe = PostResponse;`
   - Keep `VibeAuthor = PostResponse["author"];` -- do NOT add `role` field unless grep shows it's actually used. If it IS used somewhere in fe/, add `& { role: string | null }`.
   - Keep `VibesFilterParams` as local (extends PaginationParams with category/search -- this is frontend-only).
   - `CreateVibeDto` = `CreatePostDto`, `UpdateVibeDto` = `UpdatePostDto` from types.
   - Frontend `CreateCommentDto` has extra `authorPublicId` field. Check if any vibes.ts call passes `authorPublicId`. If so, create local extended type: `export interface CreateCommentDtoFe extends CreateCommentDto { authorPublicId: string; }` or keep local. Use judgment.
   - `UpdateCommentDto` = `UpdateCommentDto` from types.

4. **Update `fe/services/api/likes.ts`:**
   - Remove local `LikeUser`, `Like`, `ToggleLikeResponse`, `LikePostDto`, `LikeCommentDto` interfaces.
   - Import from `./types`.
   - Frontend `LikePostDto` has `userPublicId` field that backend `LikePostDto` lacks (backend uses `{ postId }` only). Same for `LikeCommentDto`. Keep local versions with `userPublicId` if the API calls actually pass it, or extend: `export interface LikePostDtoFe extends LikePostDto { userPublicId: string; }`. Check the actual API call shapes.

5. **Update `fe/services/api/follows.ts`:**
   - Remove local `ToggleFollowResponse`.
   - Import from `./types`.

6. **Update `fe/services/api/promotions.ts`:**
   - Remove local `PromotionMeta`.
   - Import `PromotionResponse` from `./types`, create alias `export type PromotionMeta = PromotionResponse;` (or update all references to use `PromotionResponse` directly).

7. **Update `fe/services/api/uploads.ts`:**
   - Remove local `PresignedUrlResponse`.
   - Import from `./types`.
   - Keep `PresignedUrlRequest` local (it's a request-side type for the frontend).

8. **Update `fe/services/api/index.ts`:**
   - Ensure `export type * from "./types"` still works (it should since types.ts re-exports everything).
   - Remove redundant `export type * from "./vibes"`, `export type * from "./likes"`, etc. since types.ts now centralizes re-exports. OR keep them if vibes.ts still exports its own Vibe/VibesFilterParams aliases that consumers use.

9. **Update API service files** (`users.ts`, `conversations.ts`, `countries.ts`, `languages.ts`, `passions.ts`) to ensure their imports from `./types` resolve correctly with the new type names. Most should work unchanged since we created aliases.

10. **Update consumer files** (hooks, components, app pages):
    - Grep for `pagination.totalCount` -> change to `pagination.totalItems`
    - Grep for `pagination.hasPreviousPage` -> change to `pagination.hasPrevPage`
    - All type imports from `@/services/api/types` or `@/services/api` should continue working since we aliased everything.

11. **Verify:** Run TypeScript check from `fe/`: `cd fe && bunx tsc --noEmit` to confirm no type errors.
  </action>
  <verify>
Run `cd c:/Users/Anton/Develop/Personal/how-are-you/fe && bunx tsc --noEmit` -- must pass with 0 errors.
Grep `fe/services/api/types.ts` for `@yoruki-com/libretalk-mythos-schemas` -- must have imports.
Grep `fe/services/api/types.ts` for `interface User {` -- must NOT exist (replaced by type alias).
Grep `fe/services/api/types.ts` for `interface Conversation {` -- must NOT exist.
  </verify>
  <done>
All frontend API service files import response types from @yoruki-com/libretalk-mythos-schemas. No duplicate entity interfaces remain in fe/services/api/types.ts. All consumer files compile without errors. Pagination field names aligned with backend (totalItems, hasPrevPage).
  </done>
</task>

</tasks>

<verification>
1. `cd fe && bunx tsc --noEmit` passes with zero errors
2. `grep -r "interface User {" fe/services/api/` returns no matches (no more local User interface)
3. `grep -r "interface Conversation {" fe/services/api/` returns no matches
4. `grep -r "interface Message {" fe/services/api/` returns no matches
5. `grep -r "@yoruki-com/libretalk-mythos-schemas" fe/services/api/types.ts` returns matches
6. `grep -r "totalCount" fe/` returns no matches (replaced with totalItems)
7. `grep -r "hasPreviousPage" fe/` returns no matches (replaced with hasPrevPage)
</verification>

<success_criteria>
- Zero duplicate entity interfaces in fe/services/api/ that correspond to mythos-schemas exports
- All frontend type imports resolve to the shared @yoruki-com/libretalk-mythos-schemas package
- TypeScript compilation passes in the frontend workspace
- Pagination field names use backend canonical names (totalItems, hasPrevPage)
- All existing consumer files (hooks, components, pages) work unchanged via type aliases
</success_criteria>

<output>
After completion, create `.planning/quick/5-replace-frontend-api-response-payload-in/5-SUMMARY.md`
</output>
