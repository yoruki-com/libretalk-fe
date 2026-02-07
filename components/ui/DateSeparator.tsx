import { View, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const { theme } = useTheme();

  return (
    <View className="items-center justify-center py-2">
      <Text
        className="font-sans-semibold text-[14px] capitalize leading-5"
        style={{ color: theme.textSecondary }}
      >
        {date}
      </Text>
    </View>
  );
}
