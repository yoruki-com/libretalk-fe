import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "./types";

// Vibe/Post Types
export interface VibeAuthor {
  publicId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
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

export interface VibeCategory {
  id: string;
  emoji: string;
  label: string;
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

  // Get posts by user
  async getByUser(
    userPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Vibe>> {
    return apiClient.get(`/posts/user/${userPublicId}`, params);
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

  // Like a post
  async like(publicId: string): Promise<ApiResponse<{ liked: boolean }>> {
    return apiClient.post(`/posts/${publicId}/like`);
  },

  // Unlike a post
  async unlike(publicId: string): Promise<ApiResponse<{ unliked: boolean }>> {
    return apiClient.delete(`/posts/${publicId}/like`);
  },

  // Get categories
  async getCategories(): Promise<ApiResponse<VibeCategory[]>> {
    return apiClient.get("/posts/categories");
  },
};
