"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  Flag,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getBlogPostSlugFromIdClient } from "@/lib/comments-client";
import { motion } from "framer-motion";
import { getProfilePicture } from "@/lib/avatar-utils";
import { api } from "@/lib/trpc-client";

// Define the Comment type
type Comment = {
  id: string;
  blog_post_id: string;
  blog_post_title?: string; // Will be populated when fetching
  user_id: string;
  user_email?: string; // Will be populated when fetching
  user_name?: string; // Will be populated when fetching
  user_picture?: string; // Will be populated when fetching
  user_image?: string; // For Google accounts, this will be populated with the same value as user_picture
  user_custom_picture?: boolean; // Flag to indicate if using custom picture
  user_provider?: string; // Provider (google, credentials, etc.)
  parent_id: string | null;
  content: string;
  is_approved: boolean;
  is_deleted: boolean;
  deleted_by_user?: boolean; // Flag to indicate if deleted by user or admin
  moderator_comment?: string; // Comment from moderator explaining deletion reason
  is_reported?: boolean; // Flag for reported comments
  report_reason?: string; // Reason for reporting
  created_at: string;
  updated_at: string;
  replies?: Comment[]; // For nested comments
};

type AdminCommentsClientProps = {
  initialComments: Comment[];
};

// Component to handle post links with slug fetching
function PostLink({
  blogPostId,
  blogPostTitle,
}: {
  blogPostId: string;
  blogPostTitle: string;
}) {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSlug() {
      if (blogPostId) {
        const postSlug = await getBlogPostSlugFromIdClient(blogPostId);
        setSlug(postSlug);
      }
    }

    fetchSlug();
  }, [blogPostId]);

  return (
    <a
      href={
        slug
          ? `/blog/${slug}`
          : `/admin/blog?search=${encodeURIComponent(blogPostTitle)}`
      }
      className="text-xs truncate block max-w-[150px] text-neutral-800 hover:underline dark:text-neutral-200"
      title={blogPostTitle}
      target="_blank"
      rel="noopener noreferrer"
    >
      {blogPostTitle}
    </a>
  );
}

