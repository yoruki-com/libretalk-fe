import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  User,
  UserMe,
  CreateUserDto,
  UpdateUserDto,
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

  // Get active users
  async getActive(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return apiClient.get("/users/active", params);
  },

  // Get online users
  async getOnline(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return apiClient.get("/users/online", params);
  },

  // Get user by ID
  async getById(publicId: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/users/${publicId}`);
  },

  // Get user by username
  async getByUsername(username: string): Promise<ApiResponse<User>> {
    return apiClient.get(`/users/username/${username}`);
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

  // Delete a user
  async delete(publicId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete(`/users/${publicId}`);
  },
};
