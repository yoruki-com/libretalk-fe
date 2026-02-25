import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { Routes } from "@/constants/routes";

export function useNotificationNavigation() {
  const router = useRouter();
  const lastProcessedId = useRef<string | null>(null);
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!lastNotificationResponse) return;

    const responseId = lastNotificationResponse.notification.request.identifier;
    if (responseId === lastProcessedId.current) return;
    lastProcessedId.current = responseId;

    const data = lastNotificationResponse.notification.request.content.data as
      | { screen?: string; params?: Record<string, string> }
      | undefined;
    if (!data?.screen) return;

    switch (data.screen) {
      case "chat":
        if (data.params?.id) {
          router.push({
            pathname: Routes.CHAT,
            params: { id: data.params.id },
          } as never);
        }
        break;
      case "post":
        if (data.params?.id) {
          router.push({
            pathname: Routes.POST_COMMENTS,
            params: { id: data.params.id },
          } as never);
        }
        break;
      case "comments":
        if (data.params?.id) {
          // Pass commentId if present (from COMMENT push with specific triggering comment)
          router.push({
            pathname: Routes.POST_COMMENTS,
            params: {
              id: data.params.id,
              ...(data.params.commentId ? { commentId: data.params.commentId } : {}),
            },
          } as never);
        }
        break;
      case "notifications":
        router.push(Routes.NOTIFICATIONS as never);
        break;
    }
  }, [lastNotificationResponse, router]);
}
