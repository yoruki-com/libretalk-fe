import { apiClient } from "./client";
import type { ApiResponse, Language } from "./types";

export const languagesApi = {
  async getActive(): Promise<ApiResponse<Language[]>> {
    return apiClient.get("/languages/active");
  },
};
