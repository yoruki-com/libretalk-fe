import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  lastSeen?: string;
  isOnline?: boolean;
  unreadCount?: number;
  onBackPress?: () => void;
  onCallPress?: () => void;
  onVideoPress?: () => void;
}

export function ChatHeader({
  name,
  avatar,
  lastSeen,
  isOnline = false,
  unreadCount = 0,
  onBackPress,
  onCallPress,
  onVideoPress,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-b border-border bg-white/50 px-4 pb-4"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center gap-4 py-2">
        {/* Back button */}
        <Pressable
          onPress={onBackPress}
          className="relative h-8 w-8 items-center justify-center rounded-full bg-light active:opacity-70"
        >
          <Ionicons name="chevron-back" size={16} color="#131313" />
          {unreadCount > 0 && (
            <View className="absolute -right-1 -top-1 h-[14px] min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5">
              <Text className="font-sans text-[11px] font-medium text-white">
                {unreadCount}
              </Text>
            </View>
          )}
        </Pressable>

        {/* User info */}
        <View className="flex-1 flex-row items-center gap-4">
          <View className="relative">
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="h-11 w-11 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-11 w-11 items-center justify-center rounded-full bg-gray4">
                <Ionicons name="person" size={20} color="#131313" />
              </View>
            )}
            {isOnline && (
              <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-tertiary" />
            )}
          </View>
          <View>
            <Text className="font-sans-semibold text-[14px] capitalize leading-5 text-dark">
              {name}
            </Text>
            {lastSeen && (
              <Text className="font-sans text-[12px] leading-[15px] tracking-tight text-dark opacity-50">
                {lastSeen}
              </Text>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onCallPress}
            className="h-8 w-8 items-center justify-center rounded-full bg-light active:opacity-70"
          >
            <Ionicons name="call" size={16} color="#131313" />
          </Pressable>
          <Pressable
            onPress={onVideoPress}
            className="h-8 w-8 items-center justify-center rounded-full bg-primary active:opacity-70"
          >
            <Ionicons name="videocam" size={16} color="#F5F5F5" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
