import { View } from "react-native";
import { SettingsMenuItem } from "./SettingsMenuItem";
import { Ionicons } from "@expo/vector-icons";

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
  const isPrimary = variant === "primary";

  return (
    <View
      className={`overflow-hidden rounded-2xl ${
        isPrimary ? "bg-primary" : "border border-border bg-white"
      }`}
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
