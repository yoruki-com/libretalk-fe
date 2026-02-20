import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Routes } from "@/constants/routes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { VibeCard, CommentCard, CommentInput } from "@/components/ui";
import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { vibesApi, type Vibe } from "@/services/api/vibes";
import { formatRelativeTime } from "@/utils/time";

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated, hasAccessToken } = useAuth();
  const { profile } = useCurrentUser(isAuthenticated && hasAccessToken);

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
  } = useComments({ postId: id, userPublicId: profile?.publicId, enabled: hasAccessToken && !!profile?.publicId });

  // Fetch post once we have a valid token
  React.useEffect(() => {
    if (!hasAccessToken) return;
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
  }, [id, hasAccessToken]);

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
          {t("comments.title")}
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
            <Text style={{ color: theme.primary, fontWeight: "600" }}>{t("common.tryAgain")}</Text>
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
                  onAuthorPress={() => router.push({ pathname: Routes.PROFILE, params: { id: post.author.publicId } })}
                  onReportPress={() => {
                    Alert.alert(t("menu.reportThis"), "", [{ text: "OK" }]);
                  }}
                />
              </View>
            )}

            {/* Comments Section Header */}
            <View className="flex-row items-center justify-between px-4 py-2">
              <Text className="font-sans-semibold text-[14px]" style={{ color: theme.text }}>
                {comments.length > 0
                  ? t("comments.count", { count: comments.length })
                  : t("comments.title")}
              </Text>
            </View>

            {/* Comments List */}
            {comments.length === 0 && !isLoadingComments ? (
              <View className="items-center py-10">
                <Ionicons name="chatbubble-outline" size={48} color={theme.border} />
                <Text className="mt-3 font-sans text-[14px]" style={{ color: theme.textSecondary }}>
                  {t("comments.noComments")}
                </Text>
                <Text className="mt-1 font-sans text-[12px]" style={{ color: theme.textTertiary }}>
                  {t("comments.beFirst")}
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
                    onAuthorPress={() => router.push({ pathname: Routes.PROFILE, params: { id: comment.author.publicId } })}
                    onReplyPress={() => {}}
                    onReportPress={() => {
                      Alert.alert(t("menu.reportThis"), "", [{ text: "OK" }]);
                    }}
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
