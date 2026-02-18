import type { Theme } from "@/constants/theme";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface FieldRowProps {
  label: string;
  children: ReactNode;
  theme: Pick<Theme, "textSecondary">;
}

export function FieldRow({ label, children, theme }: FieldRowProps) {
  return (
    <View className="gap-1 px-4 py-3">
      <Text
        className="font-sans text-[12px]"
        style={{ color: theme.textSecondary }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
