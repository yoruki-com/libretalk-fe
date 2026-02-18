import { useState, useEffect, useCallback } from "react";
import { usersApi } from "@/services/api";
import type { UserMe } from "@/services/api";

interface UseCommunityOptions {
  enabled?: boolean;
}

interface UseCommunityResult {
  users: UserMe[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setSearch: (search: string) => void;
  setFilter: (filter: string) => void;
}

export function useCommunity(
  options: UseCommunityOptions = {}
): UseCommunityResult {
  const { enabled = true } = options;

  const [users, setUsers] = useState<UserMe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState<string | undefined>();
  const [filter, setFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response =
        filter === "online"
          ? await usersApi.getOnline()
          : await usersApi.getActive();

      let filtered = response.data;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.displayName.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q)
        );
      }

      setUsers(filtered);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch users")
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, filter]);

  const refresh = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (enabled) {
      fetchUsers();
    }
  }, [enabled, fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refresh,
    setSearch,
    setFilter,
  };
}
