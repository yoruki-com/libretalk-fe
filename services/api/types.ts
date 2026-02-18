// ============================================================
// Shared types from @yoruki-com/libretalk-mythos-schemas
// Single source of truth for API response/request types
// ============================================================

import type {
  UserResponse,
  PostResponse,
  MessageResponse,
  ConversationResponse,
  SuccessPayload,
  PaginatedPayload,
  PaginationMeta,
} from "@yoruki-com/libretalk-mythos-schemas";

// Re-export response types from shared schema library
export type {
  // User
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserLanguagesDto,
  UpdateUserPassionsDto,
  // Conversation
  ConversationResponse,
  CreateConversationDto,
  UpdateConversationDto,
  MessageResponse,
  CreateMessageDto,
  // Post
  PostResponse,
  CreatePostDto,
  UpdatePostDto,
  // Comment
  CommentResponse,
  CommentWithRepliesResponse,
  UpdateCommentDto,
  // Like
  LikeResponse,
  ToggleLikeResponse,
  // Follow
  ToggleFollowResponse,
  // Reference data
  LanguageResponse,
  CountryResponse,
  PassionResponse,
  // Promotion
  PromotionResponse,
  // Upload
  PresignedUrlResponse,
  // Wrapper types
  SuccessPayload,
  PaginatedPayload,
  ListPayload,
  PaginationMeta,
} from "@yoruki-com/libretalk-mythos-schemas";

// ============================================================
// Frontend type aliases (preserve existing names used throughout app)
// ============================================================

/** User profile (basic) */
export type User = UserResponse;

/** Current user profile with languages and passions always present */
export type UserMe = Required<Pick<UserResponse, "languages" | "passions">> &
  Omit<UserResponse, "languages" | "passions">;

/** User language entry */
export type UserLanguage = NonNullable<UserResponse["languages"]>[number];

/** Language reference */
export type Language = import("@yoruki-com/libretalk-mythos-schemas").LanguageResponse;

/** Country reference */
export type Country = import("@yoruki-com/libretalk-mythos-schemas").CountryResponse;

/** Passion reference */
export type Passion = import("@yoruki-com/libretalk-mythos-schemas").PassionResponse;

/** Conversation */
export type Conversation = ConversationResponse;

/** Conversation participant */
export type ConversationParticipant = ConversationResponse["participants"][number];

/** Conversation space */
export type ConversationSpace = NonNullable<ConversationResponse["space"]>;

/** Conversation last message */
export type ConversationLastMessage = NonNullable<ConversationResponse["lastMessage"]>;

/** Chat message */
export type Message = MessageResponse;

/** Message sender */
export type MessageSender = MessageResponse["sender"];

/** Like */
export type Like = import("@yoruki-com/libretalk-mythos-schemas").LikeResponse;

/** Like user */
export type LikeUser = import("@yoruki-com/libretalk-mythos-schemas").LikeResponse["user"];

/** Promotion metadata */
export type PromotionMeta = import("@yoruki-com/libretalk-mythos-schemas").PromotionResponse;

// ============================================================
// Enum-like type extractions
// ============================================================

export type PersonalityType = NonNullable<UserResponse["personalityType"]>;
export type Gender = NonNullable<UserResponse["gender"]>;
export type LanguageProficiency = NonNullable<UserLanguage["proficiency"]>;
export type MessageType = MessageResponse["type"];
export type MessageStatus = MessageResponse["status"];

// ============================================================
// API wrapper aliases (map frontend names to backend canonical names)
// ============================================================

/** Standard success response: { success: true, data: T } */
export type ApiResponse<T> = SuccessPayload<T>;

/** Paginated response: { success: true, data: T[], pagination: PaginationMeta } */
export type PaginatedResponse<T> = PaginatedPayload<T>;

// ============================================================
// Frontend-only types (not in shared lib)
// ============================================================

/** Pagination query params (request-side, not a response type) */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

/** Avatar response from GET /users/:publicId/avatar */
export interface AvatarResponse {
  avatarUrl: string;
}
