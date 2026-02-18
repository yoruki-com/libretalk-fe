import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Like,
  ToggleLikeResponse,
} from "./types";

// Frontend-specific DTOs (include userPublicId not in backend schemas)
export interface LikePostDto {
  postId: string;
  userPublicId: string;
}

export interface LikeCommentDto {
  commentId: string;
  userPublicId: string;
}

export const likesApi = {
  // ==================== POST LIKES ====================

  // Get likes for a post
  async getLikesByPost(
    postPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Like>> {
    return apiClient.get(`/likes/posts/${postPublicId}`, params);
  },

  // Check if user has liked a post
  async checkPostLike(
    postPublicId: string,
    userPublicId: string
  ): Promise<ApiResponse<{ liked: boolean }>> {
    return apiClient.get(`/likes/posts/${postPublicId}/check`, { userPublicId });
  },

  // Like a post
  async likePost(data: LikePostDto): Promise<ApiResponse<Like>> {
    return apiClient.post("/likes/posts", data);
  },

  // Unlike a post
  async unlikePost(
    postPublicId: string,
    userPublicId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete(`/likes/posts/${postPublicId}`, { userPublicId });
  },

  // Toggle like on a post (like if not liked, unlike if liked)
  async togglePostLike(
    postPublicId: string,
    userPublicId: string
  ): Promise<ApiResponse<ToggleLikeResponse>> {
    return apiClient.post(`/likes/posts/${postPublicId}/toggle`, { userPublicId });
  },

  // ==================== COMMENT LIKES ====================

  // Get likes for a comment
  async getLikesByComment(
    commentPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Like>> {
    return apiClient.get(`/likes/comments/${commentPublicId}`, params);
  },

  // Check if user has liked a comment
  async checkCommentLike(
    commentPublicId: string,
    userPublicId: string
  ): Promise<ApiResponse<{ liked: boolean }>> {
    return apiClient.get(`/likes/comments/${commentPublicId}/check`, { userPublicId });
  },

  // Like a comment
  async likeComment(data: LikeCommentDto): Promise<ApiResponse<Like>> {
    return apiClient.post("/likes/comments", data);
  },

  // Unlike a comment
  async unlikeComment(
    commentPublicId: string,
    userPublicId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete(`/likes/comments/${commentPublicId}`, { userPublicId });
  },

  // Toggle like on a comment
  async toggleCommentLike(
    commentPublicId: string,
    userPublicId: string
  ): Promise<ApiResponse<ToggleLikeResponse>> {
    return apiClient.post(`/likes/comments/${commentPublicId}/toggle`, { userPublicId });
  },

  // ==================== USER LIKES ====================

  // Get all likes by a user
  async getLikesByUser(
    userPublicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Like>> {
    return apiClient.get(`/likes/users/${userPublicId}`, params);
  },
};
