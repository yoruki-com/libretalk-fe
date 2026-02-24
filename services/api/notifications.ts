import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "./types";

export interface NotificationResponse {
  publicId: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  readAt: string | null;
  groupKey: string | null;
  actorCount: number;
  actorSummary: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export const notificationsApi = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<NotificationResponse>> {
    return apiClient.get("/notifications", params);
  },

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get("/notifications/unread-count");
  },

  async markAsRead(publicId: string): Promise<ApiResponse<{ publicId: string; isRead: true }>> {
    return apiClient.patch(`/notifications/${publicId}/read`, {});
  },

  async markAllAsRead(): Promise<ApiResponse<{ markedCount: number }>> {
    return apiClient.patch("/notifications/read-all", {});
  },
};
