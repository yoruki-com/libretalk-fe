import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { DropdownMenu } from "./DropdownMenu";

interface CommentCardProps {
  authorName: string;
  authorUsername: string;
  avatarUrl?: string | null;
  content: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  onLikePress?: () => void;
  onAuthorPress?: () => void;
  onReplyPress?: () => void;
  onMenuPress?: () => void;
  onReportPress?: () => void;
}

export function CommentCard({
  authorName,
  authorUsername,
  avatarUrl,
  content,
  time,
  likes,
  isLiked = false,
  onLikePress,
  onAuthorPress,
  onReportPress,
}: CommentCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const menuItems = [
    {
      key: "report",
      label: t("menu.reportThis"),
      icon: "flag-outline" as const,
      onPress: () => onReportPress?.(),
    },
  ];

  return (
    <View className="flex-row gap-3 px-4 py-3">
      {/* Avatar */}
      <Pressable onPress={onAuthorPress} className="active:opacity-70">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-10 w-10 rounded-full"
            style={{ backgroundColor: theme.surface }}
          />
        ) : (
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <Ionicons name="person" size={20} color={theme.primary} />
          </View>
        )}
      </Pressable>

      {/* Content */}
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Pressable onPress={onAuthorPress} className="active:opacity-70">
            <View className="flex-row items-center gap-2">
              <Text
                className="font-sans-semibold text-[14px]"
                style={{ color: theme.text }}
              >
                {authorName}
              </Text>
              <Text
                className="font-sans text-[12px]"
                style={{ color: theme.textSecondary }}
              >
                @{authorUsername}
              </Text>
            </View>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Text
              className="font-sans text-[12px]"
              style={{ color: theme.textSecondary }}
            >
              {time}
            </Text>
            <DropdownMenu
              items={menuItems}
              triggerSize={16}
              triggerColor={theme.textTertiary}
            />
          </View>
        </View>

        {/* Comment text */}
        <Text
          className="mt-1 font-sans text-[14px] leading-[1.5]"
          style={{ color: theme.text }}
        >
          {content}
        </Text>

        {/* Actions */}
        <View className="mt-2 flex-row items-center gap-4">
          <Pressable
            onPress={onLikePress}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={16}
              color={isLiked ? theme.error : theme.textTertiary}
            />
            {likes > 0 && (
              <Text
                className="font-sans text-[12px]"
                style={{ color: theme.textSecondary }}
              >
                {likes}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
