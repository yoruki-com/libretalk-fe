import { useState, useCallback, useEffect } from "react";
import {
  notificationPreferencesApi,
  type NotificationPreferencesResponse,
} from "@/services/api";

interface UseNotificationPreferencesResult {
  preferences: NotificationPreferencesResponse | null;
  isLoading: boolean;
  error: Error | null;
  updatePreference: (
    key: keyof NotificationPreferencesResponse,
    value: boolean
  ) => Promise<void>;
}

export function useNotificationPreferences(): UseNotificationPreferencesResult {
  const [preferences, setPreferences] =
    useState<NotificationPreferencesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationPreferencesApi.get();
      setPreferences(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch preferences")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = useCallback(
    async (key: keyof NotificationPreferencesResponse, value: boolean) => {
      if (!preferences) return;

      // Optimistic update
      const previousPreferences = { ...preferences };
      setPreferences({ ...preferences, [key]: value });

      try {
        const response = await notificationPreferencesApi.update({
          [key]: value,
        });
        setPreferences(response.data);
      } catch (err) {
        // Revert on error
        setPreferences(previousPreferences);
        console.warn("[useNotificationPreferences] Update failed:", err);
      }
    },
    [preferences]
  );

  return { preferences, isLoading, error, updatePreference };
}
