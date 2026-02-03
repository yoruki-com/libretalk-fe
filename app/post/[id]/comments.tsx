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
  } = useComments({ postId: id });

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
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray6 px-4 py-3">
        <Pressable onPress={handleBack} className="p-1 active:opacity-70">
          <Ionicons name="arrow-back" size={24} color="#131313" />
        </Pressable>
        <Text className="font-sans-semibold text-[16px] text-dark">Comments</Text>
        <View className="w-8" />
      </View>

      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6B4EFF" />
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center mb-4">{error.message}</Text>
          <Pressable onPress={refresh}>
            <Text className="text-primary font-semibold">Try Again</Text>
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
                  authorRole={post.author.role || undefined}
                  title={post.title}
                  mention={post.mention || undefined}
                  likes={post.likesCount}
                  comments={post.commentsCount}
                  shares={post.sharesCount}
                  isLiked={post.isLiked}
                />
              </View>
            )}

            {/* Comments Section Header */}
            <View className="flex-row items-center justify-between px-4 py-2">
              <Text className="font-sans-semibold text-[14px] text-dark">
                {comments.length > 0
                  ? `${comments.length} Comment${comments.length > 1 ? "s" : ""}`
                  : "Comments"}
              </Text>
            </View>

            {/* Comments List */}
            {comments.length === 0 && !isLoadingComments ? (
              <View className="items-center py-10">
                <Ionicons name="chatbubble-outline" size={48} color="#DADADA" />
                <Text className="mt-3 font-sans text-[14px] text-gray">
                  No comments yet
                </Text>
                <Text className="mt-1 font-sans text-[12px] text-gray3">
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
          <View style={{ paddingBottom: insets.bottom }}>
            <CommentInput
              value={commentText}
              onChangeText={setCommentText}
              onSubmit={handleSubmitComment}
              isSubmitting={isSubmitting}
            />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
