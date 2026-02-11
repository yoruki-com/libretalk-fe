import { apiClient } from "./client";
import type { ApiResponse } from "./types";

export interface ToggleFollowResponse {
  following: boolean;
  followersCount: number;
  followingCount: number;
}

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
