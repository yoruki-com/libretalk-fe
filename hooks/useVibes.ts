import { useState, useEffect, useCallback } from "react";
import { vibesApi, type Vibe, type VibesFilterParams } from "@/services/api/vibes";
import { likesApi } from "@/services/api/likes";

interface UseVibesOptions {
  category?: string;
  search?: string;
  userPublicId?: string;
  autoFetch?: boolean;
  enabled?: boolean;
}

interface UseVibesResult {
  vibes: Vibe[];
  isLoading: boolean;
  isLoadingMore: boolean;
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
  const { category: initialCategory, search: initialSearch, userPublicId, autoFetch = true, enabled = true } = options;

  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseVibesResult["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);

  const fetchVibes = useCallback(
    async (page: number, append = false) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);

      try {
        const params: VibesFilterParams = { page };
        if (category && category !== "all") {
          params.category = category;
        }
        if (search) {
          params.search = search;
        }

        const response = await vibesApi.getAll(params);

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
        if (append) setIsLoadingMore(false);
        else setIsLoading(false);
      }
    },
    [category, search]
  );

  const refresh = useCallback(async () => {
    await fetchVibes(1, false);
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

  // Refetch when category or search changes
  useEffect(() => {
    if (autoFetch && enabled) {
      fetchVibes(1, false);
    }
  }, [autoFetch, enabled, fetchVibes]);

  return {
    vibes,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    refresh,
    loadMore,
    toggleLike,
    setCategory,
    setSearch,
  };
}
