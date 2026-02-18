import { View } from "react-native";
import { SettingsMenuItem } from "./SettingsMenuItem";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}

interface SettingsMenuGroupProps {
  items: MenuItem[];
  variant?: "primary" | "default";
}

export function SettingsMenuGroup({
  items,
  variant = "default",
}: SettingsMenuGroupProps) {
  const { theme } = useTheme();
  const isPrimary = variant === "primary";

  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: isPrimary ? theme.primary : theme.card,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: theme.border,
      }}
    >
      {items.map((item, index) => (
        <SettingsMenuItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          variant={variant}
          onPress={item.onPress}
          showBorder={index < items.length - 1}
        />
      ))}
    </View>
  );
}
