import { ChatCard } from "@/components/ui/ChatCard";
import { Header } from "@/components/ui/Header";
import { Routes } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useConversations } from "@/hooks/useConversations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Conversation } from "@/services/api/types";
import {
  getConversationAvatar,
  getConversationDisplayName,
  isConversationOnline,
} from "@/utils/conversation";
import { formatChatListTime } from "@/utils/time";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated, hasAccessToken } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated && hasAccessToken);
  const yesterdayLabel = t("chat.yesterday");

  const { conversations, isLoading, isLoadingMore, error, refresh, loadMore } =
    useConversations({
      enabled: hasAccessToken && !!profile?.publicId,
      userPublicId: profile?.publicId,
    });

  // Auto-refresh the list every 60 seconds regardless of where the user is in the app
  useEffect(() => {
    if (!hasAccessToken || !profile?.publicId) return;
    const interval = setInterval(() => {
      refresh();
    }, 60_000);
    return () => clearInterval(interval);
  }, [hasAccessToken, profile?.publicId, refresh]);

  // Refresh conversations when tab regains focus (e.g. coming back from chat detail)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      if (hasAccessToken && profile?.publicId) {
        refresh();
      }
    }, [hasAccessToken, profile?.publicId, refresh]),
  );

  const handleChatPress = (chatId: string) => {
    router.push({ pathname: Routes.CHAT, params: { id: chatId } } as never);
  };

  const handleArchivePress = () => {
    console.log("Archive pressed");
  };

  const renderItem = useCallback(
    ({ item: conversation }: { item: Conversation }) => {
      if (!profile) return null;
      return (
        <ChatCard
          name={getConversationDisplayName(
            conversation,
            profile.publicId,
            t("chat.groupChat"),
          )}
          message={
            conversation.lastMessage?.type === "STICKER"
              ? t("chat.sticker")
              : (conversation.lastMessage?.content ?? "")
          }
          time={formatChatListTime(conversation.lastMessageAt, {
            yesterday: yesterdayLabel,
          })}
          avatar={getConversationAvatar(conversation, profile.publicId)}
          unreadCount={0}
          isMyTurn={
            !!conversation.lastMessage &&
            conversation.lastMessage.sender.publicId !== profile.publicId
          }
          isRead={
            !!conversation.lastMessage &&
            conversation.lastMessage.sender.publicId === profile.publicId &&
            conversation.lastMessage.status === "READ"
          }
          isOnline={isConversationOnline(conversation, profile.publicId)}
          isGroup={conversation.isGroup}
          onPress={() => handleChatPress(conversation.publicId)}
        />
      );
    },
    [profile, t, yesterdayLabel, handleChatPress],
  );

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      {/* Header Section */}
      <View className="gap-6 px-4">
        <Header />
      </View>

      {/* Loading State (initial) */}
      {isLoading && conversations.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Error State */}
      {error && conversations.length === 0 && (
        <View className="flex-1 items-center justify-center px-4">
          <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
            {t("chat.loadError")}
          </Text>
        </View>
      )}

      {/* Chat List */}
      {(!isLoading || conversations.length > 0) && !error && (
        <FlatList
          className="mt-4 flex-1"
          data={conversations}
          keyExtractor={(item) => item.publicId}
          renderItem={renderItem}
          onRefresh={refresh}
          refreshing={isLoading && conversations.length === 0}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="items-center justify-center py-8">
                <Text
                  style={{ color: theme.textSecondary, textAlign: "center" }}
                >
                  {t("chat.noConversations")}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
