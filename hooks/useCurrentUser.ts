import { useState, useEffect, useCallback } from "react";
import { usersApi } from "@/services/api/users";
import type { UserMe } from "@/services/api/types";

interface UseCurrentUserResult {
  profile: UserMe | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCurrentUser(enabled = true): UseCurrentUserResult {
  const [profile, setProfile] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getMe();
      setProfile(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch profile"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchProfile();
    }
  }, [enabled, fetchProfile]);

  return { profile, isLoading, error, refresh: fetchProfile };
}
