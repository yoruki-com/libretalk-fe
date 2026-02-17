import axios from "axios";
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
    // Read the file as a blob from the local URI
    const fileResponse = await axios.get(fileUri, { responseType: "blob" });

    // Upload to S3
    await axios.put(presignedUrl, fileResponse.data, {
      headers: { "Content-Type": contentType },
    });
  },
};
