import type { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface IconRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  label: string;
  value?: string;
  children?: ReactNode;
  onPress?: () => void;
  rightIconIsVisible?: boolean;
  theme: Pick<Theme, "text" | "textSecondary" | "textTertiary">;
}

export function IconRow({
  icon,
  iconBg,
  label,
  value,
  children,
  onPress,
  rightIconIsVisible = true,
  theme,
}: IconRowProps) {
  const content = (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        {children ? (
          <>
            <Text
              className="font-sans text-[12px]"
              style={{ color: theme.textSecondary }}
            >
              {label}
            </Text>
            {children}
          </>
        ) : (
          <Text
            className="font-sans text-[15px]"
            style={{ color: value ? theme.text : theme.textSecondary }}
          >
            {value ?? label}
          </Text>
        )}
      </View>
      {rightIconIsVisible && (
        <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }
  return content;
}
