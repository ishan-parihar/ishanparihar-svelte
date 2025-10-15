import { getCachedCommentsForPost } from "@/lib/comments-server";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { MessageSquare } from "lucide-react";
import { ActiveReplyProvider } from "@/contexts/ActiveReplyContext";
import { CommentSection } from "./CommentSection";

interface CommentSectionServerProps {
  blogPostId: string;
  blogPostSlug: string;
}

/**
 * Server-side component for displaying comments
 * This component fetches comments using the cached server-side fetcher
 * and renders a client-side CommentSection for interactivity
 */
export async function CommentSectionServer({
  blogPostId,
  blogPostSlug,
}: CommentSectionServerProps) {
  // Fetch comments using the cached server-side fetcher
  const comments = await getCachedCommentsForPost(blogPostId);

  // Count the total number of comments (including replies)
  const countComments = (comments: any[]): number => {
    return comments.reduce((count, comment) => {
      // Add 1 for the current comment
      // Add the count of all replies
      return count + 1 + (comment.replies ? countComments(comment.replies) : 0);
    }, 0);
  };

  const totalComments = countComments(comments);

  return (
    <section className="mt-8 pt-8 border-t border-border/40 max-w-3xl mx-auto min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          Discussion {totalComments > 0 && `(${totalComments})`}
        </h2>
      </div>

      {/*
        We still need to use the client-side CommentSection component for interactivity
        but we pass the pre-fetched comments as initialComments to avoid an extra API call
      */}
      <CommentSection
        blogPostId={blogPostId}
        blogPostSlug={blogPostSlug}
        initialComments={comments}
      />
    </section>
  );
}
