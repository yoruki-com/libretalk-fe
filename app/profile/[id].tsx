import { VibeCard } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import type { UserMe } from "@/services/api/types";
import { usersApi } from "@/services/api/users";
import type { Vibe } from "@/services/api/vibes";
import { vibesApi } from "@/services/api/vibes";
import { likesApi } from "@/services/api/likes";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATIC_MAP_PLACEHOLDER =
  "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/0,20,2,0/600x300@2x?access_token=placeholder";

type ProfileTab = "profile" | "vibes" | "honor";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { profile: currentUser } = useCurrentUser(isAuthenticated);
  const isOwnProfile = !!(currentUser && id && currentUser.publicId === id);

  const [user, setUser] = useState<UserMe | null>(null);
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("vibes");
  const [bioExpanded, setBioExpanded] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await usersApi.getById(id);
      setUser(res.data as UserMe);

      try {
        const vibesRes = await vibesApi.getByUser(id);
        setVibes(vibesRes.data);
      } catch (vibesErr) {
        console.error("[Profile] Failed to fetch vibes:", vibesErr);
      }
    } catch (err) {
      console.error("[Profile] Failed to fetch user:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Refresh vibes when screen regains focus (sync likes from other pages)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      if (id) {
        vibesApi.getByUser(id).then((res) => setVibes(res.data)).catch(() => {});
      }
    }, [id])
  );

  const toggleLike = useCallback(
    async (vibeId: string) => {
      const vibe = vibes.find((v) => v.publicId === vibeId);
      if (!vibe || !currentUser?.publicId) return;

      // Optimistic update
      setVibes((prev) =>
        prev.map((v) =>
          v.publicId === vibeId
            ? {
                ...v,
                isLiked: !v.isLiked,
                likesCount: v.isLiked ? v.likesCount - 1 : v.likesCount + 1,
              }
            : v
        )
      );

      try {
        const result = await likesApi.togglePostLike(vibeId, currentUser.publicId);
        // Sync with server response
        setVibes((prev) =>
          prev.map((v) =>
            v.publicId === vibeId
              ? {
                  ...v,
                  isLiked: result.data.liked,
                  likesCount: result.data.likesCount,
                }
              : v
          )
        );
      } catch {
        // Revert on error
        setVibes((prev) =>
          prev.map((v) =>
            v.publicId === vibeId
              ? {
                  ...v,
                  isLiked: vibe.isLiked,
                  likesCount: vibe.likesCount,
                }
              : v
          )
        );
      }
    },
    [vibes, currentUser?.publicId]
  );

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <Text style={{ color: theme.textSecondary }}>{t("profile.userNotFound")}</Text>
      </View>
    );
  }

  const spokenLanguages = (user.languages ?? []).filter((l) => !l.isLearning);
  const learningLanguages = (user.languages ?? []).filter((l) => l.isLearning);
  const bioText = user.bio ?? "";
  const shouldTruncateBio = bioText.length > 120;
  const totalLikes = vibes.reduce((sum, v) => sum + v.likesCount, 0);
  const totalComments = vibes.reduce((sum, v) => sum + v.commentsCount, 0);

  const tabs = [
    { key: "profile" as const, label: t("profile.tabProfile") },
    { key: "vibes" as const, label: t("profile.tabVibes") },
    { key: "honor" as const, label: t("profile.tabHonor") },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Map Header */}
        <View className="relative" style={{ height: 220 }}>
          <Image
            source={{
              uri: STATIC_MAP_PLACEHOLDER,
            }}
            className="h-full w-full"
            resizeMode="cover"
            style={{ backgroundColor: isDark ? "#1A2332" : "#C8D6E5" }}
          />
          <View
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
          />

          {/* Nav buttons */}
          <View
            className="absolute left-0 right-0 flex-row items-center justify-between px-4"
            style={{ top: insets.top + 4 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Location label */}
          {user.city && (
            <View
              className="absolute bottom-3 right-3 flex-row items-center gap-1 rounded-full px-3 py-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <Ionicons name="location" size={12} color="#FFFFFF" />
              <Text className="font-sans text-[11px] text-white">
                {user.city}
                {user.country ? `, ${user.country.name}` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Avatar + Likes overlapping map */}
        <View className="relative px-4" style={{ marginTop: -40 }}>
          <View className="flex-row items-end justify-between">
            {/* Avatar with flag */}
            <View className="relative">
              <View
                className="h-20 w-20 overflow-hidden rounded-full"
                style={{ borderWidth: 3, borderColor: theme.background }}
              >
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    className="h-full w-full"
                  />
                ) : (
                  <View
                    className="h-full w-full items-center justify-center"
                    style={{ backgroundColor: theme.card }}
                  >
                    <Ionicons name="person" size={36} color={theme.primary} />
                  </View>
                )}
              </View>
              {user.country && (
                <View
                  className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center overflow-hidden rounded-full"
                  style={{ borderWidth: 2, borderColor: theme.background }}
                >
                  <Image
                    source={{
                      uri: `https://flagcdn.com/w80/${user.country.code.toLowerCase()}.png`,
                    }}
                    className="h-7 w-7"
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            {/* Likes */}
            {!isOwnProfile && (
              <View className="mb-2 flex-row items-center gap-1">
                <Ionicons name="thumbs-up" size={18} color={theme.primary} />
                <Text
                  className="font-sans-semibold text-[15px]"
                  style={{ color: theme.primary }}
                >
                  {totalLikes}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* User Info */}
        <View className="px-4 pt-3">
          {/* Name row */}
          <View className="flex-row items-center gap-2">
            <Text
              className="font-sans-semibold text-[22px]"
              style={{ color: theme.text }}
            >
              {user.displayName}
            </Text>
            {user.isVip && (
              <Ionicons name="shield-checkmark" size={18} color={theme.primary} />
            )}
            {user.isOnline && (
              <View className="flex-row items-center gap-1">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: theme.success }}
                />
                <Text
                  className="font-sans text-[12px]"
                  style={{ color: theme.success }}
                >
                  {t("profile.activeNow")}
                </Text>
              </View>
            )}
          </View>

          {/* Username */}
          <Text
            className="font-sans text-[13px] pt-0.5"
            style={{ color: theme.textSecondary }}
          >
            @{user.username}
          </Text>
        </View>

        {/* Languages */}
        {(user.languages ?? []).length > 0 && (
          <View className="mt-3 flex-row items-center gap-3 px-4">
            {spokenLanguages.map((lang) => (
              <View key={lang.code} className="items-center">
                <Text
                  className="font-sans-semibold text-[14px] uppercase"
                  style={{ color: theme.text }}
                >
                  {lang.code}
                </Text>
                <Text
                  className="font-sans text-[10px]"
                  style={{ color: theme.textTertiary }}
                >
                  {lang.name}
                </Text>
              </View>
            ))}
            {learningLanguages.length > 0 && spokenLanguages.length > 0 && (
              <Ionicons
                name="swap-horizontal"
                size={16}
                color={theme.textTertiary}
              />
            )}
            {learningLanguages.map((lang) => (
              <View key={lang.code} className="items-center">
                <Text
                  className="font-sans-semibold text-[14px] uppercase"
                  style={{ color: theme.primary }}
                >
                  {lang.code}
                </Text>
                <Text
                  className="font-sans text-[10px]"
                  style={{ color: theme.textTertiary }}
                >
                  {lang.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View className="mt-4 flex-row items-center gap-4 px-4">
          <View className="flex-row items-center gap-1">
            <Text
              className="font-sans-semibold text-[14px]"
              style={{ color: theme.text }}
            >
              0
            </Text>
            <Text
              className="font-sans text-[13px]"
              style={{ color: theme.textSecondary }}
            >
              {t("profile.following")}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text
              className="font-sans-semibold text-[14px]"
              style={{ color: theme.text }}
            >
              0
            </Text>
            <Text
              className="font-sans text-[13px]"
              style={{ color: theme.textSecondary }}
            >
              {t("profile.followers")}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text
              className="font-sans-semibold text-[14px]"
              style={{ color: theme.text }}
            >
              0d
            </Text>
            <Text
              className="font-sans text-[13px]"
              style={{ color: theme.textSecondary }}
            >
              {t("profile.streak")}
            </Text>
          </View>
        </View>

        {/* Bio */}
        {bioText.length > 0 && (
          <View className="mt-3 px-4">
            <Text
              className="font-sans text-[14px] leading-5"
              style={{ color: theme.text }}
              numberOfLines={bioExpanded ? undefined : 3}
            >
              {bioText}
            </Text>
            {shouldTruncateBio && !bioExpanded && (
              <Pressable onPress={() => setBioExpanded(true)}>
                <Text
                  className="font-sans-semibold text-[13px] mt-0.5"
                  style={{ color: theme.primary }}
                >
                  {t("common.more")}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Tabs */}
        <View
          className="mt-4 flex-row"
          style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className="flex-1 items-center py-3"
              >
                <Text
                  className={`font-sans${isActive ? "-semibold" : ""} text-[14px]`}
                  style={{
                    color: isActive ? theme.text : theme.textSecondary,
                  }}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View
                    className="absolute bottom-0 h-[2px] w-16 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Tab Content */}
        {activeTab === "vibes" && (
          <View className="px-4 pt-4">
            {/* Moment stats */}
            <View className="flex-row items-center gap-4 pb-4">
              <Text
                className="font-sans text-[13px]"
                style={{ color: theme.textSecondary }}
              >
                <Text
                  className="font-sans-semibold"
                  style={{ color: theme.text }}
                >
                  {vibes.length}
                </Text>{" "}
                {t("profile.tabVibes")}
              </Text>
              <Text
                className="font-sans text-[13px]"
                style={{ color: theme.textSecondary }}
              >
                <Text
                  className="font-sans-semibold"
                  style={{ color: theme.text }}
                >
                  {totalLikes}
                </Text>{" "}
                {t("profile.likes")}
              </Text>
              <Text
                className="font-sans text-[13px]"
                style={{ color: theme.textSecondary }}
              >
                <Text
                  className="font-sans-semibold"
                  style={{ color: theme.text }}
                >
                  {totalComments}
                </Text>{" "}
                {t("profile.comments")}
              </Text>
            </View>

            {/* Posts */}
            <View className="gap-4 pb-24">
              {vibes.map((vibe) => (
                <View key={vibe.publicId}>
                  <VibeCard
                    authorName={vibe.author.displayName}
                    authorAvatarUrl={vibe.author.avatarUrl}
                    authorCountryCode={vibe.author.countryCode}
                    authorLanguages={vibe.author.languages}
                    authorIsVip={vibe.author.isVip}
                    content={vibe.content ?? ""}
                    likes={vibe.likesCount}
                    comments={vibe.commentsCount}
                    shares={0}
                    isLiked={vibe.isLiked}
                    onPress={() => {}}
                    onLikePress={() => toggleLike(vibe.publicId)}
                    onCommentPress={() =>
                      router.push({
                        pathname: "/post/[id]/comments",
                        params: { id: vibe.publicId },
                      })
                    }
                    onReportPress={() => {
                      Alert.alert(t("menu.reportThis"), "", [{ text: "OK" }]);
                    }}
                  />
                </View>
              ))}
              {vibes.length === 0 && (
                <Text
                  className="py-8 text-center font-sans text-[14px]"
                  style={{ color: theme.textSecondary }}
                >
                  {t("vibes.noVibesYet")}
                </Text>
              )}
            </View>
          </View>
        )}

        {activeTab === "profile" && (
          <View className="items-center justify-center px-4 py-12">
            <Text
              className="font-sans text-[14px]"
              style={{ color: theme.textSecondary }}
            >
              {t("profile.profileComingSoon")}
            </Text>
          </View>
        )}

        {activeTab === "honor" && (
          <View className="items-center justify-center px-4 py-12">
            <Text
              className="font-sans text-[14px]"
              style={{ color: theme.textSecondary }}
            >
              {t("profile.honorComingSoon")}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {!isOwnProfile && (
        <View
          className="absolute bottom-0 left-0 right-0 flex-row items-center gap-3 px-4"
          style={{
            paddingBottom: insets.bottom + 12,
            paddingTop: 12,
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Pressable
            className="flex-1 items-center rounded-full border py-3 active:opacity-70"
            style={{ borderColor: theme.primary }}
          >
            <Text
              className="font-sans-semibold text-[15px]"
              style={{ color: theme.primary }}
            >
              {t("profile.follow")}
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-full py-3 active:opacity-70"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="font-sans-semibold text-[15px] text-white">
              {t("profile.sayHi")}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
