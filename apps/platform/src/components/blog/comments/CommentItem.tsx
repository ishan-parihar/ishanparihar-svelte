"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  MoreVertical,
  Dot,
  Flag,
  Edit,
  Check,
  X,
  KeyboardIcon,
} from "lucide-react";
import { CommentForm } from "./CommentForm";
import { Comment } from "@/lib/comments-client";
import { useUserAuth } from "@/contexts/UserAuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { relativeTime } from "@/lib/utils";
import { getCurrentUrlPath } from "@/lib/redirect-utils";
import { getProfilePicture } from "@/lib/avatar-utils";
import { useActiveReply } from "@/contexts/ActiveReplyContext";
import { api } from "@/lib/trpc-client";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { usePathname } from "next/navigation";

type CommentItemProps = {
  comment: Comment;
  blogPostId: string;
  onCommentAdded: () => void;
  depth?: number;
  maxDepth?: number;
};

export function CommentItem({
  comment,
  blogPostId,
  onCommentAdded,
  depth = 0,
  maxDepth = 5,
}: CommentItemProps) {
  const { user } = useUserAuth();
  const { openAuthModal } = useAuthModal();
  const pathname = usePathname();
  const {
    activeReplyId,
    setActiveReplyId,
    registerReplyForm,
    unregisterReplyForm,
  } = useActiveReply();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isEditingError, setIsEditingError] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReportingError, setIsReportingError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const reportTextareaRef = useRef<HTMLTextAreaElement>(null);
  const replyFormRef = useRef<HTMLDivElement>(null);

  // Register and unregister the reply form ref
  useEffect(() => {
    registerReplyForm(comment.id, replyFormRef);
    return () => {
      unregisterReplyForm(comment.id);
    };
  }, [comment.id, registerReplyForm, unregisterReplyForm]);

  // Computed property to determine if this comment's reply form is active
  const showReplyForm = activeReplyId === comment.id;

  // Handle keyboard shortcuts for edit form
  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+Enter (Windows/Linux) or Command+Enter (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (editedContent.trim()) {
        handleEditComment();
      }
    }
  };

  // Handle keyboard shortcuts for report form
  const handleReportKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+Enter (Windows/Linux) or Command+Enter (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (reportReason.trim()) {
        handleReportComment();
      }
    }
  };

  // Function to count all nested replies recursively
  const countAllReplies = (comment: Comment): number => {
    if (!comment.replies || comment.replies.length === 0) {
      return 0;
    }

    let count = comment.replies.length;

    // Add counts from all nested replies
    for (const reply of comment.replies) {
      count += countAllReplies(reply);
    }

    return count;
  };

  // Calculate total replies including all nested levels
  const totalRepliesCount = countAllReplies(comment);

  // Toggle comment collapse state - only collapses replies, not the comment itself
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Use relative time
  const timeAgo = relativeTime(comment.created_at);

  const handleReplyClick = () => {
    // Only allow replies if the user is authenticated
    if (user) {
      // Toggle the reply form using the context
      if (activeReplyId === comment.id) {
        setActiveReplyId(null); // Close this form if it's already open
      } else {
        setActiveReplyId(comment.id); // Open this form and close any other
      }
    }
  };

  const handleReplySubmitted = () => {
    setActiveReplyId(null); // Close the reply form
    onCommentAdded();
  };

  const handleCancelReply = () => {
    setActiveReplyId(null); // Close the reply form
  };

  // tRPC mutation for deleting comments
  const deleteCommentMutation = api.blog.deleteComment.useMutation({
    onSuccess: () => {
      onCommentAdded(); // Refresh comments
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
      setDeleteError(error.message || "Failed to delete comment");
    },
  });

  // Handle deleting a comment - mark as deleted by user instead of removing
  const handleDeleteComment = async () => {
    if (!user) {
      setDeleteError("You must be logged in to delete comments");
      return;
    }

    // Add debugging to check user object
    console.log("Delete comment - User object:", {
      email: user.email,
      id: user.id,
    });
    console.log("Delete comment - Comment user_email:", comment.user_email);

    // Check if the user is the author of the comment
    if (!user.email || user.email !== comment.user_email) {
      setDeleteError("You can only delete your own comments");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteCommentMutation.mutateAsync({ id: comment.id });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle editing a comment
  const handleEditComment = async () => {
    if (!user) return;
    if (!editedContent.trim()) {
      setIsEditingError("Comment cannot be empty");
      return;
    }

    // Check if the user is the author of the comment
    if (user.email !== comment.user_email) {
      setIsEditingError("You can only edit your own comments");
      return;
    }

    setIsEditingError(null);

    try {
      console.log(
        "Editing comment:",
        comment.id,
        "with content:",
        editedContent.trim(),
      );

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editedContent.trim(),
          user_email: user.email,
          is_admin: false, // Regular user, not admin
        }),
        credentials: "include", // Include cookies for authentication
      });

      const responseData = await response
        .json()
        .catch(() => ({ error: "Failed to parse response" }));
      console.log("Edit response:", responseData);

      if (!response.ok) {
        throw new Error(responseData?.error || "Failed to edit comment");
      }

      setIsEditing(false);
      onCommentAdded(); // Refresh
    } catch (error) {
      console.error("Error editing comment:", error);
      setIsEditingError(
        error instanceof Error ? error.message : "Failed to edit comment",
      );
    }
  };

  // Handle reporting a comment
  const handleReportComment = async () => {
    if (!user) {
      setIsReportingError("You must be logged in to report a comment");
      return;
    }

    if (!reportReason.trim()) {
      setIsReportingError("Please provide a reason for reporting");
      return;
    }

    setIsReportingError(null);

    try {
      console.log(
        "Reporting comment:",
        comment.id,
        "with reason:",
        reportReason.trim(),
      );

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_reported: true,
          report_reason: reportReason.trim(),
        }),
      });

      const responseData = await response
        .json()
        .catch(() => ({ error: "Failed to parse response" }));
      console.log("Report response:", responseData);

      if (!response.ok) {
        throw new Error(responseData?.error || "Failed to report comment");
      }

      setIsReporting(false);
      alert("Comment reported successfully. A moderator will review it.");
    } catch (error) {
      console.error("Error reporting comment:", error);
      setIsReportingError(
        error instanceof Error ? error.message : "Failed to report comment",
      );
    }
  };

  // Check if the current user is the author of the comment
  // Compare user email with the comment's user_id
  const isCommentAuthor = user?.email === comment.user_email;

  // Placeholder for future vote score implementation
  // const voteScore = 1; // Replace with actual score later

  // Thread line color with light mode fix
  const threadLineColor =
    "border-gray-300 dark:border-gray-600 thread-line-color";

  // Indentation class based on depth - Reddit-style indentation
  // Use a fixed indentation amount for all depths to match Reddit's style
  const indentationClass = depth > 0 ? "pl-5" : "";

  return (
    <>
      <div className={`${indentationClass}`}>
        {/* Container for comment content and its own thread lines */}
        <div className="relative">
          {/* Vertical Thread Line (Connects Parent to this Comment) */}
          {depth > 0 && (
            <div
              className={`absolute top-0 bottom-0 w-[2px] ${threadLineColor} cursor-pointer opacity-60 hover:opacity-100 transition-opacity`}
              // Position to the left of the comment, matching Reddit's style
              style={{ left: "8px" }}
              aria-label={isCollapsed ? "Expand thread" : "Collapse thread"}
              onClick={toggleCollapse}
            />
          )}
          {/* Horizontal Connector (Connects Vertical Line to this Comment's Avatar area) */}
          {depth > 0 && (
            <div
              className={`absolute w-4 h-[20px] ${threadLineColor} opacity-60`}
              // Position to connect with the avatar
              style={{
                top: "10px",
                left: "8px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderBottomLeftRadius: "6px",
              }}
              aria-hidden="true"
            />
          )}

          {/* Main Content Flex Container */}
          {/* Added pl-6 to give space for avatar and thread lines */}
          <div className="flex items-start gap-1.5 mb-1 pl-6 comment-item">
            {/* Avatar & Content Column */}
            <div className="flex-1 pt-0.5 min-w-0">
              {/* Top Row: Avatar, Metadata */}
              <div className="flex items-center gap-1 text-xs mb-0.5 comment-header">
                {/* Avatar positioning adjusted slightly if needed */}
                <Avatar className="h-5 w-5 mr-1 relative z-10">
                  <AvatarImage
                    src={(() => {
                      // Log the comment data for debugging
                      console.log("CommentItem - Comment data:", {
                        id: comment.id,
                        user_email: comment.user_email,
                        user_name: comment.user_name,
                        user_picture: comment.user_picture
                          ? comment.user_picture.length > 30
                            ? comment.user_picture.substring(0, 30) + "..."
                            : comment.user_picture
                          : undefined,
                        user_image: comment.user_image
                          ? comment.user_image.length > 30
                            ? comment.user_image.substring(0, 30) + "..."
                            : comment.user_image
                          : undefined,
                        user_custom_picture: comment.user_custom_picture,
                        user_provider: comment.user_provider,
                      });

                      // Prepare user object for getProfilePicture
                      const userForProfilePicture = {
                        email: comment.user_email || comment.user_id || "",
                        name: comment.user_name,
                        picture: comment.user_picture,
                        // For Google accounts, we need to pass the image property
                        image: comment.user_image,
                        custom_picture: comment.user_custom_picture,
                        provider: comment.user_provider,
                      };

                      console.log(
                        "CommentItem - User object for getProfilePicture:",
                        userForProfilePicture,
                      );

                      // Get the profile picture URL
                      const pictureUrl = getProfilePicture(
                        userForProfilePicture,
                        "small",
                      ); // Use small size for comment items

                      // Log the resulting URL
                      console.log(
                        "CommentItem - Profile picture URL:",
                        pictureUrl,
                      );

                      return pictureUrl;
                    })()}
                    alt={comment.user_name || "User"}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="object-cover"
                  />
                  <AvatarFallback className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {comment.user_name
                      ? comment.user_name.charAt(0).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Metadata */}
                <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap comment-author">
                  {comment.user_name || "Anonymous"}
                </span>
                <Dot
                  size={12}
                  className="text-gray-500 dark:text-gray-400 shrink-0"
                />
                <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap comment-time">
                  {timeAgo}
                </span>
              </div>

              {/* Comment Content Area */}
              <div>
                {comment.is_deleted ? (
                  <div className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 italic">
                    {comment.deleted_by_user ? (
                      "user deleted this message"
                    ) : (
                      <>
                        <span>comment removed by moderator</span>
                        {comment.moderator_comment && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 italic">
                            Reason: {comment.moderator_comment}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mt-0.5 text-sm text-gray-800 dark:text-gray-100 break-words comment-content">
                    {comment.content}
                  </div>
                )}
                {/* Actions Row */}
                {!comment.is_deleted && (
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400 comment-actions">
                    {/* Reply Button - Only shown to authenticated users */}
                    {user ? (
                      <Button
                        onClick={handleReplyClick}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs font-medium"
                      >
                        Reply
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs font-medium"
                        onClick={() => {
                          console.log("Opening auth modal for comment reply");
                          openAuthModal("signIn", pathname || "");
                        }}
                      >
                        Sign in to reply
                      </Button>
                    )}

                    {/* Collapse/Expand Button - Reddit style text button */}
                    {comment.replies && comment.replies.length > 0 && (
                      <Button
                        onClick={toggleCollapse}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs font-medium"
                        aria-label={
                          isCollapsed ? "Expand replies" : "Collapse replies"
                        }
                      >
                        {isCollapsed
                          ? `[+] ${totalRepliesCount} ${totalRepliesCount === 1 ? "reply" : "replies"}`
                          : "[-]"}
                      </Button>
                    )}

                    {/* Action Menu (Dropdown) - Only shown to authenticated users */}
                    {user ? (
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex items-center justify-center relative z-10"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          sideOffset={5}
                          className="w-40 text-xs bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-none dropdown-menu-content"
                        >
                          {isCommentAuthor && (
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400 focus:text-black dark:focus:text-white focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors dropdown-menu-item"
                              onSelect={(e) => {
                                e.preventDefault();
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          )}
                          {!isCommentAuthor && (
                            <DropdownMenuItem
                              onSelect={() => setIsReporting(true)}
                              className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900 text-amber-700 dark:text-amber-400 transition-colors dropdown-menu-item"
                            >
                              <Flag className="h-3.5 w-3.5 mr-2" /> Report
                            </DropdownMenuItem>
                          )}
                          {isCommentAuthor && (
                            <DropdownMenuItem
                              onSelect={() => setIsEditing(true)}
                              className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900 text-neutral-600 dark:text-neutral-400 transition-colors dropdown-menu-item"
                            >
                              <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                    {deleteError && (
                      <p className="text-xs text-destructive ml-1 error-message">
                        {deleteError}
                      </p>
                    )}
                  </div>
                )}

                {/* Reply Form */}
                {showReplyForm && !comment.is_deleted && (
                  <div className="mt-1.5" ref={replyFormRef}>
                    <CommentForm
                      blogPostId={blogPostId}
                      parentId={comment.id}
                      onCommentAdded={handleReplySubmitted}
                      onCancel={handleCancelReply}
                      isReply={true}
                    />
                  </div>
                )}

                {/* Edit Form */}
                {isEditing && !comment.is_deleted && (
                  <div className="mt-1.5">
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          ref={editTextareaRef}
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="min-h-[100px] text-sm resize-y transition-all duration-200 border border-gray-300 dark:border-gray-700 focus-visible:ring-primary-600 focus-visible:ring-1 focus-visible:border-primary-600"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 flex items-center pointer-events-none">
                          <KeyboardIcon className="h-3 w-3 mr-1" />
                          <span>Ctrl+Enter to save</span>
                        </div>
                      </div>
                      {isEditingError && (
                        <p className="text-xs text-destructive error-message">
                          {isEditingError}
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsEditing(false)}
                          className="h-8 text-xs font-medium"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleEditComment}
                          className="h-8 text-xs font-medium"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Form */}
                {isReporting && !comment.is_deleted && (
                  <div className="mt-1.5">
                    <div className="space-y-2">
                      <div className="relative">
                        <Textarea
                          ref={reportTextareaRef}
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          onKeyDown={handleReportKeyDown}
                          placeholder="Please explain why you're reporting this comment"
                          className="min-h-[80px] text-sm resize-y transition-all duration-200 border border-gray-300 dark:border-gray-700 focus-visible:ring-primary-600 focus-visible:ring-1 focus-visible:border-primary-600"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 flex items-center pointer-events-none">
                          <KeyboardIcon className="h-3 w-3 mr-1" />
                          <span>Ctrl+Enter to submit</span>
                        </div>
                      </div>
                      {isReportingError && (
                        <p className="text-xs text-destructive error-message">
                          {isReportingError}
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsReporting(false)}
                          className="h-8 text-xs font-medium"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleReportComment}
                          className="h-8 text-xs font-medium"
                        >
                          <Flag className="h-3.5 w-3.5 mr-1" /> Submit Report
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Replies Container */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-1.5">
                    {/* Render Replies */}
                    {!isCollapsed &&
                      comment.replies.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          blogPostId={blogPostId}
                          onCommentAdded={onCommentAdded}
                          depth={depth + 1}
                          maxDepth={maxDepth}
                        />
                      ))}
                  </div>
                )}

                {/* Max Depth Indicator */}
                {!isCollapsed &&
                  depth >= maxDepth &&
                  comment.replies &&
                  comment.replies.length > 0 && (
                    <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <a href="#" className="hover:underline">
                        Continue this thread...
                      </a>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog - Rendered outside the normal DOM flow */}
      {showDeleteDialog && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="alert-dialog-content">
            <AlertDialogHeader>
              <AlertDialogTitle className="alert-dialog-title">
                Delete Comment?
              </AlertDialogTitle>
              <AlertDialogDescription className="alert-dialog-description">
                This action cannot be undone. It will mark the comment as
                deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-9 px-4 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteComment}
                disabled={isDeleting}
                className="h-9 px-4 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
