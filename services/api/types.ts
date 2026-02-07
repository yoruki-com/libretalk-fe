// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

// User Types
export type PersonalityType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export interface User {
  publicId: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  personalityType: PersonalityType | null;
  jobTitle: string | null;
  country: {
    publicId: string;
    code: string;
    name: string;
  } | null;
  city: string | null;
  timezone: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
  isProfilePublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  personalityType?: PersonalityType;
  jobTitle?: string;
  countryId?: string;
  city?: string;
  timezone?: string;
  isProfilePublic?: boolean;
}

export interface UpdateUserDto {
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  personalityType?: PersonalityType | null;
  jobTitle?: string | null;
  countryId?: string | null;
  city?: string | null;
  timezone?: string | null;
  isProfilePublic?: boolean;
}

// User Language Types
export type LanguageProficiency = "NATIVE" | "FLUENT" | "ADVANCED" | "INTERMEDIATE" | "BEGINNER";

export interface UserLanguage {
  code: string;
  name: string;
  nativeName: string;
  proficiency: LanguageProficiency;
  isLearning: boolean;
}

export interface UserMe extends User {
  languages: UserLanguage[];
}

// Conversation Types
export interface ConversationParticipant {
  publicId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  joinedAt: string;
  lastReadAt: string | null;
  isMuted: boolean;
  isPinned: boolean;
}

export interface ConversationSpace {
  publicId: string;
  name: string;
  slug: string;
}

export interface Conversation {
  publicId: string;
  name: string | null;
  avatarUrl: string | null;
  isGroup: boolean;
  space: ConversationSpace | null;
  participants: ConversationParticipant[];
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationDto {
  name?: string;
  avatarUrl?: string;
  isGroup?: boolean;
  spaceId?: string;
  participantIds: string[];
}

export interface UpdateConversationDto {
  name?: string | null;
  avatarUrl?: string | null;
}

// Message Types
export type MessageType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "FILE" | "SYSTEM";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface MessageSender {
  publicId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Message {
  publicId: string;
  type: MessageType;
  content: string | null;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  status: MessageStatus;
  isEdited: boolean;
  editedAt: string | null;
  sender: MessageSender;
  replyTo: {
    publicId: string;
    content: string | null;
  } | null;
  createdAt: string;
}

export interface CreateMessageDto {
  type?: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  replyToId?: string;
}

// Extended conversation with last message for chat list
export interface ConversationWithLastMessage extends Conversation {
  lastMessage?: Message;
  unreadCount?: number;
}
