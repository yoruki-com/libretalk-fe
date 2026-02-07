import { API_URL } from "./config";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "./types";

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(401, "Unauthorized - Please sign in again");
    }
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorData?.message || response.statusText,
      errorData
    );
  }
  return response.json();
}

function buildQueryString(
  params?: PaginationParams & Record<string, unknown>
): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const apiClient = {
  async get<T>(
    endpoint: string,
    params?: PaginationParams & Record<string, unknown>
  ): Promise<T> {
    const url = `${API_URL}${endpoint}${buildQueryString(params)}`;
    const headers = await getAuthHeaders();

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },
};

export { ApiError };
