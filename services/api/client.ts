import axios from "axios";
import { API_URL } from "./config";
import type { PaginationParams } from "./types";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Token getter - set by AuthContext
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

export function clearTokenGetter() {
  tokenGetter = null;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("[API Client] Error getting auth token:", error);
    }
  }

  return headers;
}

function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    if (status === 401) {
      throw new ApiError(401, data?.message || "Unauthorized - Please sign in again", data);
    }
    throw new ApiError(status, data?.message || error.message, data);
  }
  throw error;
}

export const apiClient = {
  async get<T>(
    endpoint: string,
    params?: PaginationParams & Record<string, unknown>
  ): Promise<T> {
    const headers = await getAuthHeaders();

    try {
      const response = await axios.get<T>(`${API_URL}${endpoint}`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await getAuthHeaders();

    try {
      const response = await axios.post<T>(`${API_URL}${endpoint}`, data, {
        headers,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const headers = await getAuthHeaders();

    try {
      const response = await axios.put<T>(`${API_URL}${endpoint}`, data, {
        headers,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const headers = await getAuthHeaders();

    try {
      const response = await axios.patch<T>(`${API_URL}${endpoint}`, data, {
        headers,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  },

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await getAuthHeaders();

    try {
      const response = await axios.delete<T>(`${API_URL}${endpoint}`, {
        headers,
        data,
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  },
};

export { ApiError };
