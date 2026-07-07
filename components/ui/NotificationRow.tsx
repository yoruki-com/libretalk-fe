import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { formatNotificationTime } from "@/utils/time";

interface NotificationRowProps {
  title: string;
  body: string | null;
  actorAvatarUrl: string | null;
  isRead: boolean;
  createdAt: string;
  type: string;
  onPress: () => void;
}

export function NotificationRow({
  title,
  body,
  actorAvatarUrl,
  isRead,
  createdAt,
  type,
  onPress,
}: NotificationRowProps) {
  const { theme } = useTheme();

  // Map notification type to icon
  const iconName = getNotificationIcon(type);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 active:opacity-70"
      style={{ backgroundColor: isRead ? "transparent" : theme.surface }}
    >
      {/* Blue dot for unread */}
      <View className="w-3 items-center justify-center mr-1">
        {!isRead && (
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "#3B82F6" }}
          />
        )}
      </View>

      {/* Actor avatar or icon fallback */}
      <View
        className="h-10 w-10 rounded-full items-center justify-center mr-3 overflow-hidden"
        style={{ backgroundColor: theme.card }}
      >
        {actorAvatarUrl ? (
          <Image
            source={{ uri: actorAvatarUrl }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <Ionicons name={iconName} size={20} color={theme.icon} />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 mr-2">
        <Text
          numberOfLines={2}
          style={{
            color: theme.text,
            fontWeight: isRead ? "400" : "600",
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {title}
        </Text>
        {body && (
          <Text
            numberOfLines={1}
            style={{
              color: theme.textSecondary,
              fontSize: 13,
              marginTop: 2,
            }}
          >
            {body}
          </Text>
        )}
      </View>

      {/* Timestamp */}
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 12,
        }}
      >
        {formatNotificationTime(createdAt)}
      </Text>
    </Pressable>
  );
}

function getNotificationIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "LIKE":
    case "LIKE_REMINDER":
      return "heart-outline";
    case "COMMENT":
    case "COMMENT_REMINDER":
      return "chatbubble-outline";
    case "FOLLOW":
      return "person-add-outline";
    case "NEW_VIBES":
      return "sparkles-outline";
    case "MESSAGE":
      return "mail-outline";
    case "SYSTEM":
      return "information-circle-outline";
    default:
      return "notifications-outline";
  }
}
