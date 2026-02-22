import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "./types";
import type {
  PostResponse,
  CommentResponse,
  CommentWithRepliesResponse,
  CreatePostDto,
  UpdatePostDto,
  UpdateCommentDto,
} from "./types";

// Frontend aliases for post/vibe types
export type Vibe = PostResponse;
export type VibeAuthor = PostResponse["author"];
export type VibeAuthorLanguage = PostResponse["author"]["languages"][number];

export type CreateVibeDto = CreatePostDto;
export type UpdateVibeDto = UpdatePostDto;

export type CommentAuthor = CommentResponse["author"];
export type Comment = CommentResponse;
export type CommentWithReplies = CommentWithRepliesResponse;

// Frontend CreateCommentDto includes authorPublicId (not in backend schema)
export interface CreateCommentDto {
  postId: string;
  content: string;
  parentId?: string;
  authorPublicId: string;
}

export interface VibesFilterParams extends PaginationParams {
  category?: string;
  search?: string;
}

export const vibesApi = {
  // Get all posts (feed)
  async getAll(params?: VibesFilterParams): Promise<PaginatedResponse<Vibe>> {
    return apiClient.get("/posts", params);
  },

  // Get posts from followed users
  async getFollowingFeed(params?: PaginationParams): Promise<PaginatedResponse<Vibe>> {
    return apiClient.get("/posts/following", params);
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

  // Get nearby posts (backend reads lat/lng from authenticated user's stored profile)
  async getNearby(params?: PaginationParams): Promise<PaginatedResponse<Vibe>> {
    return apiClient.get("/posts/nearby", params);
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
