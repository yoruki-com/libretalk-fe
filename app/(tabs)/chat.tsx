import { ArchiveRow } from "@/components/ui/ArchiveRow";
import { ChatCard } from "@/components/ui/ChatCard";
import { Header } from "@/components/ui/Header";
import { SearchInput } from "@/components/ui/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useConversations } from "@/hooks/useConversations";
import { useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
import { formatChatListTime } from "@/utils/time";
import {
  getOtherParticipants,
  getConversationDisplayName,
  getConversationAvatar,
  isConversationOnline,
} from "@/utils/conversation";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { RefreshableScrollView } from "@/components/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated, hasAccessToken } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated && hasAccessToken);
  const yesterdayLabel = t("chat.yesterday");

  const { conversations, isLoading, error, refresh } = useConversations({
    enabled: hasAccessToken && !!profile?.publicId,
    userPublicId: profile?.publicId,
  });

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
    }, [hasAccessToken, profile?.publicId, refresh])
  );

  const handleChatPress = (chatId: string) => {
    router.push({ pathname: Routes.CHAT, params: { id: chatId } } as never);
  };

  const handleArchivePress = () => {
    console.log("Archive pressed");
  };

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      {/* Header Section */}
      <View className="gap-6 px-4">
        <Header />
        <SearchInput />
      </View>
      {/* Loading State */}
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
      <RefreshableScrollView className="mt-4 flex-1" onRefresh={refresh}>
        <ArchiveRow count={0} onPress={handleArchivePress} />
        {profile && conversations.map((conversation) => (
          <ChatCard
            key={conversation.publicId}
            name={getConversationDisplayName(conversation, profile.publicId, t("chat.groupChat"))}
            message={
              conversation.lastMessage?.type === "STICKER"
                ? t("chat.sticker")
                : (conversation.lastMessage?.content ?? "")
            }
            time={formatChatListTime(conversation.lastMessageAt, { yesterday: yesterdayLabel })}
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
        ))}

        {/* Empty State */}
        {!isLoading && conversations.length === 0 && !error && (
          <View className="items-center justify-center py-8">
            <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
              {t("chat.noConversations")}
            </Text>
          </View>
        )}
      </RefreshableScrollView>
    </View>
  );
}
