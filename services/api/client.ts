import axios from "axios";
import { API_URL } from "./config";
import type { PaginationParams } from "./types";

class ApiError extends Error {
  /** Status codes whose backend message is safe to show to the user. */
  private static readonly USER_FACING_STATUSES = new Set([400, 403, 404, 409, 422]);

  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUserFacing(): boolean {
    return ApiError.USER_FACING_STATUSES.has(this.status);
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

// Auth claims (email, name) — set by AuthContext after getIdTokenClaims().
// Included as headers so the backend can provision new users without
// needing to call the OIDC userinfo endpoint itself.
let authClaims: { email?: string; name?: string } | null = null;

export function setAuthClaims(claims: { email?: string; name?: string }) {
  authClaims = claims;
}

export function clearAuthClaims() {
  authClaims = null;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (tokenGetter) {
    try {
      // Timeout the token getter itself — if the Logto SDK hangs (e.g. during
      // token refresh), the axios timeout won't help because it only starts
      // after the request is sent.
      const token = await Promise.race([
        tokenGetter(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("tokenGetter timed out after 10s")), 10_000)
        ),
      ]);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("[API Client] Error getting auth token:", error);
    }
  }

  // Include OIDC claims the backend can't extract from resource-scoped JWTs
  if (authClaims?.email) headers["X-Auth-Email"] = authClaims.email;
  if (authClaims?.name) headers["X-Auth-Name"] = encodeURIComponent(authClaims.name);

  return headers;
}

function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    const message = data?.error?.message || data?.message || error.message;
    if (status === 401) {
      throw new ApiError(401, message || "Unauthorized - Please sign in again", data);
    }
    throw new ApiError(status, message, data);
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
        timeout: 15000,
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
