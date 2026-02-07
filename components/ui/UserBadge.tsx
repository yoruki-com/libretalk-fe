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
  onPress?: () => void;
}

export function UserBadge({
  displayName,
  avatarUrl,
  countryCode,
  languages = [],
  onPress,
}: UserBadgeProps) {
  const { theme } = useTheme();
  const spokenLanguages = languages.filter((l) => !l.isLearning);
  const learningLanguages = languages.filter((l) => l.isLearning);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 active:opacity-70"
    >
      {/* Avatar + Flag Badge */}
      <View className="relative">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons name="person" size={20} color={theme.primary} />
          </View>
        )}
        {countryCode && (
          <View
            className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center overflow-hidden rounded-full"
            style={{ borderWidth: 1.5, borderColor: theme.surface }}
          >
            <Image
              source={{
                uri: `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`,
              }}
              className="h-5 w-5"
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Name & Language Chips */}
      <View className="flex-1">
        {displayName && (
          <Text
            className="font-sans-semibold text-[16px] leading-[1.4]"
            style={{ color: theme.text }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
        )}
        {languages.length > 0 && (
          <View className="flex-row gap-1.5" style={{ paddingTop: 2 }}>
            {spokenLanguages.length > 0 && (
              <View
                className="rounded-full px-2.5 py-0.5"
                style={{ backgroundColor: "#EC4899" }}
              >
                <Text
                  className="font-sans-semibold text-[11px] uppercase"
                  style={{ color: "#FFFFFF" }}
                >
                  {spokenLanguages.map((l) => l.code).join(" · ")}
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
