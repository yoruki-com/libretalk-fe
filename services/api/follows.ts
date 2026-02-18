import { apiClient } from "./client";
import type { ApiResponse, ToggleFollowResponse } from "./types";

export const followsApi = {
  async toggleFollow(
    userPublicId: string,
    followerPublicId: string
  ): Promise<ApiResponse<ToggleFollowResponse>> {
    return apiClient.post(`/follows/users/${userPublicId}/toggle`, {
      followerPublicId,
    });
  },
};
