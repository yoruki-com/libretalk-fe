import { useState, useEffect, useCallback } from "react";
import { vibesApi, type Vibe, type VibeCategory, type VibesFilterParams } from "@/services/api/vibes";

interface UseVibesOptions {
  category?: string;
  search?: string;
  autoFetch?: boolean;
}

interface UseVibesResult {
  vibes: Vibe[];
  categories: VibeCategory[];
  isLoading: boolean;
  isLoadingCategories: boolean;
  error: Error | null;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  toggleLike: (vibeId: string) => Promise<void>;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
}

export function useVibes(options: UseVibesOptions = {}): UseVibesResult {
  const { category: initialCategory, search: initialSearch, autoFetch = true } = options;

  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [categories, setCategories] = useState<VibeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseVibesResult["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);

  const fetchVibes = useCallback(
    async (page: number, append = false) => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    },
    [category, search]
  );

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);

    try {
      const response = await vibesApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      // Categories are optional, don't set error
      console.warn("Failed to fetch categories:", err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchVibes(1, false);
  }, [fetchVibes]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading) {
      await fetchVibes(currentPage + 1, true);
    }
  }, [fetchVibes, pagination, currentPage, isLoading]);

  const toggleLike = useCallback(async (vibeId: string) => {
    const vibe = vibes.find((v) => v.publicId === vibeId);
    if (!vibe) return;

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
      if (vibe.isLiked) {
        await vibesApi.unlike(vibeId);
      } else {
        await vibesApi.like(vibeId);
      }
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
  }, [vibes]);

  // Refetch when category or search changes
  useEffect(() => {
    if (autoFetch) {
      fetchVibes(1, false);
    }
  }, [autoFetch, fetchVibes]);

  // Fetch categories on mount
  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  return {
    vibes,
    categories,
    isLoading,
    isLoadingCategories,
    error,
    pagination,
    refresh,
    loadMore,
    toggleLike,
    setCategory,
    setSearch,
  };
}
