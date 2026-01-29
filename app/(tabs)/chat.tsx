import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/ui/Header";
import { SearchInput } from "@/components/ui/SearchInput";
import { ChatCard } from "@/components/ui/ChatCard";
import { ArchiveRow } from "@/components/ui/ArchiveRow";

// Mock data for chat list
const mockChats = [
  {
    id: "1",
    name: "Emma Carter",
    message: "Hey! Are we still on for tonight? 😊, Let me know what time works for you!",
    time: "10.24 PM",
    unreadCount: 1,
    isRead: true,
  },
  {
    id: "2",
    name: "Sophia Rivera",
    message: "I just sent you the files. Check them out and tell me what you think.",
    time: "10.24 PM",
    unreadCount: 0,
    isRead: false,
    isOnline: true,
  },
  {
    id: "3",
    name: "James Mitchell",
    message: "Had such a great time today! 😄 Let's do it again soon!",
    time: "10.24 PM",
    unreadCount: 1,
    isRead: false,
  },
  {
    id: "4",
    name: "Ava Martinez",
    message: "The game last night was crazy! Did you see that final goal?",
    time: "10.24 PM",
    unreadCount: 0,
    isRead: true,
  },
  {
    id: "5",
    name: "Olivia Nguyen",
    message: "Morning! Don't forget our meeting. Let me know if you need anything then.",
    time: "10.24 PM",
    unreadCount: 0,
    isRead: false,
    isOnline: true,
  },
  {
    id: "6",
    name: "Ethan Walker",
    message: "Yo, are you free to catch up later? Got some news to share!",
    time: "Tomorrow",
    unreadCount: 0,
    isRead: true,
  },
  {
    id: "7",
    name: "Daniel Kim",
    message: "Hey, I'm running a little late. Should be there in 10 minutes!",
    time: "Tomorrow",
    unreadCount: 0,
    isRead: false,
    isOnline: true,
  },
  {
    id: "8",
    name: "Isabella Flores",
    message: "Did you try that new café yet? The pastries are amazing!",
    time: "Tuesday",
    unreadCount: 0,
    isRead: true,
  },
  {
    id: "9",
    name: "Liam Thompson",
    message: "Hey! Are we still on for tonight? 👋, Let me know what time works for you!",
    time: "Tuesday",
    unreadCount: 0,
    isRead: false,
  },
  {
    id: "10",
    name: "Mia Johnson",
    message: "Just finished watching that show! You were right, it's SO good!",
    time: "Monday",
    unreadCount: 1,
    isRead: false,
  },
];

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();

  const handleMenuPress = () => {
    console.log("Menu pressed");
  };

  const handleCameraPress = () => {
    console.log("Camera pressed");
  };

  const handleNewChatPress = () => {
    console.log("New chat pressed");
  };

  const handleChatPress = (chatId: string) => {
    console.log("Chat pressed:", chatId);
  };

  const handleArchivePress = () => {
    console.log("Archive pressed");
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header Section */}
      <View className="gap-6 px-4">
        <Header
          onMenuPress={handleMenuPress}
          onCameraPress={handleCameraPress}
          onNewChatPress={handleNewChatPress}
        />
        <SearchInput />
      </View>

      {/* Chat List */}
      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <ArchiveRow count={16} onPress={handleArchivePress} />
        {mockChats.map((chat) => (
          <ChatCard
            key={chat.id}
            name={chat.name}
            message={chat.message}
            time={chat.time}
            unreadCount={chat.unreadCount}
            isRead={chat.isRead}
            isOnline={chat.isOnline}
            onPress={() => handleChatPress(chat.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
