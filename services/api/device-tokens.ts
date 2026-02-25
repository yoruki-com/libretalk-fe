import { apiClient } from "./client";
import type { ApiResponse } from "./types";

export interface DeviceTokenResponse {
  publicId: string;
  token: string;
  platform: string | null;
  isActive: boolean;
  createdAt: string;
}

export const deviceTokensApi = {
  async register(
    data: { token: string; platform?: string }
  ): Promise<ApiResponse<DeviceTokenResponse>> {
    return apiClient.post("/device-tokens", data);
  },

  async reportPushDenied(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post("/device-tokens/push-denied", {});
  },
};
