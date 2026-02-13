import { CountryFlag, DropdownMenu, type DropdownMenuItem, VibeCard } from "@/components/ui";
import { Routes } from "@/constants/routes";
import { useTheme } from "@/contexts/ThemeContext";
import type { Conversation, UserMe } from "@/services/api/types";
import { usersApi } from "@/services/api/users";
import type { Vibe } from "@/services/api/vibes";
import { vibesApi } from "@/services/api/vibes";
import { likesApi } from "@/services/api/likes";
import { followsApi } from "@/services/api/follows";
import { conversationsApi } from "@/services/api/conversations";
import { getRandomHelloSticker } from "@/constants/stickers";
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
  const [existingConversation, setExistingConversation] = useState<Conversation | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await usersApi.getById(id, currentUser?.publicId);
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
  }, [id, currentUser?.publicId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Check if there's an existing conversation with this user
  useEffect(() => {
    async function checkExistingConversation() {
      if (!currentUser?.publicId || !id || isOwnProfile) return;

      try {
        const response = await conversationsApi.getByUser(currentUser.publicId);
        const conversation = response.data.find(
          (conv) =>
            !conv.isGroup &&
            conv.participants.some((p) => p.publicId === id)
        );
        setExistingConversation(conversation ?? null);
      } catch (err) {
        console.error("[Profile] Failed to check existing conversation:", err);
      }
    }
    checkExistingConversation();
  }, [currentUser?.publicId, id, isOwnProfile]);

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

  const toggleFollow = useCallback(async () => {
    if (!user || !currentUser?.publicId) return;

    const wasFollowing = user.isFollowing;
    // Optimistic update
    setUser((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: !wasFollowing,
            followersCount: wasFollowing
              ? prev.followersCount - 1
              : prev.followersCount + 1,
          }
        : prev
    );

    try {
      const result = await followsApi.toggleFollow(user.publicId, currentUser.publicId);
      // Sync with server
      setUser((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: result.data.following,
              followersCount: result.data.followersCount,
              followingCount: result.data.followingCount,
            }
          : prev
      );
    } catch {
      // Revert on error
      setUser((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: wasFollowing,
              followersCount: wasFollowing
                ? prev.followersCount + 1
                : prev.followersCount - 1,
            }
          : prev
      );
    }
  }, [user, currentUser?.publicId]);

  const handleChatPress = useCallback(async () => {
    if (!id) return;

    // If there's an existing conversation, navigate to it
    if (existingConversation) {
      router.push({
        pathname: Routes.CHAT,
        params: { id: existingConversation.publicId },
      });
      return;
    }

    // Otherwise, create a new conversation and send a wave sticker
    setIsChatLoading(true);
    try {
      const { data: conversation } = await conversationsApi.create({
        participantIds: [id],
      });
      const sticker = getRandomHelloSticker();
      await conversationsApi.messages.send(conversation.publicId, {
        type: "STICKER",
        content: sticker.id,
      });
      router.push({
        pathname: Routes.CHAT,
        params: { id: conversation.publicId },
      });
    } catch (err) {
      console.error("[Profile] Failed to start chat:", err);
    } finally {
      setIsChatLoading(false);
    }
  }, [id, existingConversation, router]);

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

  const profileMenuItems: DropdownMenuItem[] = [
    {
      key: "report",
      label: t("menu.reportThis"),
      icon: "flag-outline",
      onPress: () => {
        Alert.alert(t("menu.reportThis"), "", [{ text: "OK" }]);
      },
    },
  ];

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
            {!isOwnProfile && (
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              >
                <DropdownMenu
                  items={profileMenuItems}
                  triggerSize={20}
                  triggerColor="#FFFFFF"
                />
              </View>
            )}
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

        {/* Avatar overlapping map */}
        <View className="relative px-4" style={{ marginTop: -40 }}>
          {/* Avatar with flag */}
          <View className="relative self-start">
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
                className="absolute -bottom-0.5 -right-0.5 h-8 w-8 items-center justify-center overflow-hidden rounded-full"
                style={{ borderWidth: 2, borderColor: theme.background }}
              >
                <CountryFlag code={user.country.code} size={32} />
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
              {user.followingCount}
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
              {user.followersCount}
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
                        pathname: Routes.POST_COMMENTS,
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
            onPress={toggleFollow}
            className="flex-1 items-center rounded-full py-3 active:opacity-70"
            style={
              user?.isFollowing
                ? { backgroundColor: theme.primary }
                : { borderWidth: 1, borderColor: theme.primary }
            }
          >
            <Text
              className="font-sans-semibold text-[15px]"
              style={{ color: user?.isFollowing ? "#FFFFFF" : theme.primary }}
            >
              {user?.isFollowing ? t("profile.unfollow") : t("profile.follow")}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleChatPress}
            disabled={isChatLoading}
            className="flex-1 items-center rounded-full py-3 active:opacity-70"
            style={{ backgroundColor: theme.primary, opacity: isChatLoading ? 0.7 : 1 }}
          >
            {isChatLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="font-sans-semibold text-[15px] text-white">
                {existingConversation ? t("profile.chat") : t("profile.sayHi")}
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
