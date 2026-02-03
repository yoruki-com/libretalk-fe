import { useState, useEffect, useCallback } from "react";
import { commentsApi, type Comment } from "@/services/api/vibes";
import { likesApi } from "@/services/api/likes";
import type { PaginationParams } from "@/services/api";

interface UseCommentsOptions {
  postId: string;
  userPublicId?: string;
  autoFetch?: boolean;
}

interface UseCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  addComment: (content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  toggleLike: (commentId: string) => Promise<void>;
}

export function useComments(options: UseCommentsOptions): UseCommentsResult {
  const { postId, userPublicId, autoFetch = true } = options;

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseCommentsResult["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchComments = useCallback(
    async (page: number, append = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const params: PaginationParams = { page, sortBy: "createdAt", sortOrder: "desc" };
        const response = await commentsApi.getByPost(postId, params);

        if (append) {
          setComments((prev) => [...prev, ...response.data]);
        } else {
          setComments(response.data);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch comments"));
      } finally {
        setIsLoading(false);
      }
    },
    [postId]
  );

  const refresh = useCallback(async () => {
    await fetchComments(1, false);
  }, [fetchComments]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage && !isLoading) {
      await fetchComments(currentPage + 1, true);
    }
  }, [fetchComments, pagination, currentPage, isLoading]);

  const addComment = useCallback(
    async (content: string) => {
      if (!userPublicId) {
        setError(new Error("User not authenticated"));
        throw new Error("User not authenticated");
      }
      try {
        const response = await commentsApi.create({
          postId,
          content,
          authorPublicId: userPublicId,
        });
        // Prepend new comment to the list
        setComments((prev) => [response.data, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to add comment"));
        throw err;
      }
    },
    [postId, userPublicId]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        await commentsApi.delete(commentId);
        setComments((prev) => prev.filter((c) => c.publicId !== commentId));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to delete comment"));
        throw err;
      }
    },
    []
  );

  const toggleLike = useCallback(
    async (commentId: string) => {
      const comment = comments.find((c) => c.publicId === commentId);
      if (!comment || !userPublicId) return;

      // Optimistic update
      setComments((prev) =>
        prev.map((c) =>
          c.publicId === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
              }
            : c
        )
      );

      try {
        const result = await likesApi.toggleCommentLike(commentId, userPublicId);
        // Update with server response
        setComments((prev) =>
          prev.map((c) =>
            c.publicId === commentId
              ? {
                  ...c,
                  isLiked: result.data.liked,
                  likesCount: result.data.likesCount,
                }
              : c
          )
        );
      } catch (err) {
        // Revert on error
        setComments((prev) =>
          prev.map((c) =>
            c.publicId === commentId
              ? {
                  ...c,
                  isLiked: comment.isLiked,
                  likesCount: comment.likesCount,
                }
              : c
          )
        );
        setError(err instanceof Error ? err : new Error("Failed to toggle like"));
      }
    },
    [comments, userPublicId]
  );

  useEffect(() => {
    if (autoFetch && postId) {
      fetchComments(1);
    }
  }, [autoFetch, postId, fetchComments]);

  return {
    comments,
    isLoading,
    error,
    pagination,
    refresh,
    loadMore,
    addComment,
    deleteComment,
    toggleLike,
  };
}
