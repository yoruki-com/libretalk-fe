import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { UserBadge, type UserBadgeLanguage } from "./UserBadge";
import { DropdownMenu } from "./DropdownMenu";

interface VibeCardProps {
  authorName: string;
  authorAvatarUrl?: string | null;
  authorCountryCode?: string | null;
  authorLanguages?: UserBadgeLanguage[];
  authorIsVip?: boolean;
  content: string;
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
  onReportPress?: () => void;
  isLiked?: boolean;
}

export function VibeCard({
  authorName,
  authorAvatarUrl,
  authorCountryCode,
  authorLanguages = [],
  authorIsVip = false,
  content,
  mention,
  likes,
  comments,
  onPress,
  onAuthorPress,
  onLikePress,
  onCommentPress,
  onReportPress,
  isLiked = false,
}: VibeCardProps) {
  const { theme, isDark } = useTheme();
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
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-[20px] shadow-sm active:opacity-95"
      style={{
        backgroundColor: theme.card,
        shadowColor: isDark ? "#000000" : "#585858",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 24,
        elevation: 5,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-1">
          <UserBadge
            displayName={authorName}
            avatarUrl={authorAvatarUrl}
            countryCode={authorCountryCode}
            languages={authorLanguages}
            isVip={authorIsVip}
            onPress={onAuthorPress}
          />
        </View>
        <DropdownMenu items={menuItems} triggerColor={theme.iconSecondary} />
      </View>

      {/* Content */}
      <View className="px-4 pb-3">
        <Text
          className="font-sans text-[16px] font-medium leading-[1.4] tracking-wide"
          style={{ color: theme.text }}
        >
          {content}
          {mention && <Text style={{ color: theme.primary }}> @{mention}</Text>}
        </Text>
      </View>

      {/* Stats */}
      <View
        className="flex-row items-center gap-3 px-3 py-4"
        style={{ borderTopWidth: 1, borderTopColor: theme.border }}
      >
        <Pressable
          onPress={onLikePress}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={20}
            color={isLiked ? theme.error : theme.textSecondary}
          />
          <Text
            className="font-sans text-[14px] leading-[1.4] tracking-wide"
            style={{ color: theme.textSecondary }}
          >
            {likes}
          </Text>
        </Pressable>
        <Pressable
          onPress={onCommentPress}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={theme.textSecondary}
          />
          <Text
            className="font-sans text-[14px] leading-[1.4] tracking-wide"
            style={{ color: theme.textSecondary }}
          >
            {comments}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
