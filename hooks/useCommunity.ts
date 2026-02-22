import { useState, useEffect, useCallback } from "react";
import { usersApi } from "@/services/api";
import type { UserMe, PaginationParams } from "@/services/api";

interface UseCommunityOptions {
  enabled?: boolean;
  hasLocation?: boolean;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseCommunityResult {
  users: UserMe[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  pagination: PaginationMeta | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setSearch: (search: string) => void;
  setFilter: (filter: string) => void;
}

export function useCommunity(
  options: UseCommunityOptions = {}
): UseCommunityResult {
  const { enabled = true, hasLocation = false } = options;

  const [users, setUsers] = useState<UserMe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState<string | undefined>();
  const [filter, setFilter] = useState("all");

  const fetchUsers = useCallback(
    async (page: number, append = false) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);

      try {
        const params: PaginationParams = { page, pageSize: 20, sortBy: "lastSeenAt", sortOrder: "desc" };
        if (search) params.search = search;

        let response;
        if (filter === "nearby") {
          if (hasLocation) {
            response = await usersApi.getNearby(params);
          } else {
            if (!append) setUsers([]);
            setPagination(null);
            setCurrentPage(page);
            return;
          }
        } else if (filter === "online") {
          response = await usersApi.getOnline(params);
        } else {
          response = await usersApi.getActive(params);
        }

        if (append) {
          setUsers((prev) => [...prev, ...response.data]);
        } else {
          setUsers(response.data);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch users")
        );
      } finally {
        if (append) setIsLoadingMore(false);
        else setIsLoading(false);
      }
    },
    [search, filter, hasLocation]
  );

  const refresh = useCallback(async () => {
    await fetchUsers(1, false);
  }, [fetchUsers]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading && !isLoadingMore) {
      await fetchUsers(currentPage + 1, true);
    }
  }, [fetchUsers, pagination, currentPage, isLoading, isLoadingMore]);

  useEffect(() => {
    if (enabled) {
      fetchUsers(1, false);
    }
  }, [enabled, fetchUsers]);

  return {
    users,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    refresh,
    loadMore,
    setSearch,
    setFilter,
  };
}
