import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface SettingsMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  variant?: "primary" | "default";
  onPress?: () => void;
  showBorder?: boolean;
}

export function SettingsMenuItem({
  icon,
  label,
  variant = "default",
  onPress,
  showBorder = true,
}: SettingsMenuItemProps) {
  const { theme } = useTheme();
  const isPrimary = variant === "primary";

  return (
    <View>
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-4 p-4 active:opacity-80"
        style={{ backgroundColor: isPrimary ? theme.primary : theme.card }}
      >
        <View className="h-6 w-6 items-center justify-center">
          <Ionicons
            name={icon}
            size={16}
            color={isPrimary ? "#F5F5F5" : theme.icon}
          />
        </View>
        <Text
          className="flex-1 font-sans text-[14px] capitalize leading-5"
          style={{ color: isPrimary ? "#F5F5F5" : theme.text }}
        >
          {label}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={12}
          color={isPrimary ? "rgba(255,255,255,0.6)" : theme.textTertiary}
        />
      </Pressable>
      {showBorder && (
        <View
          style={{
            height: 1,
            backgroundColor: isPrimary ? "rgba(255,255,255,0.2)" : theme.border,
          }}
        />
      )}
    </View>
  );
}
