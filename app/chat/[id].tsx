import {
  FlatList,
  KeyboardAvoidingView,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";
import { ChatHeader } from "@/components/ui/ChatHeader";
import { ChatInput } from "@/components/ui/ChatInput";
import { MessageBubble } from "@/components/ui/MessageBubble";
import { DateSeparator } from "@/components/ui/DateSeparator";
import { useConversation } from "@/hooks/useConversation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatMessageTime } from "@/utils/time";
import { useGetLastSeenText, useFormatDateSeparator } from "@/hooks/useChatHelpers";
import { getStickerById } from "@/constants/stickers";
import { setActiveChatId } from "@/utils/activeChatTracker";
import { useState } from "react";
import type { Message } from "@/services/api";

type FlatItem =
  | { type: "message"; data: Message }
  | { type: "separator"; date: string };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const { theme } = useTheme();
  const { isAuthenticated, hasAccessToken } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated && hasAccessToken);
  const currentUserPublicId = profile?.publicId ?? "";
  const getLastSeenText = useGetLastSeenText();
  const formatDateSeparator = useFormatDateSeparator();

  const { conversation, messages, isLoading, isLoadingMessages, error, sendMessage, loadMoreMessages, markAsRead } =
    useConversation({
      conversationId: id,
      enabled: hasAccessToken,
    });

  // Mark messages as read when the conversation loads
  useEffect(() => {
    if (conversation?.publicId) {
      markAsRead();
    }
  }, [conversation?.publicId]);

  // Track active chat ID for push suppression
  useEffect(() => {
    if (id) {
      setActiveChatId(id);
    }
    return () => {
      setActiveChatId(null);
    };
  }, [id]);

  // Dismiss existing push notifications for this conversation on mount
  useEffect(() => {
    async function clearChatNotifications() {
      try {
        const presented = await Notifications.getPresentedNotificationsAsync();
        for (const notif of presented) {
          const data = notif.request.content.data as
            | { screen?: string; params?: { id?: string } }
            | undefined;
          if (data?.screen === "chat" && data?.params?.id === id) {
            await Notifications.dismissNotificationAsync(notif.request.identifier);
          }
        }
      } catch {
        // Silently ignore -- notification dismissal is best-effort
      }
    }
    if (id) {
      clearChatNotifications();
    }
  }, [id]);

  // Get the other participant for 1:1 chats
  const otherParticipant = useMemo(() => {
    if (!conversation || conversation.isGroup) return null;
    return (
      conversation.participants.find((p) => p.publicId !== currentUserPublicId) ||
      conversation.participants[0]
    );
  }, [conversation, currentUserPublicId]);

  // Flatten messages (DESC) with date separators for inverted FlatList.
  // Separators are inserted AFTER each date group so they appear ABOVE the group when inverted.
  const flatItems = useMemo((): FlatItem[] => {
    const items: FlatItem[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const msgDate = formatDateSeparator(msg.createdAt);
      items.push({ type: "message", data: msg });

      const nextMsg = messages[i + 1];
      const nextDate = nextMsg ? formatDateSeparator(nextMsg.createdAt) : null;
      if (msgDate !== nextDate) {
        items.push({ type: "separator", date: msgDate });
      }
    }
    return items;
  }, [messages, formatDateSeparator]);

  const handleBack = () => {
    router.back();
  };

  const handleSend = async () => {
    if (inputValue.trim()) {
      try {
        await sendMessage(inputValue.trim());
        setInputValue("");
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  const handleCamera = () => {
    console.log("Camera pressed");
  };

  const handleMic = () => {
    console.log("Mic pressed");
  };

  // Loading state
  if (isLoading && !conversation) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Error state
  if (error && !conversation) {
    return (
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: theme.background }}
      >
        <Text style={{ color: theme.error, textAlign: "center" }}>
          {error.message}
        </Text>
      </View>
    );
  }

  // Determine display values
  const displayName = conversation?.isGroup
    ? conversation.name || t("chat.groupChat")
    : otherParticipant?.displayName || t("tabs.chat");

  const displayAvatar = conversation?.isGroup
    ? conversation.avatarUrl ?? undefined
    : otherParticipant?.avatarUrl ?? undefined;

  const isOnline = otherParticipant?.isOnline ?? false;
  const lastSeen = otherParticipant
    ? getLastSeenText(otherParticipant.lastSeenAt, isOnline)
    : "";

  const renderItem = ({ item }: { item: FlatItem }) => {
    if (item.type === "separator") {
      return <DateSeparator date={item.date} />;
    }
    const msg = item.data;
    return (
      <MessageBubble
        message={msg.type !== "STICKER" ? (msg.content || undefined) : undefined}
        time={formatMessageTime(msg.createdAt)}
        isMe={msg.sender.publicId === currentUserPublicId}
        isRead={msg.status === "READ"}
        StickerComponent={
          msg.type === "STICKER" && msg.content
            ? getStickerById(msg.content)?.Component
            : undefined
        }
        images={
          msg.type === "IMAGE" && msg.mediaUrl
            ? [{ uri: msg.mediaUrl }]
            : undefined
        }
        file={
          msg.type === "FILE" && msg.mediaUrl
            ? {
                name: msg.mediaUrl.split("/").pop() || "file",
                size: "",
                type: msg.mediaMimeType || "file",
              }
            : msg.type === "VIDEO" && msg.mediaUrl
              ? {
                  name: msg.mediaUrl.split("/").pop() || "video.mp4",
                  size: "",
                  type: "video",
                }
              : undefined
        }
      />
    );
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ChatHeader
        name={displayName}
        avatar={displayAvatar}
        lastSeen={lastSeen}
        isOnline={isOnline}
        unreadCount={0}
        onBackPress={handleBack}
        onProfilePress={() => {
          if (otherParticipant?.publicId) {
            router.push({
              pathname: Routes.PROFILE,
              params: { id: otherParticipant.publicId },
            });
          }
        }}
      />

      <FlatList
        className="flex-1 px-4"
        style={{ backgroundColor: theme.surface }}
        contentContainerStyle={{ gap: 16, paddingVertical: 24 }}
        inverted
        data={flatItems}
        keyExtractor={(item, index) =>
          item.type === "separator" ? `sep-${item.date}-${index}` : item.data.publicId
        }
        renderItem={renderItem}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.2}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isLoadingMessages ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : null
        }
      />

      <ChatInput
        value={inputValue}
        onChangeText={setInputValue}
        onSend={handleSend}
        onCameraPress={handleCamera}
        onMicPress={handleMic}
      />
    </KeyboardAvoidingView>
  );
}
