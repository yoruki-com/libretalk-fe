import { CategoryChips, LocationHeader, ReportModal, VibeCard } from "@/components/ui";
import { Routes } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { useVibes } from "@/hooks/useVibes";
import { reportsApi } from "@/services/api";
import type { Vibe } from "@/services/api/vibes";
import { useFocusEffect } from "@react-navigation/native";
import { getLocales } from "expo-localization";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const deviceCountryCode = getLocales()[0]?.regionCode ?? null;

export default function VibesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated, hasAccessToken, user: authUser } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated && hasAccessToken);
  const {
    vibes,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    toggleLike,
    setCategory,
    setSearch,
    refresh,
    loadMore,
  } = useVibes({ enabled: hasAccessToken, userPublicId: profile?.publicId, hasLocation: !!(profile?.latitude && profile?.longitude) });
  const { unreadCount, fetchUnreadCount } = useUnreadCount();

  const feedFilters = [
    { id: "recent", emoji: "\uD83D\uDD50", label: t("vibes.filterRecent") },
    { id: "nearby", emoji: "\uD83D\uDCCD", label: t("vibes.filterNearby") },
    {
      id: "following",
      emoji: "\uD83D\uDC65",
      label: t("vibes.filterFollowing"),
    },
  ];

  // Refresh vibes when tab regains focus (sync likes from other pages)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      if (hasAccessToken) {
        refresh();
      }
    }, [hasAccessToken, refresh]),
  );

  // Fetch unread notification count on focus (updates badge after reading notifications)
  useFocusEffect(
    useCallback(() => {
      if (hasAccessToken) {
        fetchUnreadCount();
      }
    }, [hasAccessToken, fetchUnreadCount]),
  );

  // Also fetch unread count on initial mount
  useEffect(() => {
    if (hasAccessToken) {
      fetchUnreadCount();
    }
  }, [hasAccessToken, fetchUnreadCount]);

  const handleCommentPress = (postId: string) => {
    router.push({
      pathname: Routes.POST_COMMENTS,
      params: { id: postId },
    });
  };

  // Report modal state
  const [reportTarget, setReportTarget] = useState<{ postId: string } | null>(null);

  // Track selected category locally for UI
  const [selectedCategory, setSelectedCategory] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle category change — tap again to refresh
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === selectedCategory) {
      refresh();
    } else {
      setSelectedCategory(categoryId);
      setCategory(categoryId);
    }
  };

  // Handle search change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, setSearch]);

  const renderItem = useCallback(
    ({ item: vibe }: { item: Vibe }) => (
      <View className="px-4">
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
          onLikePress={() => toggleLike(vibe.publicId)}
          onPress={() => {}}
          onAuthorPress={() =>
            router.push({
              pathname: Routes.PROFILE,
              params: { id: vibe.author.publicId },
            })
          }
          onCommentPress={() => handleCommentPress(vibe.publicId)}
          onReportPress={() => setReportTarget({ postId: vibe.publicId })}
        />
      </View>
    ),
    [toggleLike, router, t],
  );

  const ListHeader = (
    <View style={{ backgroundColor: theme.surface }}>
      {/* Header */}
      <View className="px-4 py-4">
        <LocationHeader
          displayName={profile?.displayName ?? authUser?.name}
          avatarUrl={profile?.avatarUrl ?? authUser?.avatar}
          countryCode={profile?.country?.code ?? deviceCountryCode}
          languages={profile?.languages}
          notificationCount={unreadCount}
          onNotificationPress={() => router.push(Routes.NOTIFICATIONS as never)}
          onComposePress={() => router.push(Routes.VIBE_CREATE as never)}
          onAvatarPress={() => {
            if (profile?.publicId) {
              router.push({
                pathname: Routes.PROFILE,
                params: { id: profile.publicId },
              });
            }
          }}
        />
      </View>

      {/* Categories */}
      <View className="px-4 pb-4">
        <CategoryChips
          categories={feedFilters}
          selectedId={selectedCategory}
          onSelect={handleCategoryChange}
        />
      </View>

      {/* Error State */}
      {error && vibes.length === 0 && (
        <View className="items-center justify-center px-4 py-20">
          <Text
            style={{
              color: theme.error,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {error.message}
          </Text>
          <Text
            style={{ color: theme.primary, fontWeight: "600" }}
            onPress={refresh}
          >
            {t("common.tryAgain")}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.surface }}
    >
      <FlatList
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20, gap: 16 }}
        data={vibes}
        keyExtractor={(item) => item.publicId}
        renderItem={renderItem}
        onRefresh={refresh}
        refreshing={isRefreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          isLoading || isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <View className="items-center justify-center py-20">
              <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
                {t("vibes.noResults")}
              </Text>
            </View>
          ) : null
        }
      />
      <ReportModal
        visible={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        onSubmit={async (reason, description) => {
          await reportsApi.reportPost({ reason, postId: reportTarget!.postId, description });
          Alert.alert(t("report.success"));
        }}
      />
    </View>
  );
}
