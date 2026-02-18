import type { Theme } from "@/constants/theme";
import type { ReactNode } from "react";
import { View } from "react-native";

interface SectionCardProps {
  children: ReactNode;
  theme: Pick<Theme, "card" | "border">;
}

export function SectionCard({ children, theme }: SectionCardProps) {
  return (
    <View
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {children}
    </View>
  );
}
