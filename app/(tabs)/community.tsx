import { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar, CategoryChips, CommunityCard } from "@/components/ui";
import { useCommunity } from "@/hooks/useCommunity";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const communityFilters = [
  { id: "all", emoji: "🌍", label: "All" },
  { id: "online", emoji: "🟢", label: "Online" },
  { id: "nearby", emoji: "📍", label: "Nearby" },
  { id: "new", emoji: "✨", label: "New" },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const {
    users,
    isLoading,
    error,
    setSearch,
    setFilter,
    refresh,
  } = useCommunity({ enabled: isAuthenticated });

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setFilter(filterId);
  };

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
        {/* Title */}
        <View className="px-4 pt-4 pb-2">
          <Text
            className="font-sans-semibold text-[24px] leading-[32px]"
            style={{ color: theme.text }}
          >
            Community
          </Text>
        </View>

        {/* Search */}
        <View className="px-4 pb-4">
          <SearchBar
            placeholder="Search people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFilterPress={() => {}}
          />
        </View>

        {/* Filters */}
        <View className="px-4 pb-4">
          <CategoryChips
            categories={communityFilters}
            selectedId={selectedFilter}
            onSelect={handleFilterChange}
          />
        </View>

        {/* Loading State */}
        {isLoading && users.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}

        {/* Error State */}
        {error && users.length === 0 && (
          <View className="flex-1 items-center justify-center px-4 py-20">
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
              Try Again
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && users.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text
              style={{ color: theme.textSecondary, textAlign: "center" }}
            >
              No people found
            </Text>
          </View>
        )}

        {/* User Cards */}
        <View className="gap-4 px-4">
          {users.map((user) => (
            <CommunityCard
              key={user.publicId}
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              countryCode={user.country?.code}
              languages={user.languages?.map((l) => ({
                code: l.code,
                isLearning: l.isLearning,
              }))}
              bio={user.bio}
              personalityType={user.personalityType}
              city={user.city}
              isOnline={user.isOnline}
              onPress={() =>
                router.push({
                  pathname: "/profile/[id]",
                  params: { id: user.publicId },
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
