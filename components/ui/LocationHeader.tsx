import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { UserBadge, type UserBadgeLanguage } from "./UserBadge";

interface LocationHeaderProps {
  displayName?: string;
  avatarUrl?: string | null;
  countryCode?: string | null;
  languages?: UserBadgeLanguage[];
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onComposePress?: () => void;
  notificationCount?: number;
}

export function LocationHeader({
  displayName,
  avatarUrl,
  countryCode,
  languages = [],
  onNotificationPress,
  onAvatarPress,
  onComposePress,
  notificationCount,
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

        {/* Notification Bell */}
        {onNotificationPress && (
          <Pressable
            onPress={onNotificationPress}
            className="relative h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.icon} />
            {(notificationCount ?? 0) > 0 && (
              <View
                className="absolute -right-1 -top-1 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1"
                style={{ backgroundColor: "#EF4444" }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700" }}>
                  {(notificationCount ?? 0) > 99 ? "99+" : notificationCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
