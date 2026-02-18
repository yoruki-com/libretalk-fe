import type { Theme } from "@/constants/theme";
import { Text } from "react-native";

interface SectionHeaderProps {
  label: string;
  theme: Pick<Theme, "text">;
}

export function SectionHeader({ label, theme }: SectionHeaderProps) {
  return (
    <Text
      className="font-sans-semibold text-[16px]"
      style={{ color: theme.text }}
    >
      {label}
    </Text>
  );
}
