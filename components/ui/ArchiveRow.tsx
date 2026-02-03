import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface ArchiveRowProps {
  count: number;
  onPress?: () => void;
}

export function ArchiveRow({ count, onPress }: ArchiveRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 active:opacity-80"
      style={{ backgroundColor: theme.background }}
    >
      {/* Icon */}
      <View className="h-14 w-14 items-center justify-center">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.surface }}
        >
          <Ionicons name="archive-outline" size={16} color={theme.iconSecondary} style={{ opacity: 0.6 }} />
        </View>
      </View>

      {/* Content */}
      <View
        className="flex-1 flex-row items-center justify-between py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
      >
        <Text
          className="font-sans-semibold text-[14px] capitalize leading-5"
          style={{ color: theme.text }}
        >
          Archive Chat
        </Text>
        <Text
          className="font-sans-semibold text-[14px] leading-5"
          style={{ color: theme.primary }}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}
