import { apiClient } from "./client";
import type { ApiResponse } from "./types";

export interface PresignedUrlRequest {
  folder: "avatars";
  contentType: "image/webp" | "image/jpeg" | "image/png";
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export const uploadsApi = {
  async getPresignedUrl(
    data: PresignedUrlRequest
  ): Promise<ApiResponse<PresignedUrlResponse>> {
    return apiClient.post("/uploads/presigned-url", data);
  },

  async uploadToS3(
    presignedUrl: string,
    fileUri: string,
    contentType: string
  ): Promise<void> {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed with status ${uploadResponse.status}`);
    }
  },
};
