import { useState, useEffect, useCallback, useRef } from "react";
import { vibesApi, type Vibe, type VibesFilterParams } from "@/services/api/vibes";
import { likesApi } from "@/services/api/likes";
import type { PaginatedResponse } from "@/services/api/types";

interface UseVibesOptions {
  category?: string;
  search?: string;
  userPublicId?: string;
  hasLocation?: boolean;
  autoFetch?: boolean;
  enabled?: boolean;
}

interface UseVibesResult {
  vibes: Vibe[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: Error | null;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  toggleLike: (vibeId: string) => Promise<void>;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
}

export function useVibes(options: UseVibesOptions = {}): UseVibesResult {
  const { category: initialCategory, search: initialSearch, userPublicId, hasLocation, autoFetch = true, enabled = true } = options;

  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseVibesResult["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);

  const vibesRef = useRef(vibes);
  vibesRef.current = vibes;

  const fetchVibes = useCallback(
    async (page: number, append = false, bottomOnly = false) => {
      if (append || bottomOnly) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);

      try {
        let response: PaginatedResponse<Vibe>;

        if (category === "following") {
          response = await vibesApi.getFollowingFeed({ page, pageSize: 10, sortBy: "createdAt", sortOrder: "desc" });
        } else if (category === "nearby") {
          if (hasLocation) {
            response = await vibesApi.getNearby({ page, pageSize: 10 });
          } else {
            console.warn("[useVibes] Nearby: no location on profile");
            setVibes([]);
            setPagination(null);
            setCurrentPage(page);
            return;
          }
        } else {
          const params: VibesFilterParams = { page, pageSize: 10 };
          if (category === "recent") {
            params.sortBy = "createdAt";
            params.sortOrder = "desc";
          } else if (category && category !== "all") {
            params.category = category;
          }
          if (search) params.search = search;
          response = await vibesApi.getAll(params);
        }

        if (append) {
          setVibes((prev) => [...prev, ...response.data]);
        } else {
          setVibes(response.data);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch vibes"));
      } finally {
        if (append || bottomOnly) setIsLoadingMore(false);
        else setIsLoading(false);
      }
    },
    [category, search, hasLocation]
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchVibes(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchVibes]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading && !isLoadingMore) {
      await fetchVibes(currentPage + 1, true);
    }
  }, [fetchVibes, pagination, currentPage, isLoading, isLoadingMore]);

  const toggleLike = useCallback(async (vibeId: string) => {
    const vibe = vibes.find((v) => v.publicId === vibeId);
    if (!vibe || !userPublicId) return;

    // Optimistic update
    setVibes((prev) =>
      prev.map((v) =>
        v.publicId === vibeId
          ? {
              ...v,
              isLiked: !v.isLiked,
              likesCount: v.isLiked ? v.likesCount - 1 : v.likesCount + 1,
            }
          : v
      )
    );

    try {
      const result = await likesApi.togglePostLike(vibeId, userPublicId);
      // Update with server response
      setVibes((prev) =>
        prev.map((v) =>
          v.publicId === vibeId
            ? {
                ...v,
                isLiked: result.data.liked,
                likesCount: result.data.likesCount,
              }
            : v
        )
      );
    } catch (err) {
      // Revert on error
      setVibes((prev) =>
        prev.map((v) =>
          v.publicId === vibeId
            ? {
                ...v,
                isLiked: vibe.isLiked,
                likesCount: vibe.likesCount,
              }
            : v
        )
      );
      setError(err instanceof Error ? err : new Error("Failed to toggle like"));
    }
  }, [vibes, userPublicId]);

  // Refetch when category or search changes — bottom loader if posts already visible
  useEffect(() => {
    if (autoFetch && enabled) {
      const hasExisting = vibesRef.current.length > 0;
      fetchVibes(1, false, hasExisting);
    }
  }, [autoFetch, enabled, fetchVibes]);

  return {
    vibes,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    pagination,
    refresh,
    loadMore,
    toggleLike,
    setCategory,
    setSearch,
  };
}
