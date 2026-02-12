import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { SearchBar, CategoryChips, CommunityCard, RefreshableScrollView } from "@/components/ui";
import { useCommunity } from "@/hooks/useCommunity";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { conversationsApi } from "@/services/api";
import { getRandomHelloSticker } from "@/constants/stickers";
import type { Conversation } from "@/services/api/types";

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated);
  const {
    users,
    isLoading,
    error,
    setSearch,
    setFilter,
    refresh,
  } = useCommunity({ enabled: isAuthenticated });

  const communityFilters = [
    { id: "all", emoji: "\uD83C\uDF0D", label: t("community.filterAll") },
    { id: "online", emoji: "\uD83D\uDFE2", label: t("community.filterOnline") },
    { id: "nearby", emoji: "\uD83D\uDCCD", label: t("community.filterNearby") },
    { id: "new", emoji: "\u2728", label: t("community.filterNew") },
  ];

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Fetch existing conversations to know which users already have a chat
  const fetchConversations = useCallback(async () => {
    if (!profile?.publicId) return;
    try {
      const response = await conversationsApi.getByUser(profile.publicId);
      setConversations(response.data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  }, [profile?.publicId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Map: otherUserPublicId → conversationPublicId (for 1:1 chats only)
  const existingChatMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const conv of conversations) {
      if (conv.isGroup) continue;
      for (const p of conv.participants) {
        if (p.publicId !== profile?.publicId) {
          map.set(p.publicId, conv.publicId);
        }
      }
    }
    return map;
  }, [conversations, profile?.publicId]);

  const handleChatPress = useCallback(
    (conversationPublicId: string) => {
      router.push({
        pathname: "/chat/[id]",
        params: { id: conversationPublicId },
      } as never);
    },
    [router]
  );

  const handleWavePress = useCallback(
    async (userPublicId: string) => {
      if (!profile) return;
      try {
        const { data: conversation } = await conversationsApi.create({
          participantIds: [userPublicId],
        });
        const sticker = getRandomHelloSticker();
        await conversationsApi.messages.send(conversation.publicId, {
          type: "STICKER",
          content: sticker.id,
        });
        router.push({
          pathname: "/chat/[id]",
          params: { id: conversation.publicId },
        } as never);
        // Refresh conversations so the card switches to chat icon on return
        fetchConversations();
      } catch (err) {
        console.error("Failed to wave:", err);
      }
    },
    [profile, router, fetchConversations]
  );

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
      <RefreshableScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        onRefresh={refresh}
      >
        {/* Title */}
        <View className="px-4 pt-4 pb-2">
          <Text
            className="font-sans-semibold text-[24px] leading-[32px]"
            style={{ color: theme.text }}
          >
            {t("community.title")}
          </Text>
        </View>

        {/* Search */}
        <View className="px-4 pb-4">
          <SearchBar
            placeholder={t("community.searchPlaceholder")}
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
              {t("common.tryAgain")}
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && users.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text
              style={{ color: theme.textSecondary, textAlign: "center" }}
            >
              {t("community.noResults")}
            </Text>
          </View>
        )}

        {/* User Cards */}
        <View className="gap-4 px-4">
          {users.map((user) => {
            const existingChatId = existingChatMap.get(user.publicId);
            return (
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
                isVip={user.isVip}
                hasExistingChat={!!existingChatId}
                onPress={() =>
                  router.push({
                    pathname: "/profile/[id]",
                    params: { id: user.publicId },
                  })
                }
                onWavePress={() => handleWavePress(user.publicId)}
                onChatPress={() => existingChatId && handleChatPress(existingChatId)}
              />
            );
          })}
        </View>
      </RefreshableScrollView>
    </View>
  );
}
