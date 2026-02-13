import { apiClient } from "./client";
import type { ApiResponse, Country } from "./types";

export const countriesApi = {
  async getActive(): Promise<ApiResponse<Country[]>> {
    return apiClient.get("/countries/active");
  },
};
