import { useState, useEffect, useCallback } from "react";
import { conversationsApi, type Conversation, type Message, type PaginationParams } from "@/services/api";

interface UseConversationOptions {
  conversationId: string;
  autoFetch?: boolean;
}

interface UseConversationResult {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMessages: boolean;
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
  loadMoreMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

export function useConversation(options: UseConversationOptions): UseConversationResult {
  const { conversationId, autoFetch = true } = options;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseConversationResult["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await conversationsApi.getById(conversationId);
      setConversation(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch conversation"));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const fetchMessages = useCallback(
    async (page: number, append = false) => {
      setIsLoadingMessages(true);

      try {
        const params: PaginationParams = { page, sortBy: "createdAt", sortOrder: "desc" };
        const response = await conversationsApi.messages.getAll(conversationId, params);

        if (append) {
          setMessages((prev) => [...prev, ...response.data]);
        } else {
          setMessages(response.data);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch messages"));
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [conversationId]
  );

  const refresh = useCallback(async () => {
    await Promise.all([fetchConversation(), fetchMessages(1, false)]);
  }, [fetchConversation, fetchMessages]);

  const loadMoreMessages = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoadingMessages) {
      await fetchMessages(currentPage + 1, true);
    }
  }, [fetchMessages, pagination, currentPage, isLoadingMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        const response = await conversationsApi.messages.send(conversationId, {
          type: "TEXT",
          content,
        });
        // Prepend new message to the list
        setMessages((prev) => [response.data, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to send message"));
        throw err;
      }
    },
    [conversationId]
  );

  useEffect(() => {
    if (autoFetch && conversationId) {
      fetchConversation();
      fetchMessages(1);
    }
  }, [autoFetch, conversationId, fetchConversation, fetchMessages]);

  return {
    conversation,
    messages,
    isLoading,
    isLoadingMessages,
    error,
    pagination,
    refresh,
    loadMoreMessages,
    sendMessage,
  };
}
