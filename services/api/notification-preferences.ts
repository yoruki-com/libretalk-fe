import { apiClient } from "./client";
import type { ApiResponse } from "./types";

export interface NotificationPreferencesResponse {
  pushLikes: boolean;
  pushComments: boolean;
  pushNewVibes: boolean;
  pushChat: boolean;
  pushFollowers: boolean;
}

export const notificationPreferencesApi = {
  async get(): Promise<ApiResponse<NotificationPreferencesResponse>> {
    return apiClient.get("/notification-preferences");
  },

  async update(
    data: Partial<NotificationPreferencesResponse>
  ): Promise<ApiResponse<NotificationPreferencesResponse>> {
    return apiClient.put("/notification-preferences", data);
  },
};