export function AdminCommentsClient({
  initialComments,
}: AdminCommentsClientProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();

  // tRPC query for comments
  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
  } = api.blog.getAllComments.useQuery(
    {
      page: 1,
      limit: 100, // Maximum allowed by schema
      sortBy: "created_at",
      sortOrder: "desc",
      status: "all",
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const comments = commentsData?.comments || initialComments;

  // tRPC mutations for comment moderation
  const moderateCommentMutation = api.blog.moderateComment.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error moderating comment:", error);
      setActionError(
        error.message || "Failed to moderate comment. Please try again.",
      );
    },
  });

  // Handle query error
  if (error) {
    console.error("Error fetching comments:", error);
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter comments based on active tab
  const filteredComments = comments.filter((comment) => {
    if (activeTab === "approved")
      return comment.is_approved && !comment.is_deleted;
    if (activeTab === "deleted") return comment.is_deleted;
    if (activeTab === "reported") return comment.is_reported === true;
    return true;
  });

  // Handle approving a comment
  const handleApprove = async (commentId: string) => {
    setActionError(null);

    try {
      await moderateCommentMutation.mutateAsync({
        commentId,
        action: "approve",
      });
    } catch (error) {
      console.error("Error approving comment:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  // State for moderator comment dialog
  const [isModeratorCommentDialogOpen, setIsModeratorCommentDialogOpen] =
    useState(false);
  const [moderatorComment, setModeratorComment] = useState("");
  const [commentToModerateId, setCommentToModerateId] = useState<string | null>(
    null,
  );

  // Open the moderator comment dialog
  const openModeratorCommentDialog = (commentId: string) => {
    setCommentToModerateId(commentId);
    setModeratorComment("");
    setIsModeratorCommentDialogOpen(true);
  };

  // Handle marking a comment as moderator deleted
  const handleModeratorDelete = async (
    commentId: string,
    moderatorComment: string = "",
  ) => {
    setActionError(null);

    try {
      await moderateCommentMutation.mutateAsync({
        commentId,
        action: "delete",
        moderatorComment,
      });
    } catch (error) {
      console.error("Error marking comment as moderator deleted:", error);
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsModeratorCommentDialogOpen(false);
    }
  };

  // Handle marking a comment as user deleted
  const handleUserDelete = async (commentId: string) => {
    setActionError(null);

    try {
      await moderateCommentMutation.mutateAsync({
        commentId,
        action: "delete",
        userDeleted: true,
      });
    } catch (error) {
      console.error("Error marking comment as user deleted:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  // Handle permanently deleting a comment
  const handlePermanentDelete = async (commentId: string) => {
    setActionError(null);

    try {
      await moderateCommentMutation.mutateAsync({
        commentId,
        action: "permanent_delete",
      });
    } catch (error) {
      console.error("Error permanently deleting comment:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  // Handle restoring a deleted comment
  const handleRestore = async (commentId: string) => {
    setActionError(null);

    try {
      await moderateCommentMutation.mutateAsync({
        commentId,
        action: "restore",
      });
    } catch (error) {
      console.error("Error restoring comment:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  // Handle clearing a reported comment
  const handleClearReport = async (commentId: string) => {
    setActionError(null);

    try {
      await moderateCommentMutation.mutateAsync({
        commentId,
        action: "clear_report",
      });
    } catch (error) {
      console.error("Error clearing report:", error);
      // Error handling is done in the mutation's onError callback
    }
  };

  return (
    <>
      {/* Moderator Comment Dialog */}
      <Dialog
        open={isModeratorCommentDialogOpen}
        onOpenChange={setIsModeratorCommentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderator Comment</DialogTitle>
            <DialogDescription>
              Add an optional comment explaining why this comment is being
              removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="moderator-comment">
                Reason for removal (optional)
              </Label>
              <Textarea
                id="moderator-comment"
                placeholder="Enter reason for removal..."
                value={moderatorComment}
                onChange={(e) => setModeratorComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModeratorCommentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                commentToModerateId &&
                handleModeratorDelete(commentToModerateId, moderatorComment)
              }
              disabled={isLoading}
              className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {isLoading ? "Removing..." : "Remove Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Comments Management</h1>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {(actionError || error) && (
        <div className="mb-6 rounded-none border border-neutral-200 dark:border-neutral-800 p-4 text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900">
          {actionError ||
            (error instanceof Error
              ? error.message
              : "Failed to load comments")}
        </div>
      )}

      {isLoading && (
        <div className="mb-6 rounded-none border border-neutral-200 dark:border-neutral-800 p-4 text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900 flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading comments...
        </div>
      )}

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="deleted">Deleted</TabsTrigger>
          <TabsTrigger value="reported">Reported</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabular Comments Management */}
      <div className="overflow-x-auto">
        {filteredComments.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-900 text-left">
                <th className="px-4 py-2 text-xs font-medium">User</th>
                <th className="px-4 py-2 text-xs font-medium">Post</th>
                <th className="px-4 py-2 text-xs font-medium">Comment</th>
                <th className="px-4 py-2 text-xs font-medium">Status</th>
                <th className="px-4 py-2 text-xs font-medium">Date</th>
                <th className="px-4 py-2 text-xs font-medium">Mod Comment</th>
                <th className="px-4 py-2 text-xs font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((comment) => (
                <motion.tr
                  key={comment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900/50"
                >
                  {/* User Column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={getProfilePicture(
                            {
                              email:
                                comment.user_email || comment.user_id || "",
                              name: comment.user_name,
                              picture: comment.user_picture,
                              // For Google accounts, we need to pass the image property
                              image: comment.user_image,
                              custom_picture: comment.user_custom_picture,
                              provider: comment.user_provider,
                            },
                            "small",
                          )} // Use small size for admin comment list
                          alt={comment.user_name || "User"}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="object-cover" // Added object-cover class for consistent image display
                        />
                        <AvatarFallback className="text-xs">
                          {comment.user_name
                            ? comment.user_name.charAt(0).toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium truncate max-w-[100px]">
                        {comment.user_name || "Anonymous"}
                      </span>
                    </div>
                  </td>

                  {/* Post Column */}
                  <td className="px-4 py-3">
                    <PostLink
                      blogPostId={comment.blog_post_id}
                      blogPostTitle={comment.blog_post_title || "Unknown Post"}
                    />
                  </td>

                  {/* Comment Column */}
                  <td className="px-4 py-3">
                    <div className="max-w-[250px]">
                      <p className="text-xs truncate" title={comment.content}>
                        {comment.content}
                      </p>
                      {comment.is_reported && comment.report_reason && (
                        <div className="mt-1 flex items-center">
                          <AlertTriangle className="h-3 w-3 text-neutral-700 dark:text-neutral-300 mr-1" />
                          <span
                            className="text-xs text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]"
                            title={comment.report_reason}
                          >
                            {comment.report_reason}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {comment.is_approved && !comment.is_deleted && (
                        <Badge
                          variant="success"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          Approved
                        </Badge>
                      )}
                      {!comment.is_approved && !comment.is_deleted && (
                        <Badge
                          variant="pending"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          Pending
                        </Badge>
                      )}
                      {comment.is_deleted && !comment.deleted_by_user && (
                        <Badge
                          variant="error"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          Mod Deleted
                        </Badge>
                      )}
                      {comment.is_deleted && comment.deleted_by_user && (
                        <Badge
                          variant="inactive"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          User Deleted
                        </Badge>
                      )}
                      {comment.is_reported && (
                        <Badge
                          variant="warning"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          Reported
                        </Badge>
                      )}
                      {comment.parent_id && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          Reply
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </td>

                  {/* Moderator Comment Column */}
                  <td className="px-4 py-3">
                    {comment.moderator_comment ? (
                      <span
                        className="text-xs text-neutral-600 dark:text-neutral-300 truncate block max-w-[150px]"
                        title={comment.moderator_comment}
                      >
                        {comment.moderator_comment}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">
                        None
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {/* Pending Comment Actions */}
                      {!comment.is_approved && !comment.is_deleted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
                          onClick={() => handleApprove(comment.id)}
                          disabled={isLoading}
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Deleted Comment Actions */}
                      {comment.is_deleted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
                          onClick={() => handleRestore(comment.id)}
                          disabled={isLoading}
                          title="Restore"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Reported Comment Actions */}
                      {comment.is_reported && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
                          onClick={() => handleClearReport(comment.id)}
                          disabled={isLoading}
                          title="Clear Report"
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Censorship Options for Approved Comments */}
                      {comment.is_approved && !comment.is_deleted && (
                        <>
                          {/* Mark as User Deleted */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
                            onClick={() => handleUserDelete(comment.id)}
                            disabled={isLoading}
                            title="Mark as User Deleted"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M17 11v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h2"></path>
                              <path d="M17 7v13"></path>
                              <path d="M13 15l4-4"></path>
                              <path d="M13 11l4 4"></path>
                            </svg>
                          </Button>

                          {/* Mark as Moderator Deleted */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
                            onClick={() =>
                              openModeratorCommentDialog(comment.id)
                            }
                            disabled={isLoading}
                            title="Mark as Moderator Deleted"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* Permanent Delete Option (available for all comments) */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-neutral-200 dark:hover:bg-neutral-800"
                            disabled={isLoading}
                            title="Permanently Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Permanently Delete Comment?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The comment will be
                              permanently removed from the database and will not
                              appear anywhere.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePermanentDelete(comment.id)}
                              className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                            >
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No comments found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {activeTab === "reported" &&
                "There are no reported comments to review."}
              {activeTab === "approved" && "There are no approved comments."}
              {activeTab === "deleted" && "There are no deleted comments."}
              {activeTab === "all" && "There are no comments in the system."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
