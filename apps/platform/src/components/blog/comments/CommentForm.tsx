"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Loader2, AlertCircle, KeyboardIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfilePicture } from "@/lib/avatar-utils";
import { getCurrentUrlPath } from "@/lib/redirect-utils";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { usePathname } from "next/navigation";
import { useCreateCommentMutation } from "@/queries/commentQueries";

type CommentFormProps = {
  blogPostId: string;
  parentId?: string | null;
  onCommentAdded: () => void;
  onCancel?: () => void;
  isReply?: boolean;
};

export function CommentForm({
  blogPostId,
  parentId = null,
  onCommentAdded,
  onCancel,
  isReply = false,
}: CommentFormProps) {
  const { user, isLoading: authLoading } = useUserAuth();
  const { openAuthModal } = useAuthModal();
  const pathname = usePathname();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use the optimized comment mutation hook
  const createCommentMutation = useCreateCommentMutation();

  // Auto-focus the textarea when the component mounts (for reply forms)
  useEffect(() => {
    if (isReply && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isReply]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+Enter (Windows/Linux) or Command+Enter (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (content.trim()) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be signed in to comment");
      return;
    }

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    // Use the authenticated user's email
    const userEmail = user.email;
    if (!userEmail) {
      setError("User email not available. Please sign in again.");
      return;
    }

    console.log("Using email for comment:", userEmail);

    setError(null);

    try {
      // Use the optimized mutation hook with correct tRPC parameter names
      await createCommentMutation.mutateAsync({
        postId: blogPostId,
        parentId: parentId,
        content: content.trim(),
      });

      // Clear the form and notify parent
      setContent("");
      onCommentAdded();

      if (isReply && onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit comment. Please try again.",
      );
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    // Handle sign in with modal
    const handleSignIn = () => {
      console.log("Opening auth modal for comment form");
      openAuthModal("signIn", pathname || "");
    };

    return (
      <div className="rounded-md bg-muted/50 p-4 text-center border border-border/50">
        <p className="text-sm text-muted-foreground mb-3">
          Please sign in to join the conversation
        </p>
        <Button variant="default" size="sm" onClick={handleSignIn}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 comment-form">
      <div className="flex items-start gap-2">
        {user && (
          <div className="flex-shrink-0 mt-1">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={getProfilePicture(
                  {
                    email: user.email || "",
                    name: user.name,
                    picture: (user as any).picture,
                    image: (user as any).image,
                    custom_picture: (user as any).custom_picture,
                    provider: (user as any).provider,
                  },
                  "small",
                )} // Use small size for comment form
                alt={user.name || user.email || "User"}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="object-cover"
              />
              <AvatarFallback className="text-xs">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        <div className="flex-grow relative">
          <div className="relative w-full">
            <Textarea
              ref={textareaRef}
              placeholder={
                isReply ? "Write a reply..." : "What are your thoughts?"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`min-h-[80px] resize-y transition-all duration-200 text-sm border border-gray-300 dark:border-gray-700 focus-visible:ring-primary-600 focus-visible:ring-1 focus-visible:border-primary-600 ${isReply ? "min-h-[60px]" : ""}`}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 flex items-center pointer-events-none">
              <KeyboardIcon className="h-3 w-3 mr-1" />
              <span>Ctrl+Enter to submit</span>
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center error-message">
              <AlertCircle className="h-3 w-3 mr-1" />
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {isReply && onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={createCommentMutation.isPending}
            className="h-8 text-xs font-medium"
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={createCommentMutation.isPending || !content.trim()}
          className="h-8 text-xs font-medium"
        >
          {createCommentMutation.isPending ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              {isReply ? "Posting..." : "Post"}
            </>
          ) : isReply ? (
            "Reply"
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </form>
  );
}
