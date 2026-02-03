import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LocationHeader,
  SearchBar,
  CategoryChips,
  VibeCard,
} from "@/components/ui";
import { useVibes } from "@/hooks/useVibes";

// Default categories as fallback
const defaultCategories = [
  { id: "all", emoji: "🔥", label: "All" },
];

export default function VibesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    vibes,
    categories,
    isLoading,
    error,
    toggleLike,
    setCategory,
    setSearch,
    refresh,
  } = useVibes();

  const handleCommentPress = (postId: string) => {
    router.push({
      pathname: "/post/[id]/comments",
      params: { id: postId },
    });
  };

  // Use fetched categories or fallback to defaults
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  // Track selected category locally for UI
  const [selectedCategory, setSelectedCategory] = useState("all");
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
    <View className="flex-1 bg-light" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 py-4">
          <LocationHeader
            location="New York, USA"
            hasNotification
            onLocationPress={() => {}}
            onNotificationPress={() => {}}
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
            categories={displayCategories}
            selectedId={selectedCategory}
            onSelect={handleCategoryChange}
          />
        </View>

        {/* Loading State */}
        {isLoading && vibes.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#6B4EFF" />
          </View>
        )}

        {/* Error State */}
        {error && vibes.length === 0 && (
          <View className="flex-1 items-center justify-center px-4 py-20">
            <Text className="text-red-500 text-center mb-4">{error.message}</Text>
            <Text
              className="text-primary font-semibold"
              onPress={refresh}
            >
              Try Again
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && vibes.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray3 text-center">No vibes found</Text>
          </View>
        )}

        {/* Vibes Feed */}
        <View className="gap-4 px-4">
          {vibes.map((vibe) => (
            <VibeCard
              key={vibe.publicId}
              authorName={vibe.author.displayName}
              authorRole={vibe.author.role || undefined}
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
