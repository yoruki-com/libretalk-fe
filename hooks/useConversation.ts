import { useState, useEffect, useCallback } from "react";
import { conversationsApi, type Conversation, type Message, type PaginationParams } from "@/services/api";
import { useWebSocket, type WsEvent } from "@/contexts/WebSocketContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/** Message extended with an optional flag for optimistic (in-flight) messages */
export type LocalMessage = Message & { isOptimistic?: boolean };

interface UseConversationOptions {
  conversationId: string;
  autoFetch?: boolean;
  enabled?: boolean;
}

interface UseConversationResult {
  conversation: Conversation | null;
  messages: LocalMessage[];
  isLoading: boolean;
  isLoadingMessages: boolean;
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
  loadMoreMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
}

export function useConversation(options: UseConversationOptions): UseConversationResult {
  const { conversationId, autoFetch = true, enabled = true } = options;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseConversationResult["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { subscribeToConversation } = useWebSocket();
  const { profile } = useCurrentUser();

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

  /**
   * Send a message with optimistic UI.
   * The message appears instantly before the server responds.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const tempId = `optimistic_${Date.now()}_${Math.random()}`;

      const optimisticMessage: LocalMessage = {
        publicId: tempId,
        type: "TEXT",
        content,
        mediaUrl: null,
        mediaMimeType: null,
        status: "SENT",
        isEdited: false,
        editedAt: null,
        sender: {
          publicId: profile?.publicId ?? "",
          username: profile?.username ?? "",
          displayName: profile?.displayName ?? "",
          avatarUrl: profile?.avatarUrl ?? null,
        },
        replyTo: null,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      // Show the message immediately
      setMessages((prev) => [optimisticMessage, ...prev]);

      try {
        const response = await conversationsApi.messages.send(conversationId, {
          type: "TEXT",
          content,
        });
        // Replace optimistic placeholder with the real server response
        setMessages((prev) =>
          prev.map((m) => (m.publicId === tempId ? response.data : m))
        );
      } catch (err) {
        // Remove the placeholder if the send failed
        setMessages((prev) => prev.filter((m) => m.publicId !== tempId));
        setError(err instanceof Error ? err : new Error("Failed to send message"));
        throw err;
      }
    },
    [conversationId, profile]
  );

  /** Mark conversation as read — fire-and-forget, no refetch needed. */
  const markAsRead = useCallback(async () => {
    try {
      await conversationsApi.markAsRead(conversationId);
    } catch {
      // best-effort: don't surface read-receipt failures to user
    }
  }, [conversationId]);

  // ── Initial fetch ────────────────────────────────────────
  useEffect(() => {
    if (autoFetch && enabled && conversationId) {
      fetchConversation();
      fetchMessages(1);
    }
  }, [autoFetch, enabled, conversationId, fetchConversation, fetchMessages]);

  // ── Real-time WebSocket subscription ─────────────────────
  useEffect(() => {
    if (!enabled || !conversationId) return;

    const unsubscribe = subscribeToConversation(conversationId, (event: WsEvent) => {
      if (event.type === "NEW_MESSAGE") {
        const incoming = event.message as Message;
        setMessages((prev) => {
          // Deduplicate: skip if publicId already present (own message confirmed via HTTP)
          if (prev.some((m) => m.publicId === incoming.publicId)) return prev;
          return [incoming, ...prev];
        });
      }

      if (event.type === "MESSAGE_READ") {
        setMessages((prev) =>
          prev.map((m) =>
            m.status !== "READ" ? { ...m, status: "READ" as const } : m
          )
        );
      }
    });

    return unsubscribe;
  }, [enabled, conversationId, subscribeToConversation]);

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
    markAsRead,
  };
}
