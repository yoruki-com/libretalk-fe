import axios from "axios";
import { API_URL } from "./config";

export interface PromotionMeta {
  publicId: string;
  slug: string;
  title: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  metadata: Record<string, unknown> | null;
}

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
