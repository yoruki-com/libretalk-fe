import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface ProfileCardProps {
  name: string;
  subtitle?: string;
  avatar?: string;
  contactsCount?: number;
  onQRPress?: () => void;
  onContactsPress?: () => void;
}

export function ProfileCard({
  name,
  subtitle,
  avatar,
  contactsCount = 0,
  onQRPress,
  onContactsPress,
}: ProfileCardProps) {
  const { theme } = useTheme();

  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
    >
      {/* Profile Info */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center gap-4">
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
              <Ionicons name="person" size={24} color={theme.iconSecondary} />
            </View>
          )}
          <View>
            <Text
              className="font-sans-semibold text-[14px] capitalize leading-5"
              style={{ color: theme.text }}
            >
              {name}
            </Text>
            {subtitle && (
              <Text
                className="font-sans text-[12px] leading-[15px] tracking-tight"
                style={{ color: theme.textSecondary }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <Pressable onPress={onQRPress} className="active:opacity-70">
          <Ionicons name="qr-code" size={24} color={theme.icon} />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: theme.border }} />

      {/* Contacts */}
      <Pressable
        onPress={onContactsPress}
        className="flex-row items-center gap-2 p-4 active:opacity-80"
      >
        <Ionicons name="people" size={24} color={theme.icon} />
        <Text
          className="flex-1 font-sans text-[13px] leading-[17px]"
          style={{ color: theme.text }}
        >
          {contactsCount} Contacts
        </Text>
        <Ionicons name="chevron-forward" size={12} color={theme.textTertiary} />
      </Pressable>
    </View>
  );
}
