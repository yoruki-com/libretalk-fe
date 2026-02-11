import { ArchiveRow } from "@/components/ui/ArchiveRow";
import { ChatCard } from "@/components/ui/ChatCard";
import { Header } from "@/components/ui/Header";
import { SearchInput } from "@/components/ui/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useConversations } from "@/hooks/useConversations";
import type { Conversation } from "@/services/api";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { RefreshableScrollView } from "@/components/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper to format time for display
function formatTime(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// Get the other participants (exclude the current user)
function getOtherParticipants(conversation: Conversation, currentUserPublicId: string) {
  return conversation.participants.filter((p) => p.publicId !== currentUserPublicId);
}

// Get display name for conversation
function getConversationDisplayName(conversation: Conversation, currentUserPublicId: string): string {
  if (conversation.isGroup) {
    if (conversation.name) return conversation.name;
    const others = getOtherParticipants(conversation, currentUserPublicId);
    return others.map((p) => p.displayName).join(", ") || "Group";
  }
  const other = getOtherParticipants(conversation, currentUserPublicId)[0];
  return other?.displayName ?? "Unknown";
}

// Get avatar for conversation
function getConversationAvatar(conversation: Conversation, currentUserPublicId: string): string | undefined {
  if (conversation.isGroup) return conversation.avatarUrl ?? undefined;
  const other = getOtherParticipants(conversation, currentUserPublicId)[0];
  return other?.avatarUrl ?? undefined;
}

// Check if any participant is online (for 1:1 chats)
function isConversationOnline(conversation: Conversation, currentUserPublicId: string): boolean {
  if (conversation.isGroup) return false;
  const other = getOtherParticipants(conversation, currentUserPublicId)[0];
  return other?.isOnline ?? false;
}

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated);

  const { conversations, isLoading, error, refresh } = useConversations({
    enabled: isAuthenticated && !!profile?.publicId,
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
      if (isAuthenticated && profile?.publicId) {
        refresh();
      }
    }, [isAuthenticated, profile?.publicId, refresh])
  );

  const handleChatPress = (chatId: string) => {
    router.push(`/chat/${chatId}`);
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
            Unable to load conversations. Pull to refresh.
          </Text>
        </View>
      )}

      {/* Chat List */}
      <RefreshableScrollView className="mt-4 flex-1" onRefresh={refresh}>
        <ArchiveRow count={0} onPress={handleArchivePress} />
        {conversations.map((conversation) => (
          <ChatCard
            key={conversation.publicId}
            name={getConversationDisplayName(conversation, profile!.publicId)}
            message={
              conversation.lastMessage?.type === "STICKER"
                ? "Sticker"
                : (conversation.lastMessage?.content ?? "")
            }
            time={formatTime(conversation.lastMessageAt)}
            avatar={getConversationAvatar(conversation, profile!.publicId)}
            unreadCount={0}
            isMyTurn={
              !!conversation.lastMessage &&
              conversation.lastMessage.sender.publicId !== profile!.publicId
            }
            isRead={
              !!conversation.lastMessage &&
              conversation.lastMessage.sender.publicId === profile!.publicId &&
              conversation.lastMessage.status === "READ"
            }
            isOnline={isConversationOnline(conversation, profile!.publicId)}
            isGroup={conversation.isGroup}
            onPress={() => handleChatPress(conversation.publicId)}
          />
        ))}

        {/* Empty State */}
        {!isLoading && conversations.length === 0 && !error && (
          <View className="items-center justify-center py-8">
            <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
              No conversations yet. Start chatting!
            </Text>
          </View>
        )}
      </RefreshableScrollView>
    </View>
  );
}
