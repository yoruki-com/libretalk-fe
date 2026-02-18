import { useState, useEffect, useCallback } from "react";
import { usersApi, ApiError } from "@/services/api";

interface UseAvatarResult {
  avatarUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a signed CloudFront avatar URL for a given user.
 * Returns null avatarUrl if the user has no avatar (404) or on error.
 * Pass `enabled: false` to skip fetching (e.g., when publicId is not yet known).
 */
export function useAvatar(
  publicId: string | null | undefined,
  options?: { enabled?: boolean }
): UseAvatarResult {
  const enabled = options?.enabled ?? true;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!publicId || !enabled) {
      setAvatarUrl(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    usersApi
      .getAvatar(publicId)
      .then((response) => {
        if (!cancelled) {
          setAvatarUrl(response.data.avatarUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          // 404 means no avatar — not an error, just null
          if (err instanceof ApiError && err.status === 404) {
            setAvatarUrl(null);
          } else {
            setError(err instanceof Error ? err.message : "Failed to load avatar");
            setAvatarUrl(null);
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicId, enabled, refreshKey]);

  return { avatarUrl, isLoading, error, refetch };
}
