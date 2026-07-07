import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// Hardcoded report reason type (avoid importing Zod-inferred types from shared schemas)
export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "INAPPROPRIATE_CONTENT"
  | "FAKE_PROFILE"
  | "OTHER";

export const ReportReasonValues: ReportReason[] = [
  "SPAM",
  "HARASSMENT",
  "INAPPROPRIATE_CONTENT",
  "FAKE_PROFILE",
  "OTHER",
];

interface ReportPostDto {
  reason: ReportReason;
  postId: string;
  description?: string;
}

interface ReportCommentDto {
  reason: ReportReason;
  commentId: string;
  description?: string;
}

interface ReportUserDto {
  reason: ReportReason;
  userId: string;
  description?: string;
}

export const reportsApi = {
  async reportPost(data: ReportPostDto): Promise<ApiResponse<unknown>> {
    return apiClient.post("/reports/posts", data);
  },

  async reportComment(data: ReportCommentDto): Promise<ApiResponse<unknown>> {
    return apiClient.post("/reports/comments", data);
  },

  async reportUser(data: ReportUserDto): Promise<ApiResponse<unknown>> {
    return apiClient.post("/reports/users", data);
  },
};
