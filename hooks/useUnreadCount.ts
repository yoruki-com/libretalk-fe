import { useState, useCallback } from "react";
import { notificationsApi } from "@/services/api/notifications";

interface UseUnreadCountResult {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
}

export function useUnreadCount(): UseUnreadCountResult {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch {
      // Silently fail -- badge just shows stale count
    }
  }, []);

  return { unreadCount, fetchUnreadCount };
}
