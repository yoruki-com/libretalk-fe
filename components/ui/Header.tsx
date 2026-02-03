import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onCameraPress?: () => void;
  onNewChatPress?: () => void;
}

export function Header({
  title = "Chatterly",
  onMenuPress,
  onCameraPress,
  onNewChatPress,
}: HeaderProps) {
  const { theme } = useTheme();

  return (
    <View className="flex-row items-center justify-between py-2">
      {/* Left - Menu */}
      <View className="w-[76px]">
        <Pressable
          onPress={onMenuPress}
          className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: theme.surface }}
        >
          <View className="flex-row gap-1.5">
            <View
              className="h-[3px] w-[3px] rounded-full"
              style={{ backgroundColor: theme.icon }}
            />
            <View
              className="h-[3px] w-[3px] rounded-full"
              style={{ backgroundColor: theme.icon }}
            />
            <View
              className="h-[3px] w-[3px] rounded-full"
              style={{ backgroundColor: theme.icon }}
            />
          </View>
        </Pressable>
      </View>

      {/* Center - Logo */}
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8" style={{ backgroundColor: theme.border }} />
        <Text
          className="font-sans-semibold text-[20px] font-semibold leading-7"
          style={{ color: theme.text }}
        >
          {title}
        </Text>
      </View>

      {/* Right - Actions */}
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onCameraPress}
          className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: theme.surface }}
        >
          <Ionicons name="camera" size={16} color={theme.icon} />
        </Pressable>
        <Pressable
          onPress={onNewChatPress}
          className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: theme.primary }}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
