import type { Theme } from "@/constants/theme";
import { View } from "react-native";

interface DividerProps {
  theme: Pick<Theme, "border">;
}

export function Divider({ theme }: DividerProps) {
  return (
    <View
      className="mx-4"
      style={{ height: 1, backgroundColor: theme.border }}
    />
  );
}
