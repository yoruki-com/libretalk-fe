import axios from "axios";
import { API_URL } from "./config";
import type { PromotionMeta } from "./types";

export const promotionsApi = {
  async getActive(): Promise<PromotionMeta[]> {
    try {
      const response = await axios.get(`${API_URL}/promotions/active`);
      return response.data.data;
    } catch {
      throw new Error("Failed to fetch active promotions");
    }
  },

  async getContent(slug: string): Promise<string> {
    try {
      const response = await axios.get<string>(
        `${API_URL}/promotions/${slug}/content`,
        { responseType: "text" }
      );
      return response.data;
    } catch {
      throw new Error(`Failed to fetch promotion content for "${slug}"`);
    }
  },
};
