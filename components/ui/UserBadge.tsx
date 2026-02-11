import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

export interface UserBadgeLanguage {
  code: string;
  isLearning: boolean;
}

interface UserBadgeProps {
  displayName?: string;
  avatarUrl?: string | null;
  countryCode?: string | null;
  languages?: UserBadgeLanguage[];
  isVip?: boolean;
  onPress?: () => void;
  size?: "default" | "compact";
}

export function UserBadge({
  displayName,
  avatarUrl,
  countryCode,
  languages = [],
  isVip = false,
  onPress,
  size = "default",
}: UserBadgeProps) {
  const { theme } = useTheme();
  const compact = size === "compact";
  const spokenLanguages = languages.filter((l) => !l.isLearning);
  const learningLanguages = languages.filter((l) => l.isLearning);

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center ${compact ? "gap-2" : "gap-3"} active:opacity-70`}
    >
      {/* Avatar + Flag Badge */}
      <View className="relative">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className={compact ? "h-8 w-8 rounded-full" : "h-10 w-10 rounded-full"}
          />
        ) : (
          <View
            className={`items-center justify-center rounded-full ${compact ? "h-8 w-8" : "h-10 w-10"}`}
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons name="person" size={compact ? 16 : 20} color={theme.primary} />
          </View>
        )}
        {countryCode && (
          <View
            className={`absolute items-center justify-center overflow-hidden rounded-full ${compact ? "-bottom-0.5 -right-0.5 h-4 w-4" : "-bottom-0.5 -right-0.5 h-5 w-5"}`}
            style={{ borderWidth: 1.5, borderColor: theme.surface }}
          >
            <Image
              source={{
                uri: `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`,
              }}
              className={compact ? "h-4 w-4" : "h-5 w-5"}
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Name & Language Chips */}
      <View className="flex-1">
        {displayName && (
          <View className="flex-row items-center gap-1">
            <Text
              className={`font-sans-semibold ${compact ? "text-[14px]" : "text-[16px]"} leading-[1.4]`}
              style={{ color: theme.text }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {isVip && (
              <Ionicons
                name="shield-checkmark"
                size={compact ? 13 : 16}
                color={theme.primary}
              />
            )}
          </View>
        )}
        {languages.length > 0 && (
          <View className={`flex-row ${compact ? "gap-1" : "gap-1.5"}`} style={{ paddingTop: compact ? 1 : 2 }}>
            {spokenLanguages.length > 0 && (
              <View
                className={`rounded-full ${compact ? "px-1.5 py-px" : "px-2.5 py-0.5"}`}
                style={{ backgroundColor: "#EC4899" }}
              >
                <Text
                  className={`font-sans-semibold ${compact ? "text-[9px]" : "text-[11px]"} uppercase`}
                  style={{ color: "#FFFFFF" }}
                >
                  {spokenLanguages.map((l) => l.code).join(" · ")}
                </Text>
              </View>
            )}
            {learningLanguages.length > 0 && (
              <View
                className={`rounded-full ${compact ? "px-1.5 py-px" : "px-2.5 py-0.5"}`}
                style={{ backgroundColor: "#3B82F6" }}
              >
                <Text
                  className={`font-sans-semibold ${compact ? "text-[9px]" : "text-[11px]"} uppercase`}
                  style={{ color: "#FFFFFF" }}
                >
                  {learningLanguages.map((l) => l.code).join(" · ")}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
