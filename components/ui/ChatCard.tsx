import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatCardProps {
  name: string;
  message: string;
  time: string;
  avatar?: string;
  unreadCount?: number;
  isRead?: boolean;
  isOnline?: boolean;
  onPress?: () => void;
}

export function ChatCard({
  name,
  message,
  time,
  avatar,
  unreadCount = 0,
  isRead = false,
  isOnline = false,
  onPress,
}: ChatCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 bg-white px-4 active:bg-light"
    >
      {/* Avatar */}
      <View className="relative h-14 w-14">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            className="h-14 w-14 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-14 w-14 items-center justify-center rounded-full bg-gray4">
            <Ionicons name="person" size={24} color="#131313" />
          </View>
        )}
        {isOnline && (
          <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-tertiary" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 border-b border-border py-4">
        <View className="flex-row items-start justify-between">
          {/* Meta info */}
          <View className="flex-1 gap-2 pr-3">
            <Text className="font-sans-semibold text-[14px] capitalize leading-5 text-dark">
              {name}
            </Text>
            <Text
              className="font-sans text-[12px] leading-[15px] tracking-tight text-dark"
              numberOfLines={2}
            >
              {message}
            </Text>
          </View>

          {/* Time and status */}
          <View className="items-end gap-3">
            <Text
              className={`font-sans text-[12px] leading-[15px] tracking-tight ${
                unreadCount > 0 ? "text-primary" : "text-dark"
              }`}
            >
              {time}
            </Text>
            <View className="flex-row items-center gap-3">
              {isRead && (
                <Ionicons name="checkmark-done" size={16} color="#53C92C" />
              )}
              {unreadCount > 0 && (
                <View className="h-[18px] w-[18px] items-center justify-center rounded-full bg-primary">
                  <Text className="font-sans-semibold text-[12px] text-white">
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
