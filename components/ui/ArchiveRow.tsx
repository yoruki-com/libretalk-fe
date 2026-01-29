import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ArchiveRowProps {
  count: number;
  onPress?: () => void;
}

export function ArchiveRow({ count, onPress }: ArchiveRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 bg-white px-4 active:bg-light"
    >
      {/* Icon */}
      <View className="h-14 w-14 items-center justify-center">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-light">
          <Ionicons name="archive-outline" size={16} color="#131313" style={{ opacity: 0.4 }} />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 flex-row items-center justify-between border-b border-border py-3">
        <Text className="font-sans-semibold text-[14px] capitalize leading-5 text-dark">
          Archive Chat
        </Text>
        <Text className="font-sans-semibold text-[14px] leading-5 text-primary">
          {count}
        </Text>
      </View>
    </Pressable>
  );
}
