import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Alert, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  LocationHeader,
  SearchBar,
  CategoryChips,
  VibeCard,
} from "@/components/ui";
import { getLocales } from "expo-localization";
import { useVibes } from "@/hooks/useVibes";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Vibe } from "@/services/api/vibes";

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
    error,
    toggleLike,
    setCategory,
    setSearch,
    refresh,
    loadMore,
  } = useVibes({ enabled: hasAccessToken, userPublicId: profile?.publicId });

  const feedFilters = [
    { id: "recent", emoji: "\uD83D\uDD50", label: t("vibes.filterRecent") },
    { id: "for-you", emoji: "\u2728", label: t("vibes.filterForYou") },
    { id: "nearby", emoji: "\uD83D\uDCCD", label: t("vibes.filterNearby") },
    { id: "following", emoji: "\uD83D\uDC65", label: t("vibes.filterFollowing") },
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
    }, [hasAccessToken, refresh])
  );

  const handleCommentPress = (postId: string) => {
    router.push({
      pathname: Routes.POST_COMMENTS,
      params: { id: postId },
    });
  };

  // Track selected category locally for UI
  const [selectedCategory, setSelectedCategory] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCategory(categoryId);
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
            router.push({ pathname: Routes.PROFILE, params: { id: vibe.author.publicId } })
          }
          onCommentPress={() => handleCommentPress(vibe.publicId)}
          onReportPress={() => {
            Alert.alert(t("menu.reportThis"), "", [{ text: "OK" }]);
          }}
        />
      </View>
    ),
    [toggleLike, router, t]
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
          hasNotification
          onNotificationPress={() => {}}
          onAvatarPress={() => {
            if (profile?.publicId) {
              router.push({ pathname: Routes.PROFILE, params: { id: profile.publicId } });
            }
          }}
        />
      </View>

      {/* Search */}
      <View className="px-4 pb-4">
        <SearchBar
          placeholder={t("vibes.searchPlaceholder")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => {}}
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

      {/* Loading State (initial) */}
      {isLoading && vibes.length === 0 && (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Error State */}
      {error && vibes.length === 0 && (
        <View className="items-center justify-center px-4 py-20">
          <Text style={{ color: theme.error, textAlign: "center", marginBottom: 16 }}>
            {error.message}
          </Text>
          <Text style={{ color: theme.primary, fontWeight: "600" }} onPress={refresh}>
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
        refreshing={isLoading && vibes.length === 0}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          isLoadingMore ? (
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
    </View>
  );
}
