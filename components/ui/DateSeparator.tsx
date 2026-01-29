import { View, Text } from "react-native";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <View className="items-center justify-center py-2">
      <Text className="font-inter-semibold text-[14px] capitalize leading-5 text-dark">
        {date}
      </Text>
    </View>
  );
}
