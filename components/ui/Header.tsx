import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onCameraPress?: () => void;
  onNewChatPress?: () => void;
}

export function Header({
  title = "Chatterly",
  onMenuPress,
  onCameraPress,
  onNewChatPress,
}: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      {/* Left - Menu */}
      <View className="w-[76px]">
        <Pressable
          onPress={onMenuPress}
          className="h-8 w-8 items-center justify-center rounded-full bg-light active:opacity-70"
        >
          <View className="flex-row gap-1.5">
            <View className="h-[3px] w-[3px] rounded-full bg-dark" />
            <View className="h-[3px] w-[3px] rounded-full bg-dark" />
            <View className="h-[3px] w-[3px] rounded-full bg-dark" />
          </View>
        </Pressable>
      </View>

      {/* Center - Logo */}
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 bg-gray4" />
        <Text className="font-sans-semibold text-[20px] font-semibold leading-7 text-dark">
          {title}
        </Text>
      </View>

      {/* Right - Actions */}
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onCameraPress}
          className="h-8 w-8 items-center justify-center rounded-full bg-light active:opacity-70"
        >
          <Ionicons name="camera" size={16} color="#131313" />
        </Pressable>
        <Pressable
          onPress={onNewChatPress}
          className="h-8 w-8 items-center justify-center rounded-full bg-primary active:opacity-70"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
