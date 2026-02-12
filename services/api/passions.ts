import { apiClient } from "./client";
import type { ApiResponse, Passion } from "./types";

export const passionsApi = {
  async getActive(): Promise<ApiResponse<Passion[]>> {
    return apiClient.get("/passions/active");
  },
};
