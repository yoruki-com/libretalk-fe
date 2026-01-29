import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VibeCardProps {
  authorName: string;
  authorRole?: string;
  title: string;
  mention?: string;
  likes: number;
  comments: number;
  shares: number;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onMenuPress?: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  isLiked?: boolean;
}

export function VibeCard({
  authorName,
  authorRole = "Host",
  title,
  mention,
  likes,
  comments,
  shares,
  onPress,
  onAuthorPress,
  onMenuPress,
  onLikePress,
  onCommentPress,
  onSharePress,
  isLiked = false,
}: VibeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-[20px] bg-white shadow-sm active:opacity-95"
      style={{
        shadowColor: "#585858",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 5,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={onAuthorPress}
          className="flex-row items-center gap-2 active:opacity-70"
        >
          {/* Avatar placeholder */}
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-30">
            <Ionicons name="person" size={20} color="#014AF1" />
          </View>
          <View>
            <Text className="font-sans-semibold text-[14px] leading-[1.6] text-dark">
              {authorName}
            </Text>
            <Text className="font-sans text-[12px] leading-[1.6] text-gray">
              {authorRole}
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={onMenuPress} className="p-2 active:opacity-70">
          <Ionicons name="ellipsis-horizontal" size={20} color="#131313" />
        </Pressable>
      </View>

      {/* Image placeholder */}
      <View className="mx-3 h-[200px] rounded-lg bg-gray4" />

      {/* Title */}
      <View className="px-3 py-3">
        <Text className="font-sans text-[16px] font-medium leading-[1.4] tracking-wide text-dark">
          {title}
          {mention && (
            <Text className="text-primary"> @{mention}</Text>
          )}
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row items-center gap-3 border-t border-gray6 px-3 py-4">
        <Pressable
          onPress={onLikePress}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={20}
            color={isLiked ? "#E53935" : "#5D5D5D"}
          />
          <Text className="font-sans text-[14px] leading-[1.4] tracking-wide text-[#5D5D5D]">
            {likes}
          </Text>
        </Pressable>
        <Pressable
          onPress={onCommentPress}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Ionicons name="chatbubble-outline" size={20} color="#5D5D5D" />
          <Text className="font-sans text-[14px] leading-[1.4] tracking-wide text-[#5D5D5D]">
            {comments}
          </Text>
        </Pressable>
        <Pressable
          onPress={onSharePress}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Ionicons name="share-social-outline" size={20} color="#5D5D5D" />
          <Text className="font-sans text-[14px] leading-[1.4] tracking-wide text-[#5D5D5D]">
            {shares}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
