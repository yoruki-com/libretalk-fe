import { ArchiveRow } from "@/components/ui/ArchiveRow";
import { ChatCard } from "@/components/ui/ChatCard";
import { Header } from "@/components/ui/Header";
import { SearchInput } from "@/components/ui/SearchInput";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useConversations } from "@/hooks/useConversations";
import type { Conversation } from "@/services/api";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
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

// Get display name for conversation (use participant name for 1:1 chats)
function getConversationDisplayName(conversation: Conversation): string {
  if (conversation.name) return conversation.name;
  if (conversation.participants.length > 0) {
    return conversation.participants[0].displayName;
  }
  return "Unknown";
}

// Check if any participant is online (for 1:1 chats)
function isConversationOnline(conversation: Conversation): boolean {
  if (conversation.isGroup) return false;
  return conversation.participants.some((p) => p.isOnline);
}

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const { conversations, isLoading, error, refresh } = useConversations({
    enabled: isAuthenticated,
  });

  const handleChatPress = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleArchivePress = () => {
    console.log("Archive pressed");
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

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
      <ScrollView
        className="mt-4 flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ArchiveRow count={0} onPress={handleArchivePress} />
        {conversations.map((conversation) => (
          <ChatCard
            key={conversation.publicId}
            name={getConversationDisplayName(conversation)}
            message=""
            time={formatTime(conversation.lastMessageAt)}
            unreadCount={0}
            isRead={true}
            isOnline={isConversationOnline(conversation)}
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
      </ScrollView>
    </View>
  );
}
