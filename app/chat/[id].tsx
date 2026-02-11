import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChatHeader } from "@/components/ui/ChatHeader";
import { ChatInput } from "@/components/ui/ChatInput";
import { MessageBubble } from "@/components/ui/MessageBubble";
import { DateSeparator } from "@/components/ui/DateSeparator";
import { useConversation } from "@/hooks/useConversation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Message } from "@/services/api";
import { getStickerById } from "@/constants/stickers";

// Helper to format time from ISO string
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper to format date for separator
function useFormatDateSeparator() {
  const { t } = useTranslation();

  return (isoString: string): string => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t("chat.today");
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t("chat.yesterday");
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };
}

// Helper to get last seen text
function useGetLastSeenText() {
  const { t } = useTranslation();

  return (lastSeenAt: string | null, isOnline: boolean): string => {
    if (isOnline) return t("chat.online");
    if (!lastSeenAt) return t("chat.offline");

    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("chat.lastSeenNow");
    if (diffMins < 60) return t("chat.lastSeenMinutes", { count: diffMins });
    if (diffHours < 24) return t("chat.lastSeenHours", { count: diffHours });
    return t("chat.lastSeenDays", { count: diffDays });
  };
}

// Group messages by date
function useGroupMessagesByDate() {
  const formatDateSeparator = useFormatDateSeparator();

  return (messages: Message[]): { date: string; messages: Message[] }[] => {
    const groups: Map<string, Message[]> = new Map();

    // Messages come sorted desc, we need to reverse for display
    const sortedMessages = [...messages].reverse();

    for (const message of sortedMessages) {
      const dateKey = formatDateSeparator(message.createdAt);
      const existing = groups.get(dateKey) || [];
      groups.set(dateKey, [...existing, message]);
    }

    return Array.from(groups.entries()).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));
  };
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated);
  const currentUserPublicId = profile?.publicId ?? "";
  const getLastSeenText = useGetLastSeenText();
  const groupMessagesByDate = useGroupMessagesByDate();

  const { conversation, messages, isLoading, error, sendMessage } =
    useConversation({
      conversationId: id,
      enabled: isAuthenticated,
    });

  // Get the other participant for 1:1 chats
  const otherParticipant = useMemo(() => {
    if (!conversation || conversation.isGroup) return null;
    return (
      conversation.participants.find((p) => p.publicId !== currentUserPublicId) ||
      conversation.participants[0]
    );
  }, [conversation, currentUserPublicId]);

  // Group messages by date
  const messageGroups = useMemo(
    () => groupMessagesByDate(messages),
    [messages, groupMessagesByDate],
  );

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
      />

      <ScrollView
        className="flex-1 px-4 py-6"
        style={{ backgroundColor: theme.surface }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
      >
        {messageGroups.map((group) => (
          <View key={group.date}>
            <DateSeparator date={group.date} />
            <View style={{ gap: 16, marginTop: 16 }}>
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg.publicId}
                  message={msg.type !== "STICKER" ? (msg.content || undefined) : undefined}
                  time={formatTime(msg.createdAt)}
                  isMe={msg.sender.publicId === currentUserPublicId}
                  isRead={msg.status === "READ"}
                  stickerSource={
                    msg.type === "STICKER" && msg.content
                      ? getStickerById(msg.content)?.source
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
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

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
