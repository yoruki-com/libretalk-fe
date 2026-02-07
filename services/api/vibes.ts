import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "./types";

// Vibe/Post Types
export interface VibeAuthorLanguage {
  code: string;
  proficiency: string;
  isLearning: boolean;
}

export interface VibeAuthor {
  publicId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  languages: VibeAuthorLanguage[];
  role: string | null;
}

export interface Vibe {
  publicId: string;
  title: string;
  content: string | null;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  mention: string | null;
  category: string | null;
  author: VibeAuthor;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVibeDto {
  title: string;
  content?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  mention?: string;
  category?: string;
}

export interface UpdateVibeDto {
  title?: string;
  content?: string | null;
  mediaUrl?: string | null;
  mention?: string | null;
  category?: string | null;
}

export interface VibesFilterParams extends PaginationParams {
  category?: string;
  search?: string;
}

// Comment Types
export interface CommentAuthor {
  publicId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Comment {
  publicId: string;
  content: string;
  author: CommentAuthor;
  likesCount: number;
  isLiked: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export interface CreateCommentDto {
  postId: string;
  content: string;
  parentId?: string;
  authorPublicId: string;
}

export interface UpdateCommentDto {
  content: string;
}

export const vibesApi = {
  // Get all posts (feed)
  async getAll(params?: VibesFilterParams): Promise<PaginatedResponse<Vibe>> {
    return apiClient.get("/posts", params);
  },

  // Get posts by category
  async getByCategory(
    category: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Vibe>> {
    return apiClient.get("/posts", { ...params, category });
  },

  // Get a single post by ID
  async getById(publicId: string): Promise<ApiResponse<Vibe>> {
    return apiClient.get(`/posts/${publicId}`);
  },

  // Get posts by author
  async getByUser(
    authorPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Vibe>> {
    return apiClient.get(`/posts/author/${authorPublicId}`, params);
  },

  // Create a new post
  async create(data: CreateVibeDto): Promise<ApiResponse<Vibe>> {
    return apiClient.post("/posts", data);
  },

  // Update a post
  async update(publicId: string, data: UpdateVibeDto): Promise<ApiResponse<Vibe>> {
    return apiClient.patch(`/posts/${publicId}`, data);
  },

  // Delete a post
  async delete(publicId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete(`/posts/${publicId}`);
  },


};

// Comments API - now a separate module at /comments
export const commentsApi = {
  // Get top-level comments for a post
  async getByPost(
    postPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Comment>> {
    return apiClient.get(`/comments/post/${postPublicId}`, params);
  },

  // Get comments with nested replies for a post
  async getByPostThreaded(
    postPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<CommentWithReplies>> {
    return apiClient.get(`/comments/post/${postPublicId}/threaded`, params);
  },

  // Get comments by author
  async getByAuthor(
    authorPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Comment>> {
    return apiClient.get(`/comments/author/${authorPublicId}`, params);
  },

  // Get a single comment by ID
  async getById(publicId: string): Promise<ApiResponse<Comment>> {
    return apiClient.get(`/comments/${publicId}`);
  },

  // Get a comment with its replies
  async getByIdThreaded(publicId: string): Promise<ApiResponse<CommentWithReplies>> {
    return apiClient.get(`/comments/${publicId}/threaded`);
  },

  // Get replies to a comment
  async getReplies(
    publicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Comment>> {
    return apiClient.get(`/comments/${publicId}/replies`, params);
  },

  // Create a new comment
  async create(data: CreateCommentDto): Promise<ApiResponse<Comment>> {
    return apiClient.post("/comments", data);
  },

  // Update a comment
  async update(
    publicId: string,
    data: UpdateCommentDto
  ): Promise<ApiResponse<Comment>> {
    return apiClient.patch(`/comments/${publicId}`, data);
  },

  // Delete a comment
  async delete(publicId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/comments/${publicId}`);
  },
};
