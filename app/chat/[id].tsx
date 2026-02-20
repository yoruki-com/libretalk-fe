import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
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
import { formatMessageTime } from "@/utils/time";
import { useGetLastSeenText, useGroupMessagesByDate } from "@/hooks/useChatHelpers";
import { getStickerById } from "@/constants/stickers";

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
  const groupMessagesByDate = useGroupMessagesByDate();

  const { conversation, messages, isLoading, error, sendMessage } =
    useConversation({
      conversationId: id,
      enabled: hasAccessToken,
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
        onProfilePress={() => {
          if (otherParticipant?.publicId) {
            router.push({
              pathname: Routes.PROFILE,
              params: { id: otherParticipant.publicId },
            });
          }
        }}
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
