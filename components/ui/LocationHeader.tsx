import { View, Text, Pressable, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

function countryCodeToFlag(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

interface LanguageChip {
  code: string;
  name: string;
  isLearning: boolean;
}

interface LocationHeaderProps {
  displayName?: string;
  avatarUrl?: string | null;
  countryCode?: string | null;
  languages?: LanguageChip[];
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  hasNotification?: boolean;
}

export function LocationHeader({
  displayName,
  avatarUrl,
  countryCode,
  languages = [],
  onNotificationPress,
  onAvatarPress,
  hasNotification = false,
}: LocationHeaderProps) {
  const { theme } = useTheme();
  const spokenLanguages = languages.filter((l) => !l.isLearning);
  const learningLanguages = languages.filter((l) => l.isLearning);

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-3">
        {/* User Avatar */}
        <Pressable onPress={onAvatarPress} className="active:opacity-70">
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
                className="absolute -bottom-0.5 -right-0.5 h-5 w-5 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.card }}
              >
                <Text style={{ fontSize: 12, lineHeight: 16 }}>
                  {countryCodeToFlag(countryCode)}
                </Text>
              </View>
            )}
          </View>
        </Pressable>

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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 4, paddingTop: 2 }}
            >
              {spokenLanguages.map((lang) => (
                <View
                  key={lang.code}
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: "rgba(236, 72, 153, 0.15)" }}
                >
                  <Text
                    className="font-sans text-[11px]"
                    style={{ color: "#EC4899" }}
                  >
                    {lang.name}
                  </Text>
                </View>
              ))}
              {learningLanguages.map((lang) => (
                <View
                  key={lang.code}
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                >
                  <Text
                    className="font-sans text-[11px]"
                    style={{ color: "#3B82F6" }}
                  >
                    {lang.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

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
  );
}
