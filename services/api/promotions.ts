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
    const response = await fetch(`${API_URL}/promotions/active`);
    if (!response.ok) {
      throw new Error("Failed to fetch active promotions");
    }
    const data = await response.json();
    return data.data;
  },

  async getContent(slug: string): Promise<string> {
    const response = await fetch(`${API_URL}/promotions/${slug}/content`);
    if (!response.ok) {
      throw new Error(`Failed to fetch promotion content for "${slug}"`);
    }
    return response.text();
  },
};
