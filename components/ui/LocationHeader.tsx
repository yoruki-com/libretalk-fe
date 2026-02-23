import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { UserBadge, type UserBadgeLanguage } from "./UserBadge";

interface LocationHeaderProps {
  displayName?: string;
  avatarUrl?: string | null;
  countryCode?: string | null;
  languages?: UserBadgeLanguage[];
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onComposePress?: () => void;
  hasNotification?: boolean;
}

export function LocationHeader({
  displayName,
  avatarUrl,
  countryCode,
  languages = [],
  onNotificationPress,
  onAvatarPress,
  onComposePress,
  hasNotification = false,
}: LocationHeaderProps) {
  const { theme } = useTheme();

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <UserBadge
          displayName={displayName}
          avatarUrl={avatarUrl}
          countryCode={countryCode}
          languages={languages}
          onPress={onAvatarPress}
        />
      </View>

      <View className="flex-row items-center gap-2">
        {/* Compose */}
        {onComposePress && (
          <Pressable
            onPress={onComposePress}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        )}

        {/* Notification */}
        <Pressable
          onPress={onNotificationPress}
          className="relative h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: theme.card }}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.icon} />
          {hasNotification && (
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
