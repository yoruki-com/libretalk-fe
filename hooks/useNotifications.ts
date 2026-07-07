import { useState, useCallback } from "react";
import {
  notificationsApi,
  type NotificationResponse,
} from "@/services/api/notifications";
import type { PaginationMeta } from "@/services/api/types";

interface UseNotificationsResult {
  notifications: NotificationResponse[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: Error | null;
  pagination: PaginationMeta | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (publicId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotifications = useCallback(async (page: number, append = false) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await notificationsApi.getAll({
        page,
        pageSize: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (append) {
        setNotifications((prev) => [...prev, ...response.data]);
      } else {
        setNotifications(response.data);
      }
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch notifications"));
    } finally {
      if (append) setIsLoadingMore(false);
      else setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchNotifications(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading && !isLoadingMore) {
      await fetchNotifications(currentPage + 1, true);
    }
  }, [fetchNotifications, pagination, currentPage, isLoading, isLoadingMore]);

  const markAsRead = useCallback(async (publicId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.publicId === publicId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );
    try {
      await notificationsApi.markAsRead(publicId);
    } catch {
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) =>
          n.publicId === publicId ? { ...n, isRead: false, readAt: null } : n
        )
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const now = new Date().toISOString();
    // Optimistic: mark all as read
    setNotifications((prev) =>
      prev.map((n) => (n.isRead ? n : { ...n, isRead: true, readAt: now }))
    );
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      // Revert: refresh to get actual state
      await fetchNotifications(1, false);
    }
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    pagination,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}
