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
import { ChatHeader } from "@/components/ui/ChatHeader";
import { ChatInput } from "@/components/ui/ChatInput";
import { MessageBubble } from "@/components/ui/MessageBubble";
import { DateSeparator } from "@/components/ui/DateSeparator";
import { useConversation } from "@/hooks/useConversation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Message } from "@/services/api";

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
function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

// Helper to get last seen text
function getLastSeenText(lastSeenAt: string | null, isOnline: boolean): string {
  if (isOnline) return "Online";
  if (!lastSeenAt) return "Offline";

  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Last seen just now";
  if (diffMins < 60) return `Last seen ${diffMins} min ago`;
  if (diffHours < 24)
    return `Last seen ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `Last seen ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

// Group messages by date
function groupMessagesByDate(
  messages: Message[],
): { date: string; messages: Message[] }[] {
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
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated);
  const currentUserPublicId = profile?.publicId ?? "";

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
    [messages],
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
    ? conversation.name || "Group Chat"
    : otherParticipant?.displayName || "Chat";

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
                  message={msg.content || undefined}
                  time={formatTime(msg.createdAt)}
                  isMe={msg.sender.publicId === currentUserPublicId}
                  isRead={msg.status === "READ"}
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
