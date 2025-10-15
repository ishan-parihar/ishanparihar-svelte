/**
 * Blog tRPC Router
 * Handles blog posts, categories, comments, and engagement
 */

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  limitedProcedure,
  adminProcedure,
} from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  getBlogPostSchema,
  getBlogPostsSchema,
  getAdminBlogPostsSchema,
  getAdminBlogPostSchema,
  getBlogPostSlugSchema,
  getCommentCountSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  moderateCommentSchema,
  getCommentsSchema,
  getAllCommentsSchema,
  incrementViewSchema,
  toggleLikeSchema,
  toggleBookmarkSchema,
} from "../schemas/blog";
import {
  getBlogPostBySlug,
  getPublicBlogPosts,
  searchBlogPosts,
  saveBlogPost as saveBlogPostQuery,
  type BlogPostSaveData,
} from "@/queries/blogQueries";

import {
  createComment,
  getCommentsForPost,
  editComment as updateCommentLib,
  deleteComment,
  getAllComments,
  getBlogPostSlugFromId,
  getCommentCount,
} from "@/lib/comments";

export const blogRouter = createTRPCRouter({
  // Public procedures
  getPost: publicProcedure
    .input(getBlogPostSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;
        const post = await getBlogPostBySlug(supabase, input.slug);

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }

        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog post",
          cause: error,
        });
      }
    }),

  getPosts: publicProcedure
    .input(getBlogPostsSchema)
    .query(async ({ input, ctx }) => {
      try {
        console.time("Full Procedure: getPosts");
        const supabase = ctx.supabase;

        if (input.search) {
          const searchResults = await searchBlogPosts(supabase, input.search);
          console.timeEnd("Full Procedure: getPosts");
          return searchResults;
        }

        console.time("Database Query: getPosts");
        const posts = await getPublicBlogPosts(supabase);
        console.timeEnd("Database Query: getPosts");

        // Apply filters
        let filteredPosts = posts;

        if (input.category) {
          filteredPosts = filteredPosts.filter(
            (post) => post.category === input.category,
          );
        }

        if (input.featured !== undefined) {
          filteredPosts = filteredPosts.filter(
            (post) => post.featured === input.featured,
          );
        }

        // Apply pagination
        const startIndex = (input.page - 1) * input.limit;
        const endIndex = startIndex + input.limit;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        const result = {
          posts: paginatedPosts,
          total: filteredPosts.length,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil(filteredPosts.length / input.limit),
        };

        console.timeEnd("Full Procedure: getPosts");
        return result;
      } catch (error) {
        // Ensure timing is ended even in error cases
        try {
          console.timeEnd("Full Procedure: getPosts");
        } catch (timingError) {
          // Ignore timing errors to avoid masking the original error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog posts",
          cause: error,
        });
      }
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    try {
      const supabase = ctx.supabase;

      const { data, error } = await supabase
        .from("blog_posts")
        .select("category")
        .eq("draft", false);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch categories",
          cause: error,
        });
      }

      // Extract unique categories
      const categories = [
        ...new Set(data?.map((post: any) => post.category).filter(Boolean)),
      ];
      return categories;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch categories",
        cause: error,
      });
    }
  }),

  getSlugFromId: publicProcedure
    .input(getBlogPostSlugSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;
        const slug = await getBlogPostSlugFromId(supabase, input.id);

        if (!slug) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }

        return { slug };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog post slug",
          cause: error,
        });
      }
    }),

  getCommentCount: publicProcedure
    .input(getCommentCountSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;
        const count = await getCommentCount(supabase, input.postId);

        return { count };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch comment count",
          cause: error,
        });
      }
    }),

  incrementView: publicProcedure
    .input(incrementViewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;

        // Get blog post ID from slug
        const { data: blogPost, error: blogPostError } = await supabase
          .from("blog_posts")
          .select("id")
          .eq("slug", input.slug)
          .eq("draft", false)
          .single();

        if (blogPostError || !blogPost) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }

        // Check if engagement record exists
        const { data: existingRecord, error: fetchError } = await supabase
          .from("blog_engagement")
          .select("views_count, likes_count")
          .eq("blog_post_id", blogPost.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch engagement data",
            cause: fetchError,
          });
        }

        let newViewsCount = 1;

        if (existingRecord) {
          // Update existing record
          newViewsCount = existingRecord.views_count + 1;

          const { error: updateError } = await supabase
            .from("blog_engagement")
            .update({
              views_count: newViewsCount,
              updated_at: new Date().toISOString(),
            })
            .eq("blog_post_id", blogPost.id);

          if (updateError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to increment views",
              cause: updateError,
            });
          }
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from("blog_engagement")
            .insert({
              blog_post_id: blogPost.id,
              likes_count: 0,
              views_count: newViewsCount,
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create engagement record",
              cause: insertError,
            });
          }
        }

        return { views_count: newViewsCount };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to increment view count",
          cause: error,
        });
      }
    }),

  // Protected procedures
  toggleLike: limitedProcedure
    .input(toggleLikeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Check if engagement record exists
        const { data: existingRecord, error: fetchError } = await supabase
          .from("blog_engagement")
          .select("likes_count, views_count")
          .eq("blog_post_id", input.postId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch engagement data",
            cause: fetchError,
          });
        }

        let newLikesCount = 1;

        if (existingRecord) {
          // Update existing record
          newLikesCount = existingRecord.likes_count + 1;

          const { error: updateError } = await supabase
            .from("blog_engagement")
            .update({
              likes_count: newLikesCount,
              updated_at: new Date().toISOString(),
            })
            .eq("blog_post_id", input.postId);

          if (updateError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to update likes",
              cause: updateError,
            });
          }
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from("blog_engagement")
            .insert({
              blog_post_id: input.postId,
              likes_count: newLikesCount,
              views_count: 0,
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create engagement record",
              cause: insertError,
            });
          }
        }

        return { likes_count: newLikesCount };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle like",
          cause: error,
        });
      }
    }),

  toggleBookmark: limitedProcedure
    .input(toggleBookmarkSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Check if bookmark already exists
        const { data: existingBookmark, error: checkError } = await supabase
          .from("user_bookmarks")
          .select("id")
          .eq("user_id", ctx.session.user.id)
          .eq("post_id", input.postId)
          .maybeSingle();

        if (checkError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to check existing bookmark",
            cause: checkError,
          });
        }

        if (existingBookmark) {
          // Remove bookmark
          const { error: deleteError } = await supabase
            .from("user_bookmarks")
            .delete()
            .eq("id", existingBookmark.id);

          if (deleteError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to remove bookmark",
              cause: deleteError,
            });
          }

          return { bookmarked: false };
        } else {
          // Add bookmark
          const { error: insertError } = await supabase
            .from("user_bookmarks")
            .insert({
              user_id: ctx.session.user.id,
              post_id: input.postId,
            });

          if (insertError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to add bookmark",
              cause: insertError,
            });
          }

          return { bookmarked: true };
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle bookmark",
          cause: error,
        });
      }
    }),

  createComment: limitedProcedure
    .input(createCommentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;

        // Fix: Sync Google profile picture if missing in database
        try {
          const { syncGoogleProfilePictureFromSession } = await import(
            "@/lib/google-profile-sync"
          );
          const syncResult = await syncGoogleProfilePictureFromSession(
            ctx.session,
          );

          if (syncResult.updated) {
            console.log(
              `[createComment] Successfully synced Google profile picture for user ${ctx.session.user.id}`,
            );
          } else if (!syncResult.success) {
            console.warn(
              `[createComment] Failed to sync Google profile picture:`,
              syncResult.error,
            );
          }
        } catch (syncError) {
          console.warn(
            `[createComment] Failed to sync Google profile picture:`,
            syncError,
          );
          // Don't fail comment creation if sync fails
        }

        const comment = await createComment(supabase, {
          blog_post_id: input.postId,
          user_id: ctx.session.user.id,
          content: input.content,
          parent_id: input.parentId || null,
        });

        // Invalidate the server-side cache for comments
        try {
          const { revalidateTag } = await import("next/cache");
          revalidateTag("comments");
          console.log("[Comments] Server-side cache invalidated");
        } catch (cacheError) {
          console.warn(
            "[Comments] Failed to invalidate server-side cache:",
            cacheError,
          );
          // Don't fail the comment creation if cache invalidation fails
        }

        return comment;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create comment",
          cause: error,
        });
      }
    }),

  updateComment: protectedProcedure
    .input(updateCommentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;
        const comment = await updateCommentLib(
          supabase,
          input.id,
          input.content,
          ctx.session.user.email || undefined,
          true,
        );

        return comment;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update comment",
          cause: error,
        });
      }
    }),

  deleteComment: protectedProcedure
    .input(deleteCommentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = ctx.supabase;
        const success = await deleteComment(
          supabase,
          input.id,
          ctx.session.user.email || "",
          false,
        );

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete comment",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete comment",
          cause: error,
        });
      }
    }),

  getComments: publicProcedure
    .input(getCommentsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;

        console.log(
          `[tRPC getComments] Fetching comments for blog post: ${input.postId}`,
        );

        // Use the same approach as server-side rendering for consistency
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(
            `
            *,
            user:users(id, name, email, picture, custom_picture, provider)
          `,
          )
          .eq("blog_post_id", input.postId)
          .eq("is_approved", true)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true });

        if (commentsError) {
          console.error(
            "[tRPC getComments] Error fetching comments:",
            commentsError,
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch comments",
            cause: commentsError,
          });
        }

        if (!commentsData || commentsData.length === 0) {
          console.log(
            `[tRPC getComments] No comments found for blog post: ${input.postId}`,
          );
          return {
            comments: [],
            total: 0,
            page: input.page,
            limit: input.limit,
            totalPages: 0,
          };
        }

        // Transform comments to match the expected structure (same as server-side rendering)
        const transformedComments = commentsData.map((comment: any) => {
          // Debug log the raw user data from the database
          console.log(
            `[tRPC getComments] Raw user data for comment ${comment.id}:`,
            {
              user_id: comment.user_id,
              user: comment.user,
            },
          );

          const transformedComment = {
            id: comment.id,
            blog_post_id: comment.blog_post_id,
            user_id: comment.user_id,
            parent_id: comment.parent_id,
            content: comment.content,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            is_approved: comment.is_approved !== false,
            is_deleted: comment.is_deleted || false,
            deleted_by_user: comment.deleted_by_user || false,
            moderator_comment: comment.moderator_comment || "",
            is_reported: comment.is_reported || false,
            report_reason: comment.report_reason || "",
            // Flatten user data for compatibility with CommentItem component
            user_name: comment.user?.name || "Anonymous",
            user_email: comment.user?.email || "",
            user_picture: comment.user?.picture || "",
            // For Google accounts, set user_image to the same value as user_picture
            user_image:
              comment.user?.provider === "google"
                ? comment.user?.picture || ""
                : undefined,
            user_custom_picture: comment.user?.custom_picture || false,
            user_provider: comment.user?.provider || "email",
          };

          // Debug log the transformed comment data
          console.log(`[tRPC getComments] Transformed comment ${comment.id}:`, {
            user_name: transformedComment.user_name,
            user_picture: transformedComment.user_picture,
            user_provider: transformedComment.user_provider,
          });

          return transformedComment;
        });

        // Organize into tree structure (same as server-side rendering)
        const commentMap = new Map<string, any>();
        const rootComments: any[] = [];

        // First pass: create a map of all comments
        transformedComments.forEach((comment: any) => {
          commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: build the tree structure
        transformedComments.forEach((comment: any) => {
          const processedComment = commentMap.get(comment.id);
          if (processedComment) {
            if (comment.parent_id) {
              // This is a reply, add it to the parent's replies
              const parentComment = commentMap.get(comment.parent_id);
              if (parentComment && parentComment.replies) {
                parentComment.replies.push(processedComment);
              }
            } else {
              // This is a root comment
              rootComments.push(processedComment);
            }
          }
        });

        console.log(
          `[tRPC getComments] Processed ${rootComments.length} root comments with replies`,
        );

        // Debug: Check current user data in database and sync if needed
        if (ctx.session?.user?.id) {
          try {
            const { data: currentUser, error: userError } = await supabase
              .from("users")
              .select("id, email, name, picture, custom_picture, provider")
              .eq("id", ctx.session.user.id)
              .single();

            if (!userError && currentUser) {
              console.log(`[tRPC getComments] Current user data in database:`, {
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.name,
                picture: currentUser.picture
                  ? currentUser.picture.length > 50
                    ? currentUser.picture.substring(0, 50) + "..."
                    : currentUser.picture
                  : null,
                custom_picture: currentUser.custom_picture,
                provider: currentUser.provider,
              });
              console.log(`[tRPC getComments] Session user data:`, {
                id: ctx.session.user.id,
                email: ctx.session.user.email,
                name: ctx.session.user.name,
                image: ctx.session.user.image
                  ? ctx.session.user.image.length > 50
                    ? ctx.session.user.image.substring(0, 50) + "..."
                    : ctx.session.user.image
                  : null,
                provider: (ctx.session.user as any).provider,
              });

              // Fix: If user has Google provider but no picture in database, sync from session
              try {
                const { syncGoogleProfilePictureFromSession } = await import(
                  "@/lib/google-profile-sync"
                );
                const syncResult = await syncGoogleProfilePictureFromSession(
                  ctx.session,
                );

                if (syncResult.updated) {
                  console.log(
                    `[tRPC getComments] Successfully synced Google profile picture for user ${ctx.session.user.id}`,
                  );
                  // Update the currentUser object to reflect the change
                  currentUser.picture = ctx.session.user.image;
                } else if (!syncResult.success) {
                  console.warn(
                    `[tRPC getComments] Failed to sync Google profile picture:`,
                    syncResult.error,
                  );
                }
              } catch (syncError) {
                console.error(
                  `[tRPC getComments] Exception syncing Google profile picture:`,
                  syncError,
                );
              }
            }
          } catch (debugError) {
            console.log(`[tRPC getComments] Debug query failed:`, debugError);
          }
        }

        // Apply pagination manually
        const startIndex = (input.page - 1) * input.limit;
        const endIndex = startIndex + input.limit;
        const comments = rootComments.slice(startIndex, endIndex);

        return {
          comments,
          total: rootComments.length,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil(rootComments.length / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[tRPC getComments] Exception:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch comments",
          cause: error,
        });
      }
    }),

  // Admin procedures
  getAdminPosts: adminProcedure
    .input(getAdminBlogPostsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;

        let query = supabase
          .from("blog_posts")
          .select(
            `
            id,
            slug,
            title,
            excerpt,
            content,
            cover_image,
            date,
            author,
            author_user_id,
            category,
            featured,
            draft,
            premium,
            created_at,
            updated_at
          `,
          )
          .order("date", { ascending: false });

        // Apply filters based on parameters
        if (input.category) {
          query = query.eq("category", input.category);
        }

        // Filter by draft status if not including drafts
        if (!input.includeDrafts) {
          query = query.eq("draft", false);
        }

        const { data: posts, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch admin blog posts",
            cause: error,
          });
        }

        return posts || [];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admin blog posts",
          cause: error,
        });
      }
    }),

  getAdminPost: adminProcedure
    .input(getAdminBlogPostSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;

        let query = supabase
          .from("blog_posts")
          .select(
            `
            id,
            slug,
            title,
            excerpt,
            content,
            cover_image,
            date,
            author,
            author_user_id,
            category,
            featured,
            draft,
            premium,
            created_at,
            updated_at
          `,
          )
          .eq("slug", input.slug);

        // Filter by draft status if not including drafts
        if (!input.includeDrafts) {
          query = query.eq("draft", false);
        }

        const { data: post, error } = await query.maybeSingle();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch admin blog post",
            cause: error,
          });
        }

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blog post not found",
          });
        }

        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admin blog post",
          cause: error,
        });
      }
    }),

  createPost: adminProcedure
    .input(createBlogPostSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;

        const postData: BlogPostSaveData = {
          slug: input.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
          cover_image: input.cover_image,
          date: input.published_at || new Date().toISOString(),
          author: ctx.session?.user?.name || "Anonymous",
          author_user_id: ctx.session?.user?.id,
          category: input.category,
          featured: input.featured,
          draft: input.draft,
          premium: input.premium,
          content_type: input.content_type,
          recommendation_tags: input.recommendation_tags,
        };

        const result = await saveBlogPostQuery(supabase, postData);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error || "Failed to create blog post",
          });
        }

        // TODO: Link concepts to the blog post if any are provided
        // This needs to be fixed to get the blog post id from the result
        /*
        if (input.concept_ids && input.concept_ids.length > 0 && result.slug) {
          // First get the blog post id from the slug
          const { data: blogPost } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('slug', result.slug)
            .single();

          if (blogPost) {
            const conceptLinks = input.concept_ids.map(conceptId => ({
              blog_post_id: blogPost.id,
              concept_id: conceptId,
            }));

            const { error: conceptError } = await supabase
              .from('blog_post_concepts')
              .insert(conceptLinks);

            if (conceptError) {
              console.error('Failed to link concepts to blog post:', conceptError);
              // Don't fail the entire operation, just log the error
            }
          }
        }
        */

        return { success: true, slug: result.slug };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create blog post",
          cause: error,
        });
      }
    }),

  updatePost: adminProcedure
    .input(updateBlogPostSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;

        const postData: BlogPostSaveData = {
          slug: input.title
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          title: input.title || "",
          excerpt: input.excerpt || "",
          content: input.content || "",
          cover_image: input.cover_image,
          date: input.published_at || new Date().toISOString(),
          author: ctx.session?.user?.name || "Anonymous",
          author_user_id: ctx.session?.user?.id,
          category: input.category || "",
          featured: input.featured || false,
          draft: input.draft,
          premium: input.premium,
          content_type: input.content_type,
          recommendation_tags: input.recommendation_tags,
        };

        const result = await saveBlogPostQuery(supabase, postData);

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error || "Failed to update blog post",
          });
        }

        // TODO: Update concept links if concept_ids is provided
        // This needs to be fixed to get the blog post id from the result
        /*
        if (input.concept_ids !== undefined && result.slug) {
          // First get the blog post id from the slug
          const { data: blogPost } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('slug', result.slug)
            .single();

          if (blogPost) {
            // First, remove existing concept links
            const { error: deleteError } = await supabase
              .from('blog_post_concepts')
              .delete()
              .eq('blog_post_id', blogPost.id);

            if (deleteError) {
              console.error('Failed to remove existing concept links:', deleteError);
            }

            // Then, add new concept links if any are provided
            if (input.concept_ids.length > 0) {
              const conceptLinks = input.concept_ids.map(conceptId => ({
                blog_post_id: blogPost.id,
                concept_id: conceptId,
              }));

              const { error: conceptError } = await supabase
                .from('blog_post_concepts')
                .insert(conceptLinks);

              if (conceptError) {
                console.error('Failed to link concepts to blog post:', conceptError);
                // Don't fail the entire operation, just log the error
              }
            }
          }
        }
        */

        return { success: true, slug: result.slug };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update blog post",
          cause: error,
        });
      }
    }),

  deletePost: adminProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;

        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("slug", input.slug);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete blog post",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete blog post",
          cause: error,
        });
      }
    }),

  moderateComment: adminProcedure
    .input(moderateCommentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;

        // Handle different moderation actions
        switch (input.action) {
          case "approve":
            {
              const { error } = await supabase
                .from("comments")
                .update({ is_approved: true })
                .eq("id", input.commentId);

              if (error) throw error;
            }
            break;

          case "reject":
            {
              const { error } = await supabase
                .from("comments")
                .update({ is_approved: false })
                .eq("id", input.commentId);

              if (error) throw error;
            }
            break;

          case "delete":
            {
              const updateData: any = {
                is_deleted: true,
                deleted_by_user: input.userDeleted || false,
              };

              if (input.moderatorComment) {
                updateData.moderator_comment = input.moderatorComment;
              }

              const { error } = await supabase
                .from("comments")
                .update(updateData)
                .eq("id", input.commentId);

              if (error) throw error;
            }
            break;

          case "restore":
            {
              const { error } = await supabase
                .from("comments")
                .update({
                  is_deleted: false,
                  is_approved: true,
                  moderator_comment: null,
                  deleted_by_user: false,
                })
                .eq("id", input.commentId);

              if (error) throw error;
            }
            break;

          case "permanent_delete":
            {
              const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", input.commentId);

              if (error) throw error;
            }
            break;

          case "clear_report":
            {
              const { error } = await supabase
                .from("comments")
                .update({
                  is_reported: false,
                  report_reason: null,
                })
                .eq("id", input.commentId);

              if (error) throw error;
            }
            break;

          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid moderation action",
            });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to moderate comment",
          cause: error,
        });
      }
    }),

  getAllComments: adminProcedure
    .input(getAllCommentsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = ctx.supabase;
        const allComments = await getAllComments(supabase);

        // Apply filtering based on status
        let filteredComments = allComments;
        if (input.status !== "all") {
          filteredComments = allComments.filter((comment) => {
            switch (input.status) {
              case "approved":
                return comment.is_approved && !comment.is_deleted;
              case "pending":
                return !comment.is_approved && !comment.is_deleted;
              case "deleted":
                return comment.is_deleted;
              case "reported":
                return comment.is_reported === true;
              default:
                return true;
            }
          });
        }

        // Apply sorting
        filteredComments.sort((a, b) => {
          const aValue = new Date(a[input.sortBy]).getTime();
          const bValue = new Date(b[input.sortBy]).getTime();
          return input.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        });

        // Apply pagination
        const startIndex = (input.page - 1) * input.limit;
        const endIndex = startIndex + input.limit;
        const paginatedComments = filteredComments.slice(startIndex, endIndex);

        return {
          comments: paginatedComments,
          total: filteredComments.length,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil(filteredComments.length / input.limit),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch all comments",
          cause: error,
        });
      }
    }),
});
