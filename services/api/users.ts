import { apiClient } from "./client";
import type {
  ApiResponse,
  AvatarResponse,
  PaginatedResponse,
  PaginationParams,
  User,
  UserMe,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserLanguagesDto,
  UpdateUserPassionsDto,
} from "./types";

export const usersApi = {
  // Get current authenticated user profile
  async getMe(): Promise<ApiResponse<UserMe>> {
    return apiClient.get("/users/me");
  },

  // Get all users (paginated)
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return apiClient.get("/users", params);
  },

  // Get active users (with languages) — paginated
  async getActive(params?: PaginationParams): Promise<PaginatedResponse<UserMe>> {
    return apiClient.get("/users/active", params);
  },

  // Get online users (with languages) — paginated
  async getOnline(params?: PaginationParams): Promise<PaginatedResponse<UserMe>> {
    return apiClient.get("/users/online", params);
  },

  // Get user by ID
  async getById(publicId: string, viewerPublicId?: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/users/${publicId}`, viewerPublicId ? { viewerPublicId } : undefined);
  },

  // Get user by username
  async getByUsername(username: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/users/username/${username}`);
  },

  // Get user avatar (signed CloudFront URL)
  async getAvatar(publicId: string): Promise<ApiResponse<AvatarResponse>> {
    return apiClient.get(`/users/${publicId}/avatar`);
  },

  // Create a new user
  async create(data: CreateUserDto): Promise<ApiResponse<User>> {
    return apiClient.post("/users", data);
  },

  // Update a user
  async update(publicId: string, data: UpdateUserDto): Promise<ApiResponse<User>> {
    return apiClient.patch(`/users/${publicId}`, data);
  },

  // Update online status
  async setOnlineStatus(
    publicId: string,
    isOnline: boolean
  ): Promise<ApiResponse<User>> {
    return apiClient.patch(`/users/${publicId}/online-status`, { isOnline });
  },

  // Update last seen
  async updateLastSeen(publicId: string): Promise<ApiResponse<User>> {
    return apiClient.post(`/users/${publicId}/last-seen`);
  },

  // Update current user's profile
  async updateMe(data: UpdateUserDto): Promise<ApiResponse<UserMe>> {
    return apiClient.patch("/users/me", data);
  },

  // Update current user's languages
  async updateMyLanguages(data: UpdateUserLanguagesDto): Promise<ApiResponse<UserMe>> {
    return apiClient.put("/users/me/languages", data);
  },

  // Update current user's passions
  async updateMyPassions(data: UpdateUserPassionsDto): Promise<ApiResponse<UserMe>> {
    return apiClient.put("/users/me/passions", data);
  },

  // Delete a user
  async delete(publicId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete(`/users/${publicId}`);
  },
};
