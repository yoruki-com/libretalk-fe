import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import type { UserBadgeLanguage } from "./UserBadge";

interface CommunityCardProps {
  displayName: string;
  avatarUrl?: string | null;
  countryCode?: string | null;
  languages?: UserBadgeLanguage[];
  bio?: string | null;
  personalityType?: string | null;
  interests?: string[];
  city?: string | null;
  isOnline?: boolean;
  isVip?: boolean;
  onPress?: () => void;
  onWavePress?: () => void;
}

export function CommunityCard({
  displayName,
  avatarUrl,
  countryCode,
  languages = [],
  bio,
  personalityType,
  interests = [],
  city,
  isOnline = false,
  isVip = false,
  onPress,
  onWavePress,
}: CommunityCardProps) {
  const { theme, isDark } = useTheme();

  const spokenLanguages = languages.filter((l) => !l.isLearning);
  const learningLanguages = languages.filter((l) => l.isLearning);
  const tags = [...(personalityType ? [personalityType] : []), ...interests];

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-[20px] shadow-sm active:opacity-95"
      style={{
        backgroundColor: theme.card,
        shadowColor: isDark ? "#000000" : "#585858",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 24,
        elevation: 5,
      }}
    >
      {/* Header: Avatar + Info + Menu */}
      <View className="flex-row items-start px-4 pt-4 pb-2">
        {/* Large Avatar + Flag */}
        <Pressable
          onPress={onPress}
          className="relative mr-3 active:opacity-70"
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.surface }}
            >
              <Ionicons name="person" size={28} color={theme.primary} />
            </View>
          )}
          {countryCode && (
            <View
              className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center overflow-hidden rounded-full"
              style={{ borderWidth: 2, borderColor: theme.card }}
            >
              <Image
                source={{
                  uri: `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`,
                }}
                className="h-6 w-6"
                resizeMode="cover"
              />
            </View>
          )}
          {isOnline && (
            <View
              className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full"
              style={{
                backgroundColor: theme.success,
                borderWidth: 2,
                borderColor: theme.card,
              }}
            />
          )}
        </Pressable>

        {/* Name + Languages + Bio + Wave */}
        <View className="flex-1 pt-0.5">
          <View className="flex-row items-center gap-1">
            <Text
              className="font-sans-semibold text-[16px] leading-[1.4]"
              style={{ color: theme.text }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {isVip && (
              <Ionicons name="shield-checkmark" size={16} color={theme.primary} />
            )}
          </View>
          {languages.length > 0 && (
            <View className="flex-row gap-1.5" style={{ paddingTop: 3 }}>
              {spokenLanguages.length > 0 && (
                <View
                  className="rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: "#EC4899" }}
                >
                  <Text
                    className="font-sans-semibold text-[11px] uppercase"
                    style={{ color: "#FFFFFF" }}
                  >
                    {spokenLanguages.map((l) => l.code).join(" \u00B7 ")}
                  </Text>
                </View>
              )}
              {learningLanguages.length > 0 && (
                <View
                  className="rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: "#3B82F6" }}
                >
                  <Text
                    className="font-sans-semibold text-[11px] uppercase"
                    style={{ color: "#FFFFFF" }}
                  >
                    {learningLanguages.map((l) => l.code).join(" \u00B7 ")}
                  </Text>
                </View>
              )}
            </View>
          )}
          {bio && (
            <Text
              className="font-sans text-[13px] leading-[1.4]"
              style={{ color: theme.textSecondary, marginTop: 4 }}
              numberOfLines={2}
            >
              {bio}
            </Text>
          )}
        </View>

        {/* Wave Button */}
        <Pressable
          onPress={onWavePress}
          className="items-center justify-center rounded-full active:opacity-70"
          style={{
            width: 36,
            height: 36,
            backgroundColor: theme.primary,
          }}
        >
          <Text className="text-[18px]">{"\u{1F44B}"}</Text>
        </Pressable>
      </View>

      {/* Interest Tags */}
      {tags.length > 0 && (
        <View
          className="flex-row flex-wrap gap-2 px-3 pb-2"
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
            marginTop: 4,
            paddingTop: 7,
          }}
        >
          {tags.map((tag) => (
            <View
              key={tag}
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: isDark ? theme.surface : theme.primaryLight,
              }}
            >
              <Text
                className="font-sans-medium text-[10px]"
                style={{ color: isDark ? theme.textSecondary : theme.primary }}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
