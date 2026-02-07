import { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

const deviceCountryCode = getLocales()[0]?.regionCode ?? null;

const feedFilters = [
  { id: "recent", emoji: "🕐", label: "Recent" },
  { id: "for-you", emoji: "✨", label: "For You" },
  { id: "nearby", emoji: "📍", label: "Nearby" },
  { id: "following", emoji: "👥", label: "Following" },
];

export default function VibesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated, user: authUser } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated);
  const {
    vibes,
    isLoading,
    error,
    toggleLike,
    setCategory,
    setSearch,
    refresh,
  } = useVibes({ enabled: isAuthenticated });

  const handleCommentPress = (postId: string) => {
    router.push({
      pathname: "/post/[id]/comments",
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

  return (
    <View
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.surface }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 py-4">
          <LocationHeader
            displayName={profile?.displayName ?? authUser?.name}
            avatarUrl={profile?.avatarUrl ?? authUser?.avatar}
            countryCode={profile?.country?.code ?? deviceCountryCode}
            languages={profile?.languages}
            hasNotification
            onNotificationPress={() => {}}
            onAvatarPress={() => {}}
          />
        </View>

        {/* Search */}
        <View className="px-4 pb-4">
          <SearchBar
            placeholder="Search vibes..."
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

        {/* Loading State */}
        {isLoading && vibes.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}

        {/* Error State */}
        {error && vibes.length === 0 && (
          <View className="flex-1 items-center justify-center px-4 py-20">
            <Text style={{ color: theme.error, textAlign: "center", marginBottom: 16 }}>
              {error.message}
            </Text>
            <Text
              style={{ color: theme.primary, fontWeight: "600" }}
              onPress={refresh}
            >
              Try Again
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && vibes.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
              No vibes found
            </Text>
          </View>
        )}

        {/* Vibes Feed */}
        <View className="gap-4 px-4">
          {vibes.map((vibe) => (
            <VibeCard
              key={vibe.publicId}
              authorName={vibe.author.displayName}
              authorAvatarUrl={vibe.author.avatarUrl}
              authorCountryCode={vibe.author.countryCode}
              authorLanguages={vibe.author.languages}
              title={vibe.title}
              mention={vibe.mention || undefined}
              likes={vibe.likesCount}
              comments={vibe.commentsCount}
              shares={vibe.sharesCount}
              isLiked={vibe.isLiked}
              onLikePress={() => toggleLike(vibe.publicId)}
              onPress={() => {}}
              onAuthorPress={() => {}}
              onMenuPress={() => {}}
              onCommentPress={() => handleCommentPress(vibe.publicId)}
              onSharePress={() => {}}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
