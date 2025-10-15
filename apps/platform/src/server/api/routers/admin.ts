/**
 * Admin tRPC Router
 * Handles admin-specific operations
 */

import { createTRPCRouter, adminProcedure } from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  uuidSchema,
  paginationSchema,
  permissionScopeSchema,
  createCampaignSchema,
  updateCampaignSchema,
  getCampaignSchema,
  sendCampaignSchema,
} from "../schemas/common";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { getAdminUsers, promoteUserToAdmin } from "@/lib/permissions-server";
import {
  getNewsletterSubscribers,
  updateUserNewsletterStatus,
} from "@/lib/newsletterService";

export const adminRouter = createTRPCRouter({
  // User management
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
        status: z.enum(["active", "suspended"]).optional(),
        role: z.enum(["admin", "user"]).optional(),
        isFlagged: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, role, isFlagged } = input;
      const offset = (page - 1) * limit;

      // Use service role client to bypass RLS for admin operations
      const supabase = createServiceRoleClient();

      // STEP 1: Fetch the paginated list of users with all filters applied.
      let usersQuery = supabase.from("users").select("*", { count: "exact" });

      if (search) {
        usersQuery = usersQuery.or(
          `name.ilike.%${search}%,email.ilike.%${search}%`,
        );
      }
      if (status === "suspended") {
        usersQuery = usersQuery.eq("suspended", true);
      } else if (status === "active") {
        usersQuery = usersQuery.eq("suspended", false);
      }
      if (role) {
        usersQuery = usersQuery.eq("role", role);
      }
      if (isFlagged) {
        usersQuery = usersQuery.eq("is_spam_flagged", true);
      }

      usersQuery = usersQuery
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      const {
        data: users,
        error: usersError,
        count: totalCount,
      } = await usersQuery;

      if (usersError) {
        console.error("STEP 1 FAILED: Could not fetch users.", usersError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users.",
        });
      }
      if (!users || users.length === 0) {
        return { users: [], totalCount: 0 };
      }

      // STEP 2: Collect the emails from the users fetched in this page.
      const userEmails = users
        .map((u: any) => u.email)
        .filter(Boolean) as string[];

      if (userEmails.length === 0) {
        // If no valid emails, just return users with total_spent = 0
        const usersWithZeroSpent = users.map((u: any) => ({
          ...u,
          total_spent: 0,
        }));
        return { users: usersWithZeroSpent, totalCount: totalCount || 0 };
      }

      // STEP 3: Fetch purchase summaries ONLY for those emails.
      const { data: purchaseSummaries, error: purchaseError } = await supabase
        .from("customer_purchase_summary")
        .select("customer_email, total_spent")
        .in("customer_email", userEmails);

      if (purchaseError) {
        console.error(
          "STEP 3 FAILED: Could not fetch purchase summaries.",
          purchaseError,
        );
        // Don't fail the whole request, just proceed without spend data.
      }

      // STEP 4: Create a Map for efficient lookup (Email -> Total Spent).
      const purchaseMap = new Map<string, number>();
      if (purchaseSummaries) {
        for (const summary of purchaseSummaries) {
          if (summary.customer_email && summary.total_spent) {
            purchaseMap.set(
              summary.customer_email,
              Number(summary.total_spent),
            );
          }
        }
      }
      console.log(
        "DEBUG: Purchase Map created with",
        purchaseMap.size,
        "entries.",
      );
      console.log(
        "DEBUG: Purchase Map contents:",
        Array.from(purchaseMap.entries()),
      );
      console.log("DEBUG: User emails from query:", userEmails);

      // STEP 5: Merge the data correctly.
      const usersWithPurchaseData = users.map((user: any) => {
        const total_spent = purchaseMap.get(user.email!) || 0;
        return { ...user, total_spent };
      });

      console.log(
        "DEBUG: Merged data for user",
        usersWithPurchaseData[0]?.email,
        "with total_spent",
        usersWithPurchaseData[0]?.total_spent,
      );

      return {
        users: usersWithPurchaseData,
        totalCount: totalCount || 0,
      };
    }),

  // Get single user details
  getUser: adminProcedure
    .input(z.object({ userId: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
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
            role,
            email_verified,
            has_active_membership,
            newsletter_subscribed,
            manually_unsubscribed,
            preferences,
            provider,
            created_at,
            updated_at,
            last_login,
            login_count,
            suspended,
            suspended_at,
            suspended_by,
            suspension_reason,
            suspension_expires_at,
            spam_score,
            is_spam_flagged,
            spam_flagged_at,
            spam_flagged_by
          `,
          )
          .eq("id", input.userId)
          .single();

        if (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
            cause: error,
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user",
          cause: error,
        });
      }
    }),

  // Get user by email (for customer info panel)
  getUserByEmail: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      try {
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
            role,
            email_verified,
            has_active_membership,
            newsletter_subscribed,
            manually_unsubscribed,
            preferences,
            provider,
            created_at,
            updated_at,
            last_login,
            login_count
          `,
          )
          .eq("email", input.email)
          .single();

        if (error && error.code !== "PGRST116") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch user",
            cause: error,
          });
        }

        return { user: user || null };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user",
          cause: error,
        });
      }
    }),

  // Get comprehensive account details for admin account detail page
  getAccountDetails: adminProcedure
    .input(z.object({ userId: uuidSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // STEP 1: Fetch the user. If this fails, nothing else matters.
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", input.userId)
          .single(); // Use .single() to enforce that one user must be found.

        // CRITICAL: If the user is not found, throw a TRPC NOT_FOUND error immediately.
        if (userError || !user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }

        // STEP 2: Fetch the purchase summary using the user's email.
        const { data: summary, error: summaryError } = await supabase
          .from("customer_purchase_summary")
          .select("*")
          .eq("customer_email", user.email)
          .maybeSingle(); // Use maybeSingle() to allow for no results

        // STEP 3: Fetch recent orders using the user's email.
        const { data: recentOrders, error: ordersError } = await supabase
          .from("orders")
          .select(
            `
            id,
            order_number,
            customer_name,
            customer_email,
            total_amount,
            currency,
            status,
            created_at,
            paid_at,
            completed_at,
            service:products_services!service_id(
              id,
              title,
              slug,
              service_type
            )
          `,
          )
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false })
          .limit(5);

        // STEP 4: Return the consolidated data.
        return {
          user,
          summary: summary || {
            customer_email: user.email,
            customer_name: user.name,
            total_orders: 0,
            total_spent: 0,
            avg_order_value: 0,
            last_order_date: null,
            unique_services_purchased: 0,
            preferred_service_type: null,
            preferred_category: null,
          },
          recentOrders: recentOrders || [], // Ensure orders is an empty array if not found
        };
      } catch (error) {
        console.error(`[getAccountDetails] Error:`, error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch account details",
          cause: error,
        });
      }
    }),

  // Update user
  updateUser: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
        name: z.string().min(2).max(100).optional(),
        email: z.string().email().optional(),
        role: z.enum(["user", "admin"]).optional(),
        email_verified: z.boolean().optional(),
        has_active_membership: z.boolean().optional(),
        newsletter_subscribed: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { userId, ...updateData } = input;

        const { data: updatedUser, error } = await supabase
          .from("users")
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user",
            cause: error,
          });
        }

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
          cause: error,
        });
      }
    }),

  // Team management
  getTeam: adminProcedure.query(async ({ ctx }) => {
    try {
      const adminUsers = await getAdminUsers();
      return adminUsers;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch team members",
        cause: error,
      });
    }
  }),

  promoteUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        permissions: z.array(permissionScopeSchema).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedUser = await promoteUserToAdmin(input.email);

        if (!updatedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found or failed to promote",
          });
        }

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to promote user",
          cause: error,
        });
      }
    }),

  // Update user profile (admin action)
  updateUserProfile: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
        name: z.string().min(1).max(100),
        role: z.enum(["user", "admin"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Update user in the database
        const { data: updatedUser, error } = await supabase
          .from("users")
          .update({
            name: input.name.trim(),
            role: input.role,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.userId)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user profile",
            cause: error,
          });
        }

        // Also update the auth.users metadata for role changes
        if (input.role === "admin") {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            input.userId,
            {
              app_metadata: { role: "admin" },
            },
          );

          if (authError) {
            console.warn("Failed to update auth metadata:", authError);
            // Don't throw error as the main update succeeded
          }
        }

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user profile",
          cause: error,
        });
      }
    }),

  // Send password reset email
  sendPasswordReset: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Send password reset email using Supabase Auth
        const { error } = await supabase.auth.resetPasswordForEmail(
          input.email,
          {
            redirectTo: `${process.env.NEXTAUTH_URL}/auth/reset-password`,
          },
        );

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send password reset email",
            cause: error,
          });
        }

        return {
          success: true,
          message: `Password reset email sent to ${input.email}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send password reset email",
          cause: error,
        });
      }
    }),

  // Suspend/unsuspend user account
  suspendUser: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
        suspend: z.boolean(),
        reason: z.string().optional(),
        expiresAt: z.string().datetime().optional(), // ISO string for expiration date
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();
        const adminUserId = ctx.session?.user?.id;

        // Get the current user
        const { data: currentUser, error: getUserError } = await supabase
          .from("users")
          .select("id, email, role, suspended")
          .eq("id", input.userId)
          .single();

        if (getUserError || !currentUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
            cause: getUserError,
          });
        }

        // Prevent admins from suspending themselves
        if (input.userId === adminUserId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot suspend your own account",
          });
        }

        // Update user suspension status
        const updateData: any = {
          suspended: input.suspend,
          updated_at: new Date().toISOString(),
        };

        if (input.suspend) {
          updateData.suspended_at = new Date().toISOString();
          updateData.suspended_by = adminUserId;
          updateData.suspension_reason = input.reason || "No reason provided";
          if (input.expiresAt) {
            updateData.suspension_expires_at = input.expiresAt;
          }
        } else {
          // Clear suspension data when unsuspending
          updateData.suspended_at = null;
          updateData.suspended_by = null;
          updateData.suspension_reason = null;
          updateData.suspension_expires_at = null;
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", input.userId)
          .select()
          .single();

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user suspension status",
            cause: updateError,
          });
        }

        // Log the action in suspension history
        const { error: historyError } = await supabase
          .from("user_suspension_history")
          .insert({
            user_id: input.userId,
            action: input.suspend ? "suspended" : "unsuspended",
            reason:
              input.reason ||
              (input.suspend ? "No reason provided" : "Unsuspended by admin"),
            performed_by: adminUserId,
            metadata: {
              expires_at: input.expiresAt,
              admin_email: ctx.session?.user?.email,
            },
          });

        if (historyError) {
          console.warn("Failed to log suspension history:", historyError);
          // Don't throw error as the main action succeeded
        }

        return {
          success: true,
          user: updatedUser,
          message: input.suspend
            ? "User suspended successfully"
            : "User unsuspended successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user suspension status",
          cause: error,
        });
      }
    }),

  // Flag/unflag user as spam
  flagUserAsSpam: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
        isSpam: z.boolean(),
        reason: z.string().optional(),
        spamScore: z.number().min(0).max(100).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();
        const adminUserId = ctx.session?.user?.id;

        // Get the current user
        const { data: currentUser, error: getUserError } = await supabase
          .from("users")
          .select("id, email, is_spam_flagged")
          .eq("id", input.userId)
          .single();

        if (getUserError || !currentUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
            cause: getUserError,
          });
        }

        // Update spam status
        const updateData: any = {
          is_spam_flagged: input.isSpam,
          updated_at: new Date().toISOString(),
        };

        if (input.isSpam) {
          updateData.spam_flagged_at = new Date().toISOString();
          updateData.spam_flagged_by = adminUserId;
          updateData.spam_score = input.spamScore || 100;
        } else {
          updateData.spam_flagged_at = null;
          updateData.spam_flagged_by = null;
          updateData.spam_score = 0;
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", input.userId)
          .select()
          .single();

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user spam status",
            cause: updateError,
          });
        }

        // Log the action
        const { error: historyError } = await supabase
          .from("user_suspension_history")
          .insert({
            user_id: input.userId,
            action: input.isSpam ? "spam_flagged" : "spam_unflagged",
            reason:
              input.reason ||
              (input.isSpam ? "Flagged as spam" : "Unflagged as spam"),
            performed_by: adminUserId,
            metadata: {
              spam_score: input.spamScore,
              admin_email: ctx.session?.user?.email,
            },
          });

        if (historyError) {
          console.warn("Failed to log spam action history:", historyError);
        }

        return {
          success: true,
          user: updatedUser,
          message: input.isSpam
            ? "User flagged as spam successfully"
            : "User unflagged as spam successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user spam status",
          cause: error,
        });
      }
    }),

  // Get banned emails
  getBannedEmails: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();
        const offset = (input.page - 1) * input.limit;

        let query = supabase
          .from("banned_emails")
          .select(
            `
            id,
            email_pattern,
            pattern_type,
            reason,
            created_by,
            created_at,
            updated_at,
            is_active
          `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        if (input.search) {
          query = query.ilike("email_pattern", `%${input.search}%`);
        }

        const { data: bannedEmails, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch banned emails",
            cause: error,
          });
        }

        // Get total count
        let countQuery = supabase
          .from("banned_emails")
          .select("*", { count: "exact", head: true });

        if (input.search) {
          countQuery = countQuery.ilike("email_pattern", `%${input.search}%`);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to count banned emails",
            cause: countError,
          });
        }

        return {
          bannedEmails: bannedEmails || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch banned emails",
          cause: error,
        });
      }
    }),

  // Add banned email pattern
  addBannedEmail: adminProcedure
    .input(
      z.object({
        emailPattern: z.string().min(1),
        patternType: z.enum(["exact", "domain", "regex"]),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();
        const adminUserId = ctx.session?.user?.id;

        const { data: bannedEmail, error } = await supabase
          .from("banned_emails")
          .insert({
            email_pattern: input.emailPattern.toLowerCase(),
            pattern_type: input.patternType,
            reason: input.reason || "No reason provided",
            created_by: adminUserId,
          })
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            // Unique constraint violation
            throw new TRPCError({
              code: "CONFLICT",
              message: "This email pattern is already banned",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add banned email pattern",
            cause: error,
          });
        }

        return {
          success: true,
          bannedEmail,
          message: "Email pattern banned successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add banned email pattern",
          cause: error,
        });
      }
    }),

  // Remove banned email pattern
  removeBannedEmail: adminProcedure
    .input(
      z.object({
        bannedEmailId: uuidSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("banned_emails")
          .delete()
          .eq("id", input.bannedEmailId);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove banned email pattern",
            cause: error,
          });
        }

        return {
          success: true,
          message: "Email pattern removed from ban list successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove banned email pattern",
          cause: error,
        });
      }
    }),

  // Check if email is banned
  checkEmailBanned: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data, error } = await supabase.rpc("is_email_banned", {
          email_to_check: input.email,
        });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to check if email is banned",
            cause: error,
          });
        }

        return {
          isBanned: data || false,
          email: input.email,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check if email is banned",
          cause: error,
        });
      }
    }),

  // Get user suspension history
  getUserSuspensionHistory: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();
        const offset = (input.page - 1) * input.limit;

        const { data: history, error } = await supabase
          .from("user_suspension_history")
          .select(
            `
            id,
            action,
            reason,
            performed_at,
            metadata,
            performed_by
          `,
          )
          .eq("user_id", input.userId)
          .order("performed_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch user suspension history",
            cause: error,
          });
        }

        return {
          history: history || [],
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user suspension history",
          cause: error,
        });
      }
    }),

  // Update team member permissions
  updateTeamMemberPermissions: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
        permissions: z.array(permissionScopeSchema),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // First, remove all existing permissions for this user
        const { error: deleteError } = await supabase
          .from("user_permissions")
          .delete()
          .eq("user_id", input.userId);

        if (deleteError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to clear existing permissions",
            cause: deleteError,
          });
        }

        // Then, add the new permissions
        if (input.permissions.length > 0) {
          const permissionInserts = input.permissions.map((permission) => ({
            user_id: input.userId,
            permission: permission,
          }));

          const { error: insertError } = await supabase
            .from("user_permissions")
            .insert(permissionInserts);

          if (insertError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to add new permissions",
              cause: insertError,
            });
          }
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update team member permissions",
          cause: error,
        });
      }
    }),

  // Update a single permission for a team member
  updateTeamMemberPermission: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
        permission: permissionScopeSchema,
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        if (input.enabled) {
          // Add the permission if it doesn't exist
          const { error: insertError } = await supabase
            .from("user_permissions")
            .upsert(
              {
                user_id: input.userId,
                permission: input.permission,
              },
              {
                onConflict: "user_id,permission",
              },
            );

          if (insertError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to add permission",
              cause: insertError,
            });
          }
        } else {
          // Remove the permission
          const { error: deleteError } = await supabase
            .from("user_permissions")
            .delete()
            .eq("user_id", input.userId)
            .eq("permission", input.permission);

          if (deleteError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to remove permission",
              cause: deleteError,
            });
          }
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update team member permission",
          cause: error,
        });
      }
    }),

  // Demote team member from admin to user
  demoteTeamMember: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Update the user's role to user
        const { error: updateError } = await supabase
          .from("users")
          .update({ role: "user" })
          .eq("id", input.userId);

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user role",
            cause: updateError,
          });
        }

        // Remove all permissions
        const { error: permissionsError } = await supabase
          .from("user_permissions")
          .delete()
          .eq("user_id", input.userId);

        if (permissionsError) {
          console.error("Error removing admin permissions:", permissionsError);
          // Continue anyway, the user has been demoted
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to demote team member",
          cause: error,
        });
      }
    }),

  // Get authors (admin users who can write blog posts)
  getAuthors: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: authors, error } = await supabase
        .from("users")
        .select("id, email, name, picture, role")
        .eq("role", "admin")
        .order("name");

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch authors",
          cause: error,
        });
      }

      // Format the authors data to match the expected structure
      const formattedAuthors = (authors || []).map((author: any) => ({
        id: author.id,
        display_name: author.name || author.email.split("@")[0],
        profile_picture_url: author.picture || null,
        role: author.role,
        bio: null, // Not available in users table
      }));

      return {
        success: true,
        authors: formattedAuthors,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch authors",
        cause: error,
      });
    }
  }),

  // Newsletter management
  getNewsletterSubscribers: adminProcedure
    .input(
      paginationSchema.extend({
        search: z.string().optional(),
        subscribed: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        // Use the new newsletter service
        const result = await getNewsletterSubscribers({
          activeOnly: input.subscribed,
          page: input.page,
          limit: input.limit,
          search: input.search,
        });

        return {
          subscribers: result.subscribers,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch newsletter subscribers",
          cause: error,
        });
      }
    }),

  // Update newsletter subscription for a user
  updateUserNewsletterStatus: adminProcedure
    .input(
      z.object({
        userId: uuidSchema,
        subscribed: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Use the new newsletter service
        const result = await updateUserNewsletterStatus(
          input.userId,
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

  // Analytics
  getAnalytics: adminProcedure
    .input(
      z.object({
        dateRange: z
          .object({
            from: z.string().datetime(),
            to: z.string().datetime(),
          })
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Get date range or default to last 30 days
        const endDate = input.dateRange?.to || new Date().toISOString();
        const startDate =
          input.dateRange?.from ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // Get user statistics
        const { data: userStats, error: userError } = await supabase
          .from("users")
          .select("created_at, email_verified, newsletter_subscribed, role")
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        if (userError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch user analytics",
            cause: userError,
          });
        }

        // Get blog post statistics
        const { data: blogStats, error: blogError } = await supabase
          .from("blog_posts")
          .select("created_at, draft, featured, category")
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        if (blogError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch blog analytics",
            cause: blogError,
          });
        }

        // Get engagement statistics
        const { data: engagementStats, error: engagementError } = await supabase
          .from("blog_engagement")
          .select("views_count, likes_count, updated_at")
          .gte("updated_at", startDate)
          .lte("updated_at", endDate);

        if (engagementError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch engagement analytics",
            cause: engagementError,
          });
        }

        // Process analytics data
        const analytics = {
          users: {
            total: userStats?.length || 0,
            verified:
              userStats?.filter((u: any) => u.email_verified).length || 0,
            newsletter_subscribers:
              userStats?.filter((u: any) => u.newsletter_subscribed).length ||
              0,
            admins:
              userStats?.filter((u: any) => u.role === "admin").length || 0,
          },
          blog: {
            total_posts: blogStats?.length || 0,
            published_posts:
              blogStats?.filter((p: any) => !p.draft).length || 0,
            draft_posts: blogStats?.filter((p: any) => p.draft).length || 0,
            featured_posts:
              blogStats?.filter((p: any) => p.featured).length || 0,
          },
          engagement: {
            total_views:
              engagementStats?.reduce(
                (sum: number, e: any) => sum + (e.views_count || 0),
                0,
              ) || 0,
            total_likes:
              engagementStats?.reduce(
                (sum: number, e: any) => sum + (e.likes_count || 0),
                0,
              ) || 0,
          },
          dateRange: {
            from: startDate,
            to: endDate,
          },
        };

        return analytics;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch analytics",
          cause: error,
        });
      }
    }),

  // Newsletter Campaign Management
  getNewsletterCampaigns: adminProcedure
    .input(
      paginationSchema.extend({
        search: z.string().optional(),
        status: z
          .enum(["draft", "sending", "sent", "failed", "scheduled"])
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        let query = supabase
          .from("newsletter_campaigns")
          .select("*")
          .order("created_at", { ascending: false });

        if (input.search) {
          query = query.ilike("subject", `%${input.search}%`);
        }

        if (input.status) {
          query = query.eq("status", input.status);
        }

        const { data: campaigns, error } = await query.range(
          (input.page - 1) * input.limit,
          input.page * input.limit - 1,
        );

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch newsletter campaigns",
            cause: error,
          });
        }

        // Get total count
        let countQuery = supabase
          .from("newsletter_campaigns")
          .select("*", { count: "exact", head: true });

        if (input.search) {
          countQuery = countQuery.ilike("subject", `%${input.search}%`);
        }
        if (input.status) {
          countQuery = countQuery.eq("status", input.status);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get campaigns count",
            cause: countError,
          });
        }

        return {
          campaigns: campaigns || [],
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch newsletter campaigns",
          cause: error,
        });
      }
    }),

  // Get single newsletter campaign
  getNewsletterCampaign: adminProcedure
    .input(getCampaignSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data: campaign, error } = await supabase
          .from("newsletter_campaigns")
          .select("*")
          .eq("id", input.id)
          .single();

        if (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Campaign not found",
            cause: error,
          });
        }

        return campaign;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch campaign",
          cause: error,
        });
      }
    }),

  // Create newsletter campaign
  createNewsletterCampaign: adminProcedure
    .input(createCampaignSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const now = new Date().toISOString();
        const { data: campaign, error } = await supabase
          .from("newsletter_campaigns")
          .insert({
            subject: input.subject,
            content: input.content,
            status: input.status,
            created_at: now,
            updated_at: now,
          })
          .select("*")
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create campaign",
            cause: error,
          });
        }

        return {
          success: true,
          campaign,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create campaign",
          cause: error,
        });
      }
    }),

  // Update newsletter campaign
  updateNewsletterCampaign: adminProcedure
    .input(updateCampaignSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { id, ...updateData } = input;
        const { data: campaign, error } = await supabase
          .from("newsletter_campaigns")
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select("*")
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update campaign",
            cause: error,
          });
        }

        return {
          success: true,
          campaign,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update campaign",
          cause: error,
        });
      }
    }),

  // Delete newsletter campaign
  deleteNewsletterCampaign: adminProcedure
    .input(getCampaignSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("newsletter_campaigns")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete campaign",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete campaign",
          cause: error,
        });
      }
    }),

  // Newsletter welcome template management
  getWelcomeTemplate: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      // Default template
      const DEFAULT_WELCOME_TEMPLATE = {
        subject: "Welcome to our community!",
        content:
          "Thank you for subscribing to our newsletter. We're excited to have you on board!",
        isEnabled: true,
      };

      // Check if the welcome_email_templates table exists and get latest template
      const { data: templates, error } = await supabase
        .from("welcome_email_templates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        // If table doesn't exist, return default template
        console.log(
          "[Admin] Welcome email templates table doesn't exist, returning default template",
        );
        return {
          success: true,
          data: DEFAULT_WELCOME_TEMPLATE,
        };
      }

      return {
        success: true,
        data: templates?.[0]
          ? {
              subject: templates[0].subject,
              content: templates[0].content,
              isEnabled: templates[0].is_enabled,
            }
          : DEFAULT_WELCOME_TEMPLATE,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch welcome template",
        cause: error,
      });
    }
  }),

  updateWelcomeTemplate: adminProcedure
    .input(
      z.object({
        subject: z.string().min(1, "Subject is required"),
        content: z.string().optional(),
        isEnabled: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Try to insert the template
        const { error: insertError } = await supabase
          .from("welcome_email_templates")
          .insert({
            subject: input.subject,
            content: input.content || "",
            is_enabled: input.isEnabled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          // If table doesn't exist, try to create it first
          if (insertError.code === "42P01") {
            // Table doesn't exist
            const { error: createTableError } = await supabase.rpc(
              "execute_sql",
              {
                sql: `
                CREATE TABLE IF NOT EXISTS public.welcome_email_templates (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  subject TEXT NOT NULL,
                  content TEXT NOT NULL,
                  is_enabled BOOLEAN DEFAULT true,
                  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
                );

                ALTER TABLE public.welcome_email_templates ENABLE ROW LEVEL SECURITY;

                CREATE POLICY "Allow authenticated users to manage welcome_email_templates"
                  ON public.welcome_email_templates
                  FOR ALL
                  TO authenticated
                  USING (true)
                  WITH CHECK (true);
              `,
              },
            );

            if (createTableError) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create welcome email templates table",
                cause: createTableError,
              });
            }

            // Try insert again after creating table
            const { error: retryInsertError } = await supabase
              .from("welcome_email_templates")
              .insert({
                subject: input.subject,
                content: input.content || "",
                is_enabled: input.isEnabled,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (retryInsertError) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to save welcome template after table creation",
                cause: retryInsertError,
              });
            }
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to save welcome template",
              cause: insertError,
            });
          }
        }

        return {
          success: true,
          message: "Welcome template saved successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update welcome template",
          cause: error,
        });
      }
    }),

  sendWelcomeTest: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        subject: z.string().min(1),
        content: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Import the welcome email service
        const { sendDirectWelcomeEmail } = await import(
          "@/lib/direct-welcome-email"
        );

        const result = await sendDirectWelcomeEmail(
          input.email,
          input.subject,
          input.content || "",
        );

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.message || "Failed to send test email",
          });
        }

        return {
          success: true,
          message: "Test welcome email sent successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send welcome test email",
          cause: error,
        });
      }
    }),

  seedEngagement: adminProcedure.mutation(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      // Get all published blog posts
      const { data: blogPosts, error: blogPostsError } = await supabase
        .from("blog_posts")
        .select("id, title, slug")
        .eq("draft", false);

      if (blogPostsError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch blog posts",
          cause: blogPostsError,
        });
      }

      if (!blogPosts || blogPosts.length === 0) {
        return {
          success: true,
          message: "No published blog posts found",
          postsProcessed: 0,
          engagementRecords: 0,
        };
      }

      // Create engagement data for each blog post
      const engagementData = blogPosts.map((post: any) => ({
        blog_post_id: post.id,
        likes_count: Math.floor(Math.random() * 50 + 5), // Random likes between 5-55
        views_count: Math.floor(Math.random() * 500 + 50), // Random views between 50-550
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Insert engagement data (upsert to handle conflicts)
      const { data: insertedData, error: insertError } = await supabase
        .from("blog_engagement")
        .upsert(engagementData, {
          onConflict: "blog_post_id",
          ignoreDuplicates: false,
        })
        .select();

      if (insertError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to insert engagement data",
          cause: insertError,
        });
      }

      return {
        success: true,
        message: "Engagement data seeded successfully",
        postsProcessed: blogPosts.length,
        engagementRecords: insertedData?.length || 0,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to seed engagement data",
        cause: error,
      });
    }
  }),

  // User status management
  updateStatus: adminProcedure
    .input(
      z.object({
        statusText: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Get the current admin user ID from the session
        const userId = ctx.session?.user?.id;
        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found",
          });
        }

        // Update or insert the user status
        const { data, error } = await supabase
          .from("user_status")
          .upsert({
            user_id: userId,
            status_text: input.statusText || null,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update status",
            cause: error,
          });
        }

        return {
          success: true,
          status: data,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update status",
          cause: error,
        });
      }
    }),

  // Get current user status
  getStatus: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      // Get the current admin user ID from the session
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User session not found",
        });
      }

      const { data, error } = await supabase
        .from("user_status")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch status",
          cause: error,
        });
      }

      return data || null;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch status",
        cause: error,
      });
    }
  }),
});
