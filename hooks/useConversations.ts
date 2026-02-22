import { useState, useEffect, useCallback } from "react";
import { conversationsApi, type Conversation, type PaginationParams } from "@/services/api";

interface UseConversationsOptions {
  userPublicId?: string;
  params?: PaginationParams;
  autoFetch?: boolean;
  enabled?: boolean;
}

interface UseConversationsResult {
  conversations: Conversation[];
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
}

export function useConversations(
  options: UseConversationsOptions = {}
): UseConversationsResult {
  const { userPublicId, params, autoFetch = true, enabled = true } = options;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseConversationsResult["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(params?.page ?? 1);

  const fetchConversations = useCallback(
    async (page: number, append = false) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);

      try {
        const fetchParams = { ...params, page };
        const response = userPublicId
          ? await conversationsApi.getByUser(userPublicId, fetchParams)
          : await conversationsApi.getAll(fetchParams);

        if (append) {
          setConversations((prev) => [...prev, ...response.data]);
        } else {
          setConversations(response.data);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch conversations"));
      } finally {
        if (append) setIsLoadingMore(false);
        else setIsLoading(false);
      }
    },
    [userPublicId, params]
  );

  const refresh = useCallback(async () => {
    await fetchConversations(1, false);
  }, [fetchConversations]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading && !isLoadingMore) {
      await fetchConversations(currentPage + 1, true);
    }
  }, [fetchConversations, pagination, currentPage, isLoading, isLoadingMore]);

  useEffect(() => {
    if (autoFetch && enabled) {
      fetchConversations(1);
    }
  }, [autoFetch, enabled, fetchConversations]);

  return {
    conversations,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    refresh,
    loadMore,
  };
}
