import { apiClient } from "./client";
import type { ApiResponse, PresignedUrlResponse } from "./types";

// Frontend-only request type (kept local for convenience)
export interface PresignedUrlRequest {
  folder: "avatars";
  contentType: "image/webp" | "image/jpeg" | "image/png";
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
    // Use fetch for both read and upload — axios uses XMLHttpRequest which
    // crashes on Android local file:// URIs and mishandles Blob bodies
    const fileResponse = await fetch(fileUri);
    const blob = await fileResponse.blob();

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status}`);
    }
  },
};
