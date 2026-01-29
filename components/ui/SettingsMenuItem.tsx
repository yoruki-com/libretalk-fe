import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const isPrimary = variant === "primary";

  return (
    <View>
      <Pressable
        onPress={onPress}
        className={`flex-row items-center gap-4 p-4 active:opacity-80 ${
          isPrimary ? "bg-primary" : "bg-white"
        }`}
      >
        <View className="h-6 w-6 items-center justify-center">
          <Ionicons
            name={icon}
            size={16}
            color={isPrimary ? "#F5F5F5" : "#131313"}
          />
        </View>
        <Text
          className={`flex-1 font-inter text-[14px] capitalize leading-5 ${
            isPrimary ? "text-light" : "text-dark"
          }`}
        >
          {label}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={12}
          color={isPrimary ? "#E3E3E3" : "#A8A8A8"}
        />
      </Pressable>
      {showBorder && (
        <View className={`h-px ${isPrimary ? "bg-border/20" : "bg-border"}`} />
      )}
    </View>
  );
}
