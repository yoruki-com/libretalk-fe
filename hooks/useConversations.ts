import { useState, useEffect, useCallback } from "react";
import { conversationsApi, type Conversation, type PaginationParams } from "@/services/api";

interface UseConversationsOptions {
  userPublicId?: string;
  params?: PaginationParams;
  autoFetch?: boolean;
}

interface UseConversationsResult {
  conversations: Conversation[];
  isLoading: boolean;
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
}

export function useConversations(
  options: UseConversationsOptions = {}
): UseConversationsResult {
  const { userPublicId, params, autoFetch = true } = options;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseConversationsResult["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(params?.page ?? 1);

  const fetchConversations = useCallback(
    async (page: number, append = false) => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    },
    [userPublicId, params]
  );

  const refresh = useCallback(async () => {
    await fetchConversations(1, false);
  }, [fetchConversations]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading) {
      await fetchConversations(currentPage + 1, true);
    }
  }, [fetchConversations, pagination, currentPage, isLoading]);

  useEffect(() => {
    if (autoFetch) {
      fetchConversations(1);
    }
  }, [autoFetch, fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    pagination,
    refresh,
    loadMore,
  };
}
