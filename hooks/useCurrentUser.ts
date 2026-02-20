import { useSyncExternalStore, useCallback, useEffect } from "react";
import { usersApi } from "@/services/api/users";
import type { UserMe } from "@/services/api/types";
import { dbg } from "@/utils/debugLog";

/* ── Shared store (module-level singleton) ─────────────── */

let profile: UserMe | null = null;
let isLoading = false;
let error: Error | null = null;
let fetchPromise: Promise<void> | null = null;

// Version counter so useSyncExternalStore detects ALL state changes
// (profile, isLoading, error), not just profile changes.
let storeVersion = 0;

const subscribers = new Set<() => void>();

function emitChange() {
  storeVersion++;
  subscribers.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  subscribers.add(cb);
  return () => { subscribers.delete(cb); };
}

function getSnapshot() {
  return storeVersion;
}

async function fetchProfile() {
  // Deduplicate concurrent calls
  if (fetchPromise) {
    dbg("[useCurrentUser] fetchProfile: already in progress, deduplicating");
    return fetchPromise;
  }

  dbg("[useCurrentUser] fetchProfile: START");
  isLoading = true;
  emitChange();

  fetchPromise = (async () => {
    try {
      dbg("[useCurrentUser] fetchProfile: calling usersApi.getMe()…");
      const response = await usersApi.getMe();
      dbg("[useCurrentUser] fetchProfile: SUCCESS — got profile");
      profile = response.data;
      error = null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      dbg("[useCurrentUser] fetchProfile: ERROR — " + msg);
      error = err instanceof Error ? err : new Error("Failed to fetch profile");
    } finally {
      dbg("[useCurrentUser] fetchProfile: DONE (error=" + (error ? error.message : "none") + ")");
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
  // Re-render whenever ANY store value changes (profile, isLoading, error)
  useSyncExternalStore(subscribe, getSnapshot);

  // Trigger initial fetch in an effect (not during render) to avoid
  // "Cannot update a component while rendering a different component".
  // Don't retry automatically on error — callers should use refresh().
  useEffect(() => {
    if (enabled && !profile && !isLoading && !fetchPromise && !error) {
      fetchProfile();
    }
  }, [enabled]);

  const refresh = useCallback(async () => {
    // Clear previous error so a new fetch can proceed
    error = null;
    await fetchProfile();
  }, []);

  // Report as loading when a fetch is clearly needed but the useEffect
  // hasn't fired yet (effects run AFTER render). Without this, there's a
  // one-frame gap where isLoading=false AND profile=null, which causes
  // consumers like Index to navigate away before the fetch even starts.
  const pendingFetch = enabled && !profile && !error && !isLoading && !fetchPromise;

  return {
    profile,
    isLoading: isLoading || pendingFetch,
    error,
    refresh,
  };
}
