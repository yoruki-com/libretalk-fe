import { useSyncExternalStore, useCallback } from "react";
import { usersApi } from "@/services/api/users";
import type { UserMe } from "@/services/api/types";

/* ── Shared store (module-level singleton) ─────────────── */

let profile: UserMe | null = null;
let isLoading = false;
let error: Error | null = null;
let fetchPromise: Promise<void> | null = null;

const subscribers = new Set<() => void>();

function emitChange() {
  subscribers.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  subscribers.add(cb);
  return () => { subscribers.delete(cb); };
}

function getSnapshot() {
  return profile;
}

async function fetchProfile() {
  // Deduplicate concurrent calls
  if (fetchPromise) return fetchPromise;

  isLoading = true;
  emitChange();

  fetchPromise = (async () => {
    try {
      const response = await usersApi.getMe();
      profile = response.data;
      error = null;
    } catch (err) {
      error = err instanceof Error ? err : new Error("Failed to fetch profile");
    } finally {
      isLoading = false;
      fetchPromise = null;
      emitChange();
    }
  })();

  return fetchPromise;
}

/** Call this on logout to reset the cache. */
export function resetCurrentUserCache() {
  profile = null;
  error = null;
  isLoading = false;
  fetchPromise = null;
  emitChange();
}

/* ── Hook ──────────────────────────────────────────────── */

interface UseCurrentUserResult {
  profile: UserMe | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCurrentUser(enabled = true): UseCurrentUserResult {
  // Re-render whenever the shared store changes
  const currentProfile = useSyncExternalStore(subscribe, getSnapshot);

  // Trigger initial fetch (only once across all instances)
  if (enabled && !currentProfile && !isLoading && !fetchPromise) {
    fetchProfile();
  }

  const refresh = useCallback(async () => {
    await fetchProfile();
  }, []);

  return {
    profile: currentProfile,
    isLoading,
    error,
    refresh,
  };
}
