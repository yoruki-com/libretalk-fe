import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationRow } from "@/components/ui";
import { Routes } from "@/constants/routes";
import type { NotificationResponse } from "@/services/api/notifications";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const {
    notifications,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Fetch on initial mount and on focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleNotificationPress = useCallback(
    (notification: NotificationResponse) => {
      // Mark as read (optimistic)
      if (!notification.isRead) {
        markAsRead(notification.publicId);
      }

      // Navigate based on notification type
      switch (notification.type) {
        case "LIKE":
        case "LIKE_REMINDER":
          if (notification.referenceType === "post" && notification.referenceId) {
            router.push({
              pathname: Routes.POST_COMMENTS,
              params: { id: notification.referenceId },
            } as never);
          }
          break;
        case "NEW_VIBES":
          // Batch notification -- no single post to reference, navigate to vibes feed
          router.push(Routes.ROOT as never);
          break;
        case "COMMENT":
        case "COMMENT_REMINDER":
          if (notification.referenceType === "post" && notification.referenceId) {
            // Navigate to comments -- no specific commentId for in-app aggregated notifications
            // (aggregated notification represents multiple comments, not one specific comment)
            router.push({
              pathname: Routes.POST_COMMENTS,
              params: { id: notification.referenceId },
            } as never);
          }
          break;
        case "FOLLOW":
          // Stay on notifications panel -- no navigation per locked decision
          break;
      }
    },
    [markAsRead, router]
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationResponse }) => (
      <NotificationRow
        title={item.title}
        body={item.body}
        actorSummary={item.actorSummary}
        actorCount={item.actorCount}
        isRead={item.isRead}
        createdAt={item.createdAt}
        type={item.type}
        onPress={() => handleNotificationPress(item)}
      />
    ),
    [handleNotificationPress]
  );

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border }}
      >
        <Pressable onPress={() => router.back()} className="mr-3 active:opacity-70">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text
          className="flex-1"
          style={{ color: theme.text, fontSize: 18, fontWeight: "600" }}
        >
          Notifications
        </Text>
        {hasUnread && (
          <Pressable
            onPress={markAllAsRead}
            className="active:opacity-70"
          >
            <Text style={{ color: theme.primary, fontSize: 14, fontWeight: "500" }}>
              Mark all read
            </Text>
          </Pressable>
        )}
      </View>

      {/* Notification list */}
      <FlatList
        className="flex-1"
        data={notifications}
        keyExtractor={(item) => item.publicId}
        renderItem={renderItem}
        onRefresh={refresh}
        refreshing={isRefreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoading || isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="notifications-off-outline" size={48} color={theme.textSecondary} />
              <Text
                style={{
                  color: theme.textSecondary,
                  textAlign: "center",
                  marginTop: 16,
                  fontSize: 16,
                }}
              >
                No notifications yet
              </Text>
              <Text
                style={{
                  color: theme.textTertiary,
                  textAlign: "center",
                  marginTop: 4,
                  fontSize: 14,
                }}
              >
                You'll see activity here when it happens
              </Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 56 }} />
        )}
      />

      {/* Error state */}
      {error && notifications.length === 0 && (
        <View className="absolute inset-0 items-center justify-center px-4" style={{ top: 60 }}>
          <Text style={{ color: theme.error, textAlign: "center", marginBottom: 16 }}>
            {error.message}
          </Text>
          <Pressable onPress={refresh}>
            <Text style={{ color: theme.primary, fontWeight: "600" }}>Try again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
