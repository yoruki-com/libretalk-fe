import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { VibeCard, CommentCard, CommentInput } from "@/components/ui";
import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { vibesApi, type Vibe } from "@/services/api/vibes";

// Helper to format relative time
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated);

  const [post, setPost] = useState<Vibe | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postError, setPostError] = useState<Error | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    comments,
    isLoading: isLoadingComments,
    error: commentsError,
    addComment,
    toggleLike,
    refresh,
  } = useComments({ postId: id, userPublicId: profile?.publicId, enabled: isAuthenticated && !!profile?.publicId });

  // Fetch post on mount
  React.useEffect(() => {
    async function fetchPost() {
      try {
        setIsLoadingPost(true);
        const response = await vibesApi.getById(id);
        setPost(response.data);
      } catch (err) {
        setPostError(err instanceof Error ? err : new Error("Failed to load post"));
      } finally {
        setIsLoadingPost(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(commentText.trim());
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingPost || (isLoadingComments && comments.length === 0);
  const error = postError || commentsError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
      >
        <Pressable onPress={handleBack} className="p-1 active:opacity-70">
          <Ionicons name="arrow-back" size={24} color={theme.icon} />
        </Pressable>
        <Text className="font-sans-semibold text-[16px]" style={{ color: theme.text }}>
          Comments
        </Text>
        <View className="w-8" />
      </View>

      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View className="flex-1 items-center justify-center px-4">
          <Text style={{ color: theme.error, textAlign: "center", marginBottom: 16 }}>
            {error.message}
          </Text>
          <Pressable onPress={refresh}>
            <Text style={{ color: theme.primary, fontWeight: "600" }}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Post Card */}
            {post && (
              <View className="p-4">
                <VibeCard
                  authorName={post.author.displayName}
                  authorAvatarUrl={post.author.avatarUrl}
                  authorCountryCode={post.author.countryCode}
                  authorLanguages={post.author.languages}
                  content={post.content ?? ""}
                  likes={post.likesCount}
                  comments={post.commentsCount}
                  shares={0}
                  isLiked={post.isLiked}
                  onAuthorPress={() => router.push({ pathname: "/profile/[id]", params: { id: post.author.publicId } })}
                />
              </View>
            )}

            {/* Comments Section Header */}
            <View className="flex-row items-center justify-between px-4 py-2">
              <Text className="font-sans-semibold text-[14px]" style={{ color: theme.text }}>
                {comments.length > 0
                  ? `${comments.length} Comment${comments.length > 1 ? "s" : ""}`
                  : "Comments"}
              </Text>
            </View>

            {/* Comments List */}
            {comments.length === 0 && !isLoadingComments ? (
              <View className="items-center py-10">
                <Ionicons name="chatbubble-outline" size={48} color={theme.border} />
                <Text className="mt-3 font-sans text-[14px]" style={{ color: theme.textSecondary }}>
                  No comments yet
                </Text>
                <Text className="mt-1 font-sans text-[12px]" style={{ color: theme.textTertiary }}>
                  Be the first to comment!
                </Text>
              </View>
            ) : (
              <View>
                {comments.map((comment) => (
                  <CommentCard
                    key={comment.publicId}
                    authorName={comment.author.displayName}
                    authorUsername={comment.author.username}
                    avatarUrl={comment.author.avatarUrl}
                    content={comment.content}
                    time={formatRelativeTime(comment.createdAt)}
                    likes={comment.likesCount}
                    isLiked={comment.isLiked}
                    onLikePress={() => toggleLike(comment.publicId)}
                    onAuthorPress={() => {}}
                    onReplyPress={() => {}}
                    onMenuPress={() => {}}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* Comment Input */}
          <CommentInput
            value={commentText}
            onChangeText={setCommentText}
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
}
