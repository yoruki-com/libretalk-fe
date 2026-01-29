import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ChatHeader } from "@/components/ui/ChatHeader";
import { ChatInput } from "@/components/ui/ChatInput";
import { MessageBubble } from "@/components/ui/MessageBubble";
import { DateSeparator } from "@/components/ui/DateSeparator";

// Mock conversation data
const mockConversation = {
  user: {
    id: "1",
    name: "Olivia Nguyen",
    lastSeen: "Last seen 2 hours ago",
    isOnline: false,
  },
  messages: [
    {
      id: "1",
      message:
        "Hey! I'm finally on vacation! 🌴☀️\nJust wanted to share some pictures with you.",
      time: "10.24 PM",
      isMe: false,
    },
    {
      id: "2",
      message: "Wow, these look amazing! 😍 Where are you?",
      time: "10.24 PM",
      isMe: true,
      isRead: true,
    },
    {
      id: "3",
      message:
        "Thanks! I'm at Bali, the weather is perfect!\nWish you were here!",
      time: "10.24 PM",
      isMe: false,
      images: [{ uri: "" }, { uri: "" }, { uri: "" }],
    },
    {
      id: "4",
      message: "That sounds incredible! Enjoy your trip, and send more pics! 📸✨",
      time: "10.24 PM",
      isMe: true,
      isRead: true,
    },
    {
      id: "5",
      time: "10.25 PM",
      isMe: true,
      isRead: false,
      file: {
        name: "video.mp4",
        size: "2mb",
        type: "video",
      },
    },
  ],
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");

  const handleBack = () => {
    router.back();
  };

  const handleCall = () => {
    console.log("Call pressed");
  };

  const handleVideo = () => {
    console.log("Video call pressed");
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log("Send message:", inputValue);
      setInputValue("");
    }
  };

  const handleAttach = () => {
    console.log("Attach pressed");
  };

  const handleCamera = () => {
    console.log("Camera pressed");
  };

  const handleMic = () => {
    console.log("Mic pressed");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ChatHeader
        name={mockConversation.user.name}
        lastSeen={mockConversation.user.lastSeen}
        isOnline={mockConversation.user.isOnline}
        unreadCount={1}
        onBackPress={handleBack}
        onCallPress={handleCall}
        onVideoPress={handleVideo}
      />

      <ScrollView
        className="flex-1 bg-gray6 px-4 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
      >
        <DateSeparator date="Today" />

        {mockConversation.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg.message}
            time={msg.time}
            isMe={msg.isMe}
            isRead={msg.isRead}
            images={msg.images}
            file={msg.file}
          />
        ))}
      </ScrollView>

      <ChatInput
        value={inputValue}
        onChangeText={setInputValue}
        onSend={handleSend}
        onAttachPress={handleAttach}
        onCameraPress={handleCamera}
        onMicPress={handleMic}
        typingUser="Olivia Nguyen"
      />
    </KeyboardAvoidingView>
  );
}
