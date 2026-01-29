import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LocationHeader,
  SearchBar,
  CategoryChips,
  VibeCard,
} from "@/components/ui";

const categories = [
  { id: "all", emoji: "🔥", label: "All" },
  { id: "music", emoji: "🎵", label: "Music" },
  { id: "art", emoji: "🎨", label: "Art" },
  { id: "food", emoji: "🍕", label: "Food" },
  { id: "sports", emoji: "⚽", label: "Sports" },
];

const vibes = [
  {
    id: "1",
    authorName: "Sarah Johnson",
    authorRole: "Host",
    title: "Amazing sunset vibes at the beach today!",
    mention: "beachlife",
    likes: 124,
    comments: 32,
    shares: 8,
  },
  {
    id: "2",
    authorName: "Mike Chen",
    authorRole: "Creator",
    title: "Just finished this new track, what do you think?",
    mention: "newmusic",
    likes: 89,
    comments: 15,
    shares: 23,
  },
  {
    id: "3",
    authorName: "Emma Wilson",
    authorRole: "Artist",
    title: "My latest painting inspired by the city lights",
    likes: 256,
    comments: 48,
    shares: 12,
  },
];

export default function VibesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedVibes, setLikedVibes] = useState<Set<string>>(new Set());

  const handleLike = (id: string) => {
    setLikedVibes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
            categories={categories}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>

        {/* Vibes Feed */}
        <View className="gap-4 px-4">
          {vibes.map((vibe) => (
            <VibeCard
              key={vibe.id}
              authorName={vibe.authorName}
              authorRole={vibe.authorRole}
              title={vibe.title}
              mention={vibe.mention}
              likes={vibe.likes + (likedVibes.has(vibe.id) ? 1 : 0)}
              comments={vibe.comments}
              shares={vibe.shares}
              isLiked={likedVibes.has(vibe.id)}
              onLikePress={() => handleLike(vibe.id)}
              onPress={() => {}}
              onAuthorPress={() => {}}
              onMenuPress={() => {}}
              onCommentPress={() => {}}
              onSharePress={() => {}}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
