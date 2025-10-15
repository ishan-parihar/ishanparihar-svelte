/**
 * User tRPC Router
 * Handles user-related operations like bookmarks, preferences, etc.
 */

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { uuidSchema, paginationSchema } from "../schemas/common";
import { createServiceRoleClient } from "@/utils/supabase/server";
import {
  updateUserNewsletterStatus,
  getUserNewsletterStatus,
} from "@/lib/newsletterService";

export const userRouter = createTRPCRouter({
  // Get session information (public procedure to avoid auth loops)
  getSession: publicProcedure.query(async ({ ctx }) => {
    try {
      // If no session, return unauthenticated state
      if (!ctx.session?.user) {
        return {
          isLoggedIn: false,
          isPremium: false,
          user: null,
        };
      }

      const supabase = createServiceRoleClient();

      // Get user details from database
      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, name, picture, role, has_active_membership")
        .eq("id", ctx.session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user details:", error);
        // Return basic session info if database query fails
        return {
          isLoggedIn: true,
          isPremium: false,
          user: {
            id: ctx.session.user.id,
            email: ctx.session.user.email,
            name: ctx.session.user.name,
            picture: ctx.session.user.image,
            role: "user",
          },
        };
      }

      return {
        isLoggedIn: true,
        isPremium: user?.has_active_membership || false,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role || "user",
        },
      };
    } catch (error) {
      console.error("Error in getSession:", error);
      // Return unauthenticated state on error
      return {
        isLoggedIn: false,
        isPremium: false,
        user: null,
      };
    }
  }),
  // Get user bookmarks
  getBookmarks: protectedProcedure
    .input(
      paginationSchema.extend({
        category: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query to get bookmarks with blog post details
        let query = supabase
          .from("user_bookmarks")
          .select(
            `
            id,
            user_id,
            post_id,
            created_at,
            updated_at,
            blog_post:blog_posts!inner(
              id,
              slug,
              title,
              excerpt,
              cover_image,
              date,
              author,
              author_user_id,
              category,
              featured,
              created_at,
              updated_at,
              draft,
              premium
            )
          `,
          )
          .eq("user_id", ctx.session.user.id)
          .eq("blog_posts.draft", false) // Only include published posts
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Add category filter if specified
        if (input.category) {
          query = query.eq("blog_posts.category", input.category);
        }

        const { data: bookmarks, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch bookmarks",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("user_bookmarks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", ctx.session.user.id);

        if (input.category) {
          countQuery = countQuery.eq("blog_posts.category", input.category);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get bookmarks count",
            cause: countError,
          });
        }

        return {
          bookmarks: bookmarks || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch bookmarks",
          cause: error,
        });
      }
    }),

  // Update newsletter subscription
  updateNewsletterStatus: protectedProcedure
    .input(z.object({ subscribed: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        // Use the new newsletter service
        const result = await updateUserNewsletterStatus(
          ctx.session.user.id,
          input.subscribed,
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              result.message || "Failed to update newsletter subscription",
            cause: result.error,
          });
        }

        return { success: true, subscribed: input.subscribed };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update newsletter subscription",
          cause: error,
        });
      }
    }),

  // Get newsletter subscription status
  getNewsletterStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const subscriber = await getUserNewsletterStatus(ctx.session.user.id);

      if (!subscriber) {
        // User doesn't have a newsletter subscription yet
        return {
          subscribed: false,
          user: null,
        };
      }

      return {
        subscribed: !!(
          subscriber.newsletter_subscribed && !subscriber.manually_unsubscribed
        ),
        user: {
          id: subscriber.id,
          email: subscriber.email,
          name: subscriber.name,
          newsletter_subscribed: subscriber.newsletter_subscribed,
          manually_unsubscribed: subscriber.manually_unsubscribed,
          subscribed_at: subscriber.subscribed_at,
          unsubscribed_at: subscriber.unsubscribed_at,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch newsletter status",
        cause: error,
      });
    }
  }),

  // Get followed topics
  getFollowedTopics: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const supabase = createServiceRoleClient();

      const { data: user, error } = await supabase
        .from("users")
        .select("preferences")
        .eq("id", ctx.session.user.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch followed topics",
          cause: error,
        });
      }

      // Extract followed topics from preferences
      const preferences = user?.preferences || {};
      const followedTopics = preferences.followed_topics || [];

      return { topics: followedTopics };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch followed topics",
        cause: error,
      });
    }
  }),

  // Update followed topics
  updateFollowedTopics: protectedProcedure
    .input(z.object({ topics: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Get current preferences
        const { data: user, error: fetchError } = await supabase
          .from("users")
          .select("preferences")
          .eq("id", ctx.session.user.id)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch user preferences",
            cause: fetchError,
          });
        }

        // Update preferences with new followed topics
        const currentPreferences = user?.preferences || {};
        const updatedPreferences = {
          ...currentPreferences,
          followed_topics: input.topics,
        };

        const { error } = await supabase
          .from("users")
          .update({
            preferences: updatedPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ctx.session.user.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update followed topics",
            cause: error,
          });
        }

        return { success: true, topics: input.topics };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update followed topics",
          cause: error,
        });
      }
    }),

  // Toggle a single followed topic (add/remove)
  toggleFollowedTopic: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        action: z.enum(["add", "remove"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Get current preferences
        const { data: user, error: fetchError } = await supabase
          .from("users")
          .select("preferences")
          .eq("id", ctx.session.user.id)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch user preferences",
            cause: fetchError,
          });
        }

        // Get current followed topics
        const currentPreferences = user?.preferences || {};
        const currentTopics = currentPreferences.followed_topics || [];

        let updatedTopics: string[];
        if (input.action === "add") {
          if (!currentTopics.includes(input.topic)) {
            updatedTopics = [...currentTopics, input.topic];
          } else {
            updatedTopics = currentTopics;
          }
        } else {
          updatedTopics = currentTopics.filter(
            (topic: string) => topic !== input.topic,
          );
        }

        // Update preferences with new followed topics
        const updatedPreferences = {
          ...currentPreferences,
          followed_topics: updatedTopics,
        };

        const { error } = await supabase
          .from("users")
          .update({
            preferences: updatedPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ctx.session.user.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update followed topics",
            cause: error,
          });
        }

        return {
          success: true,
          action: input.action,
          topic: input.topic,
          followed_topics: updatedTopics,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle followed topic",
          cause: error,
        });
      }
    }),

  // Get premium status
  getPremiumStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const supabase = createServiceRoleClient();

      const { data: user, error } = await supabase
        .from("users")
        .select("has_active_membership, email, role")
        .eq("id", ctx.session.user.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch premium status",
          cause: error,
        });
      }

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // User has premium if they have active membership OR are an admin
      const hasPremium =
        user.has_active_membership === true || user.role === "admin";

      return {
        hasPremium,
        hasActiveMembership: user.has_active_membership,
        role: user.role,
        email: user.email,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch premium status",
        cause: error,
      });
    }
  }),

  // Update user name
  updateName: protectedProcedure
    .input(z.object({ name: z.string().min(2).max(100) }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        const { data: updatedUser, error } = await supabase
          .from("users")
          .update({
            name: input.name.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", ctx.session.user.id)
          .select("id, name, email")
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update name",
            cause: error,
          });
        }

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update name",
          cause: error,
        });
      }
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        picture: z.string().url().optional(),
        newsletter_subscribed: z.boolean().optional(),
        manually_unsubscribed: z.boolean().optional(),
        preferences: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Build update object with only provided fields
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (input.name !== undefined) {
          updateData.name = input.name.trim();
        }
        if (input.picture !== undefined) {
          updateData.picture = input.picture;
          updateData.custom_picture = true; // Mark as custom picture
        }
        if (input.newsletter_subscribed !== undefined) {
          updateData.newsletter_subscribed = input.newsletter_subscribed;
        }
        if (input.manually_unsubscribed !== undefined) {
          updateData.manually_unsubscribed = input.manually_unsubscribed;
        }
        if (input.preferences !== undefined) {
          updateData.preferences = input.preferences;
        }

        const { data: updatedUser, error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", ctx.session.user.id)
          .select(
            "id, email, name, picture, custom_picture, newsletter_subscribed, manually_unsubscribed, preferences",
          )
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update profile",
            cause: error,
          });
        }

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
          cause: error,
        });
      }
    }),

  // Get user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const supabase = createServiceRoleClient();

      const { data: user, error } = await supabase
        .from("users")
        .select(
          `
            id,
            email,
            name,
            picture,
            custom_picture,
            newsletter_subscribed,
            manually_unsubscribed,
            preferences,
            role,
            has_active_membership,
            email_verified,
            created_at,
            updated_at
          `,
        )
        .eq("id", ctx.session.user.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user profile",
          cause: error,
        });
      }

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user profile",
        cause: error,
      });
    }
  }),

  // Get purchase history
  getPurchaseHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const supabase = createServiceRoleClient();

      // Query the orders table for the authenticated user's purchases
      const { data: purchases, error } = await supabase
        .from("orders")
        .select(
          `
            id,
            created_at,
            total_amount,
            currency,
            status,
            order_number,
            service_id,
            products_services (
              title,
              description
            )
          `,
        )
        .eq("user_id", ctx.session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch purchase history",
          cause: error,
        });
      }

      // Transform the data to match the expected format
      const transformedPurchases =
        purchases?.map((purchase: any) => ({
          id: purchase.id,
          created_at: purchase.created_at,
          item_description:
            purchase.products_services?.title || "Unknown Product",
          amount: purchase.total_amount,
          status: purchase.status,
          currency: purchase.currency,
          order_number: purchase.order_number,
        })) || [];

      return transformedPurchases;
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      throw error instanceof TRPCError
        ? error
        : new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch purchase history",
          });
    }
  }),

  // Reset profile picture
  resetProfilePicture: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const supabase = createServiceRoleClient();

      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({
          picture: null,
          custom_picture: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ctx.session.user.id)
        .select("id, email, name, picture, custom_picture")
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset profile picture",
          cause: error,
        });
      }

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to reset profile picture",
        cause: error,
      });
    }
  }),

  // Update Google account info
  updateGoogleInfo: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        picture: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (input.name !== undefined) {
          updateData.name = input.name;
        }
        if (input.picture !== undefined) {
          updateData.picture = input.picture;
          updateData.custom_picture = false; // Mark as Google picture
        }

        const { data: updatedUser, error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", ctx.session.user.id)
          .select("id, email, name, picture, custom_picture")
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update Google info",
            cause: error,
          });
        }

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update Google info",
          cause: error,
        });
      }
    }),

  // Update profile picture directly with URL
  updateProfilePictureDirect: protectedProcedure
    .input(
      z.object({
        pictureUrl: z.string().url("Valid picture URL is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();
        const userId = ctx.session.user.id;

        const { data: updatedUser, error } = await supabase
          .from("users")
          .update({
            picture: input.pictureUrl,
            custom_picture: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select("id, email, name, picture, custom_picture")
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update profile picture",
            cause: error,
          });
        }

        return {
          success: true,
          message: "Profile picture updated successfully",
          user: updatedUser,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile picture",
          cause: error,
        });
      }
    }),

  // Sync Google profile picture from session
  syncGoogleProfilePicture: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const { syncGoogleProfilePictureFromSession } = await import(
        "@/lib/google-profile-sync"
      );
      const syncResult = await syncGoogleProfilePictureFromSession(ctx.session);

      if (!syncResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: syncResult.error || "Failed to sync Google profile picture",
        });
      }

      return {
        success: true,
        updated: syncResult.updated,
        message: syncResult.updated
          ? "Google profile picture synced successfully"
          : "No sync needed - profile picture already up to date",
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to sync Google profile picture",
        cause: error,
      });
    }
  }),

  // Generate invoice PDF for a user's order
  generateInvoice: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // First, verify that the order belongs to the authenticated user
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select(
            `
            *,
            products_services (
              id, title, description, base_price, currency,
              service_categories (
                id, name
              )
            )
          `,
          )
          .eq("id", input.orderId)
          .single();

        if (orderError || !order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
            cause: orderError,
          });
        }

        // CRITICAL SECURITY CHECK: Verify the order belongs to the authenticated user
        if (order.user_id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to access this order",
          });
        }

        // Fetch user details for the invoice
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id, email, name")
          .eq("id", ctx.session.user.id)
          .single();

        if (userError || !user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch user details",
            cause: userError,
          });
        }

        // Generate PDF using the existing PDF generator
        const { generateSimpleReceiptPDF } = await import(
          "@/lib/pdf-generator-simple"
        );

        // Prepare order data for PDF generation
        const orderForPdf = {
          ...order,
          customer_name: user.name || user.email,
          customer_email: user.email,
          service: order.products_services,
          item_description: order.products_services?.title || "Digital Service",
        };

        const pdfBuffer = await generateSimpleReceiptPDF(orderForPdf);

        // Convert PDF buffer to Base64 string
        const base64Pdf = pdfBuffer.toString("base64");

        return {
          pdf: base64Pdf,
          filename: `invoice-${order.order_number || order.id.substring(0, 8)}.pdf`,
        };
      } catch (error) {
        console.error("Error generating invoice:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate invoice",
        });
      }
    }),
});
