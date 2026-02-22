import { useState, useEffect, useCallback } from "react";
import { vibesApi, type Vibe, type VibesFilterParams } from "@/services/api/vibes";
import { likesApi } from "@/services/api/likes";
import type { PaginatedResponse } from "@/services/api/types";

// Module-level cache for geocoding results (persists across re-renders, resets on reload)
const geocodeResultCache = new Map<string, { lat: number; lng: number } | null>();

async function geocodeCityMapbox(city: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeResultCache.has(city)) return geocodeResultCache.get(city)!;
  try {
    const token = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
    if (!token) { console.warn("[useVibes] EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN not set"); return null; }
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(city)}&types=place&limit=1&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) { geocodeResultCache.set(city, null); return null; }
    const data = await res.json() as { features?: { geometry?: { coordinates?: [number, number] } }[] };
    const coords = data.features?.[0]?.geometry?.coordinates;
    if (!coords) { geocodeResultCache.set(city, null); return null; }
    const result = { lat: coords[1], lng: coords[0] };
    geocodeResultCache.set(city, result);
    return result;
  } catch {
    geocodeResultCache.set(city, null);
    return null;
  }
}

interface UseVibesOptions {
  category?: string;
  search?: string;
  userPublicId?: string;
  userCity?: string;
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
  const { category: initialCategory, search: initialSearch, userPublicId, userCity, autoFetch = true, enabled = true } = options;

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
        let response: PaginatedResponse<Vibe>;

        if (category === "following") {
          response = await vibesApi.getFollowingFeed({ page, pageSize: 10, sortBy: "createdAt", sortOrder: "desc" });
        } else if (category === "nearby") {
          if (userCity) {
            const coords = await geocodeCityMapbox(userCity);
            if (coords) {
              response = await vibesApi.getNearby(coords.lat, coords.lng, { page, pageSize: 10 });
            } else {
              console.warn("[useVibes] Nearby: geocoding failed for city:", userCity);
              if (!append) setVibes([]);
              setPagination(null);
              setCurrentPage(page);
              return;
            }
          } else {
            console.warn("[useVibes] Nearby: no city on profile, userCity =", userCity);
            if (!append) setVibes([]);
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
        if (append) setIsLoadingMore(false);
        else setIsLoading(false);
      }
    },
    [category, search, userCity]
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

  // Clear list when category changes so the loading spinner shows (fresh start)
  useEffect(() => {
    setVibes([]);
    setPagination(null);
  }, [category]);

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
