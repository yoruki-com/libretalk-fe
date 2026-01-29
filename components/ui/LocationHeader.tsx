import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LocationHeaderProps {
  label?: string;
  location: string;
  onLocationPress?: () => void;
  onNotificationPress?: () => void;
  hasNotification?: boolean;
}

export function LocationHeader({
  label = "My location",
  location,
  onLocationPress,
  onNotificationPress,
  hasNotification = false,
}: LocationHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      {/* Location */}
      <Pressable
        onPress={onLocationPress}
        className="flex-row items-center gap-3 active:opacity-70"
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="location" size={20} color="#014AF1" />
        </View>
        <View>
          <Text className="font-inter text-[14px] leading-[1.6] text-gray">
            {label}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="font-inter-semibold text-[16px] leading-[1.4] text-dark">
              {location}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#131313" />
          </View>
        </View>
      </Pressable>

      {/* Notification */}
      <Pressable
        onPress={onNotificationPress}
        className="relative h-10 w-10 items-center justify-center rounded-full bg-white active:opacity-70"
      >
        <Ionicons name="notifications-outline" size={20} color="#131313" />
        {hasNotification && (
          <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Pressable>
    </View>
  );
}
