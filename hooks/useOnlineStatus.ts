import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usersApi } from "@/services/api";

/**
 * Side-effect hook that reports the user's online/offline status
 * to the backend based on React Native AppState changes.
 *
 * - Sends `isOnline: true` when the app is foregrounded (active).
 * - Sends `isOnline: false` when the app is backgrounded or inactive.
 * - Does nothing when the user is not authenticated or has no profile.
 * - All API calls are fire-and-forget to avoid blocking the UI.
 */
export function useOnlineStatus(): void {
  const { isAuthenticated, hasAccessToken } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated && hasAccessToken);

  const publicIdRef = useRef<string | undefined>(profile?.publicId);

  // Keep ref in sync so the AppState listener always has the latest value.
  publicIdRef.current = profile?.publicId;

  useEffect(() => {
    const publicId = profile?.publicId;
    if (!isAuthenticated || !hasAccessToken || !publicId) return;

    // Mark online immediately on mount.
    usersApi.setOnlineStatus(publicId, true).catch(() => {});

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const id = publicIdRef.current;
      if (!id) return;

      if (nextAppState === "active") {
        usersApi.setOnlineStatus(id, true).catch(() => {});
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        usersApi.setOnlineStatus(id, false).catch(() => {});
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
      // Best-effort offline signal on cleanup (sign-out / unmount).
      usersApi.setOnlineStatus(publicId, false).catch(() => {});
    };
  }, [isAuthenticated, hasAccessToken, profile?.publicId]);
}
