"use client";

import { useState, useEffect } from "react";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { Comment } from "@/lib/comments-client";
import { Loader2, MessageSquare } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { ActiveReplyProvider } from "@/contexts/ActiveReplyContext";
import { api } from "@/lib/trpc-client";

type CommentSectionProps = {
  blogPostId: string;
  blogPostSlug: string;
  initialComments?: any[]; // Accept pre-fetched comments from server component
};

export function CommentSection({
  blogPostId,
  blogPostSlug,
  initialComments = [],
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(!initialComments.length);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log(
    "[CommentSection] Initial comments:",
    initialComments.length,
    "Current state:",
    comments.length,
    "Loading:",
    isLoading,
  );

  // Use tRPC to fetch comments
  const {
    data: commentsData,
    isLoading: isFetchingComments,
    error: fetchError,
    refetch: refetchComments,
  } = api.blog.getComments.useQuery(
    {
      postId: blogPostId,
      page: 1,
      limit: 50, // Get all comments for now
      includeReplies: true,
      sortBy: "created_at",
      sortOrder: "asc",
    },
    {
      enabled: initialComments.length === 0, // Only fetch if no initial comments
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  // Update loading and error states based on tRPC query
  useEffect(() => {
    setIsLoading(isFetchingComments);
    if (fetchError) {
      setError("Failed to load comments. Please try again.");
    } else {
      setError(null);
    }
  }, [isFetchingComments, fetchError]);

  // Update comments when tRPC data changes
  useEffect(() => {
    if (commentsData?.comments) {
      console.log(
        "[CommentSection] tRPC data received:",
        commentsData.comments.length,
        "comments",
      );
      setComments(commentsData.comments);
    }
  }, [commentsData]);

  // Handle new comment added
  const handleCommentAdded = () => {
    // Refetch comments using tRPC
    refetchComments();

    // Dispatch custom event to notify other components of comment update
    window.dispatchEvent(
      new CustomEvent("engagement-updated", {
        detail: {
          slug: blogPostSlug,
          type: "comment-added",
          timestamp: Date.now(),
        },
      }),
    );
  };

  return (
    <ActiveReplyProvider>
      <motion.section
        className="mt-8 pt-8 border-t border-border/40 max-w-3xl mx-auto min-h-0"
        initial="hidden"
        animate="show"
        variants={fadeIn as Variants}
      >
        {/* Header removed to prevent duplicate - CommentSectionServer already provides the header */}

        <div className="comment-form-container mb-4">
          <CommentForm
            blogPostId={blogPostId}
            onCommentAdded={handleCommentAdded}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200 border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3 mt-2">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                blogPostId={blogPostId}
                onCommentAdded={handleCommentAdded}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-border/50 rounded-md comments-empty-state">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-base font-medium">No comments yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto mb-0">
              Be the first to share your thoughts on this post!
            </p>
          </div>
        )}
      </motion.section>
    </ActiveReplyProvider>
  );
}
