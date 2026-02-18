import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface ChatCardProps {
  name: string;
  message: string;
  time: string;
  avatar?: string;
  unreadCount?: number;
  isMyTurn?: boolean;
  isRead?: boolean;
  isOnline?: boolean;
  isGroup?: boolean;
  onPress?: () => void;
}

export function ChatCard({
  name,
  message,
  time,
  avatar,
  unreadCount = 0,
  isMyTurn = false,
  isRead = false,
  isOnline = false,
  isGroup = false,
  onPress,
}: ChatCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 px-4"
      style={{ backgroundColor: theme.background }}
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
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.surface }}
          >
            <Ionicons name={isGroup ? "people" : "person"} size={24} color={theme.iconSecondary} />
          </View>
        )}
        {isOnline && (
          <View
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2"
            style={{ borderColor: theme.background, backgroundColor: theme.success }}
          />
        )}
      </View>

      {/* Content */}
      <View
        className="flex-1 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
      >
        <View className="flex-row items-start justify-between">
          {/* Meta info */}
          <View className="flex-1 gap-2 pr-3">
            <Text
              className="font-sans-semibold text-[14px] capitalize leading-5"
              style={{ color: theme.text }}
            >
              {name}
            </Text>
            <Text
              className="font-sans text-[12px] leading-[15px] tracking-tight"
              style={{ color: theme.textSecondary }}
              numberOfLines={2}
            >
              {message}
            </Text>
          </View>

          {/* Time and status */}
          <View className="items-end gap-3">
            <Text
              className="font-sans text-[12px] leading-[15px] tracking-tight"
              style={{ color: unreadCount > 0 ? theme.primary : theme.textSecondary }}
            >
              {time}
            </Text>
            <View className="flex-row items-center gap-3">
              {isMyTurn && (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Text className="font-sans-semibold text-[10px] text-white">
                    My turn
                  </Text>
                </View>
              )}
              {isRead && !isMyTurn && (
                <Ionicons name="checkmark-done" size={16} color={theme.success} />
              )}
              {unreadCount > 0 && (
                <View
                  className="h-[18px] w-[18px] items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.primary }}
                >
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
