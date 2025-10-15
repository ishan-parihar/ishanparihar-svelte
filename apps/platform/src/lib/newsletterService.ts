/**
 * Newsletter Service
 *
 * Unified service for all newsletter-related functionality including:
 * - Subscriber management (subscribe, unsubscribe, get subscribers)
 * - Campaign management (create, send, get campaigns)
 * - Token-based unsubscribe handling
 * - Email integration
 * - User account linking
 *
 * This service operates on the dedicated newsletter_subscribers table,
 * providing independent newsletter functionality with optional user account linking.
 *
 * Key Features:
 * - Newsletter subscriptions independent of user accounts
 * - Automatic linking when users create accounts
 * - Backward compatibility with existing functionality
 * - Support for newsletter-only subscribers
 * - Complete campaign management
 */

import crypto from "crypto";
import { createServiceRoleClient } from "@/utils/supabase/server";

// ============================================================================
// TYPES
// ============================================================================

export type NewsletterSubscriber = {
  id?: string;
  email: string;
  name?: string | null;
  user_id?: string | null;
  newsletter_subscribed?: boolean;
  manually_unsubscribed?: boolean;
  unsubscribe_token?: string;
  subscribed_at?: string;
  unsubscribed_at?: string;
  created_at?: string;
  updated_at?: string;
  // Joined user data (when linked to user account)
  user_name?: string | null;
  user_created_at?: string;
  has_user_account?: boolean;
};

export type NewsletterCampaign = {
  id?: string;
  subject: string;
  content: string;
  sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
  status: "draft" | "sending" | "sent" | "failed" | "scheduled";
  recipient_count?: number;
};

// ============================================================================
// SUBSCRIBER MANAGEMENT
// ============================================================================

/**
 * Subscribe an email to the newsletter with intelligent user linking
 * @param email Email address to subscribe
 * @param name Optional name for the subscriber
 * @param contextUserId Optional user ID from session context (if logged in)
 * @returns Object with success status and message
 */
export async function subscribeToNewsletter(
  email: string,
  name?: string,
  contextUserId?: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: "Valid email address is required",
      };
    }

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return {
        success: false,
        message: "Database connection failed",
        error: "Supabase client not initialized",
      };
    }

    // Step A: Check for existing user by email (if not already logged in)
    let finalUserId = contextUserId; // Start with logged-in user ID if available

    if (!finalUserId) {
      // Look up user by email in the users table
      const { data: existingUser, error: userLookupError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (!userLookupError && existingUser) {
        finalUserId = existingUser.id;
        console.log(
          "[Newsletter] Found existing user for email, linking subscription:",
          { email, userId: finalUserId },
        );
      }
    }

    // Check if subscriber already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error(
        "[Newsletter] Error checking existing subscriber:",
        checkError,
      );
      return {
        success: false,
        message: "Failed to check subscription status",
        error: checkError.message,
      };
    }

    const now = new Date().toISOString();
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    if (existingSubscriber) {
      // Subscriber exists, update their status
      if (
        existingSubscriber.newsletter_subscribed &&
        !existingSubscriber.manually_unsubscribed
      ) {
        return {
          success: true,
          message: "You are already subscribed to our newsletter",
        };
      }

      // Resubscribe the user and update user_id if we found one
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          newsletter_subscribed: true,
          manually_unsubscribed: false,
          name: name || existingSubscriber.name,
          user_id: finalUserId || existingSubscriber.user_id, // Update user_id if we found one
          subscribed_at: now,
          unsubscribed_at: null,
          updated_at: now,
          unsubscribe_token: unsubscribeToken,
        })
        .eq("id", existingSubscriber.id);

      if (updateError) {
        console.error("[Newsletter] Error resubscribing user:", updateError);
        return {
          success: false,
          message: "Failed to update subscription",
          error: updateError.message,
        };
      }

      return {
        success: true,
        message: "Successfully resubscribed to newsletter",
      };
    } else {
      // New subscriber - include user_id if we found one
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email,
          name: name || null,
          user_id: finalUserId || null, // Link to user account if found
          newsletter_subscribed: true,
          manually_unsubscribed: false,
          unsubscribe_token: unsubscribeToken,
          subscribed_at: now,
          created_at: now,
          updated_at: now,
        });

      if (insertError) {
        console.error(
          "[Newsletter] Error creating new subscriber:",
          insertError,
        );
        return {
          success: false,
          message: "Failed to subscribe to newsletter",
          error: insertError.message,
        };
      }

      // Log the subscription scenario for debugging
      if (finalUserId) {
        console.log("[Newsletter] Successfully subscribed with user linking:", {
          email,
          userId: finalUserId,
          scenario: contextUserId
            ? "logged-in-user"
            : "anonymous-existing-email",
        });
      } else {
        console.log(
          "[Newsletter] Successfully subscribed without user linking:",
          {
            email,
            scenario: "anonymous-new-email",
          },
        );
      }

      return {
        success: true,
        message: "Successfully subscribed to newsletter",
      };
    }
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in subscribeToNewsletter:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "An unexpected error occurred",
      error: errorMessage,
    };
  }
}

/**
 * Get newsletter subscriber by email
 * @param email Email address to look up
 * @returns NewsletterSubscriber object or null if not found
 */
export async function getNewsletterSubscriberByEmail(
  email: string,
): Promise<NewsletterSubscriber | null> {
  try {
    if (!email) {
      console.error("[Newsletter] Email is required");
      return null;
    }

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return null;
    }

    // First try with foreign key join
    let { data, error } = await supabase
      .from("newsletter_subscribers")
      .select(
        `
        *,
        users!newsletter_subscribers_user_id_fkey (
          name,
          created_at
        )
      `,
      )
      .eq("email", email)
      .single();

    // If foreign key relationship doesn't exist, fall back to basic query
    if (error && error.message?.includes("Could not find a relationship")) {
      console.warn(
        "[Newsletter] Foreign key relationship missing, using fallback query",
      );

      // Get subscriber without join
      const { data: subscriberData, error: subscriberError } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("email", email)
        .single();

      if (subscriberError && subscriberError.code !== "PGRST116") {
        console.error(
          "[Newsletter] Error fetching subscriber by email:",
          subscriberError,
        );
        return null;
      }

      if (!subscriberData) {
        return null;
      }

      // If subscriber has user_id, fetch user data separately
      let userData = null;
      if (subscriberData.user_id) {
        const { data: userResult, error: userError } = await supabase
          .from("users")
          .select("name, created_at")
          .eq("id", subscriberData.user_id)
          .single();

        if (!userError) {
          userData = userResult;
        }
      }

      // Transform the data to include user information
      const subscriber: NewsletterSubscriber = {
        ...subscriberData,
        user_name: userData?.name || null,
        user_created_at: userData?.created_at || null,
        has_user_account: !!subscriberData.user_id,
      };

      return subscriber;
    }

    if (error && error.code !== "PGRST116") {
      console.error("[Newsletter] Error fetching subscriber by email:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transform the data to include user information
    const subscriber: NewsletterSubscriber = {
      ...data,
      user_name: data.users?.name || null,
      user_created_at: data.users?.created_at || null,
      has_user_account: !!data.user_id,
    };

    // Remove the nested users object
    delete (subscriber as any).users;

    return subscriber;
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in getNewsletterSubscriberByEmail:",
      error,
    );
    return null;
  }
}

/**
 * Unsubscribe from newsletter using token
 * @param token Unsubscribe token
 * @returns Object with success status and message
 */
export async function unsubscribeByToken(
  token: string,
): Promise<{
  success: boolean;
  message: string;
  email?: string;
  error?: string;
}> {
  try {
    if (!token) {
      return {
        success: false,
        message: "Unsubscribe token is required",
      };
    }

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return {
        success: false,
        message: "Database connection failed",
        error: "Supabase client not initialized",
      };
    }

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !subscriber) {
      console.error(
        "[Newsletter] Error finding subscriber by token:",
        findError,
      );
      return {
        success: false,
        message: "Invalid or expired unsubscribe link",
      };
    }

    // Check if already unsubscribed
    if (!subscriber.newsletter_subscribed || subscriber.manually_unsubscribed) {
      return {
        success: true,
        message: "You are already unsubscribed from our newsletter",
        email: subscriber.email,
      };
    }

    // Unsubscribe the user
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        newsletter_subscribed: false,
        manually_unsubscribed: true,
        unsubscribed_at: now,
        updated_at: now,
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("[Newsletter] Error unsubscribing user:", updateError);
      return {
        success: false,
        message: "Failed to unsubscribe",
        error: updateError.message,
      };
    }

    return {
      success: true,
      message: "Successfully unsubscribed from newsletter",
      email: subscriber.email,
    };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in unsubscribeByToken:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to unsubscribe",
      error: errorMessage,
    };
  }
}

/**
 * Update user newsletter subscription status
 * @param userId User ID
 * @param subscribed Whether to subscribe or unsubscribe
 * @returns Object with success status and message
 */
export async function updateUserNewsletterStatus(
  userId: string,
  subscribed: boolean,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return {
        success: false,
        message: "Database connection failed",
        error: "Supabase client not initialized",
      };
    }

    // Get user information
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("[Newsletter] Error fetching user:", userError);
      return {
        success: false,
        message: "User not found",
        error: userError?.message,
      };
    }

    // Check if newsletter subscriber exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", user.email)
      .single();

    const now = new Date().toISOString();
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    if (existingSubscriber) {
      // Update existing subscriber
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          user_id: userId,
          newsletter_subscribed: subscribed,
          manually_unsubscribed: !subscribed,
          name: user.name || existingSubscriber.name,
          subscribed_at: subscribed ? now : existingSubscriber.subscribed_at,
          unsubscribed_at: subscribed ? null : now,
          updated_at: now,
          unsubscribe_token: unsubscribeToken,
        })
        .eq("id", existingSubscriber.id);

      if (updateError) {
        console.error("[Newsletter] Error updating subscriber:", updateError);
        return {
          success: false,
          message: "Failed to update newsletter subscription",
          error: updateError.message,
        };
      }
    } else {
      // Create new subscriber
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: user.email,
          name: user.name,
          user_id: userId,
          newsletter_subscribed: subscribed,
          manually_unsubscribed: !subscribed,
          unsubscribe_token: unsubscribeToken,
          subscribed_at: subscribed ? now : null,
          unsubscribed_at: subscribed ? null : now,
          created_at: now,
          updated_at: now,
        });

      if (insertError) {
        console.error("[Newsletter] Error creating subscriber:", insertError);
        return {
          success: false,
          message: "Failed to create newsletter subscription",
          error: insertError.message,
        };
      }
    }

    return {
      success: true,
      message: subscribed
        ? "Successfully subscribed to newsletter"
        : "Successfully unsubscribed from newsletter",
    };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in updateUserNewsletterStatus:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "An unexpected error occurred",
      error: errorMessage,
    };
  }
}

/**
 * Get user newsletter subscription status
 * @param userId User ID
 * @returns NewsletterSubscriber object or null if not found
 */
export async function getUserNewsletterStatus(
  userId: string,
): Promise<NewsletterSubscriber | null> {
  try {
    if (!userId) {
      console.error("[Newsletter] User ID is required");
      return null;
    }

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return null;
    }

    // Get user email first
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("[Newsletter] Error fetching user:", userError);
      return null;
    }

    // Get newsletter subscriber by email
    return await getNewsletterSubscriberByEmail(user.email);
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in getUserNewsletterStatus:",
      error,
    );
    return null;
  }
}

/**
 * Get all newsletter subscribers with pagination and filtering
 * @param options Query options
 * @returns Array of subscribers with pagination info
 */
export async function getNewsletterSubscribers(
  options: {
    activeOnly?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  } = {},
): Promise<{
  subscribers: NewsletterSubscriber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    const { activeOnly = false, page = 1, limit = 50, search } = options;

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return {
        subscribers: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Build the query - try with foreign key join first
    let query = supabase.from("newsletter_subscribers").select(
      `
        *,
        users!newsletter_subscribers_user_id_fkey (
          name,
          created_at
        )
      `,
      { count: "exact" },
    );

    // Apply filters
    if (activeOnly) {
      query = query.eq("newsletter_subscribed", true);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by subscription date (most recent first)
    query = query.order("subscribed_at", {
      ascending: false,
      nullsFirst: false,
    });

    let { data, error, count } = await query;

    // If foreign key relationship doesn't exist, fall back to basic query
    if (error && error.message?.includes("Could not find a relationship")) {
      console.warn(
        "[Newsletter] Foreign key relationship missing, using fallback query",
      );

      // Build fallback query without join
      let fallbackQuery = supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact" });

      // Apply same filters
      if (activeOnly) {
        fallbackQuery = fallbackQuery.eq("newsletter_subscribed", true);
      }

      if (search) {
        fallbackQuery = fallbackQuery.or(
          `email.ilike.%${search}%,name.ilike.%${search}%`,
        );
      }

      // Apply pagination
      fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);

      // Order by subscription date (most recent first)
      fallbackQuery = fallbackQuery.order("subscribed_at", {
        ascending: false,
        nullsFirst: false,
      });

      const fallbackResult = await fallbackQuery;
      data = fallbackResult.data;
      error = fallbackResult.error;
      count = fallbackResult.count;

      // If we have data with user_ids, fetch user data separately
      if (data && data.length > 0) {
        const userIds = data
          .filter((item: any) => item.user_id)
          .map((item: any) => item.user_id);

        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, name, created_at")
            .in("id", userIds);

          // Create a map for quick lookup
          const usersMap = new Map();
          if (usersData) {
            usersData.forEach((user: any) => usersMap.set(user.id, user));
          }

          // Add user data to subscribers
          data = data.map((item: any) => ({
            ...item,
            users: item.user_id ? usersMap.get(item.user_id) : null,
          }));
        }
      }
    }

    if (error) {
      console.error("[Newsletter] Error fetching subscribers:", error);
      return {
        subscribers: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Transform the data to include user information
    const subscribers: NewsletterSubscriber[] = (data || []).map(
      (item: any) => ({
        ...item,
        user_name: item.users?.name || null,
        user_created_at: item.users?.created_at || null,
        has_user_account: !!item.user_id,
        users: undefined, // Remove the nested users object
      }),
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      subscribers,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in getNewsletterSubscribers:",
      error,
    );
    return {
      subscribers: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || 50,
      totalPages: 0,
    };
  }
}

// ============================================================================
// CAMPAIGN MANAGEMENT (SERVER-ONLY)
// ============================================================================

/**
 * Get all newsletter campaigns (server-side implementation)
 * @returns Array of newsletter campaigns
 */
export async function getNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
  try {
    // Get Supabase client - use service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return [];
    }

    // Get all campaigns
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Newsletter] Error fetching campaigns:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in getNewsletterCampaigns:",
      error,
    );
    return [];
  }
}

/**
 * Get a newsletter campaign by ID (server-side implementation)
 * @param id Campaign ID
 * @returns NewsletterCampaign object or null if not found
 */
export async function getNewsletterCampaignById(
  id: string,
): Promise<NewsletterCampaign | null> {
  try {
    if (!id) {
      console.error("[Newsletter] Campaign ID is required");
      return null;
    }

    // Get Supabase client - use service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return null;
    }

    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[Newsletter] Error fetching campaign by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in getNewsletterCampaignById:",
      error,
    );
    return null;
  }
}

/**
 * Create a new newsletter campaign (server-side implementation)
 * @param campaignData Campaign data to create
 * @returns Object with success status and campaign ID or error
 */
export async function createNewsletterCampaign(
  campaignData: Omit<NewsletterCampaign, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  try {
    if (!campaignData.subject || !campaignData.content) {
      return {
        success: false,
        error: "Subject and content are required",
      };
    }

    // Get Supabase client - use service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return { success: false, error: "Database connection failed" };
    }

    // Set default values
    const now = new Date().toISOString();
    const campaign = {
      subject: campaignData.subject,
      content: campaignData.content,
      status: campaignData.status || "draft",
      created_at: now,
      updated_at: now,
    };

    // Insert the campaign
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .insert(campaign)
      .select("id")
      .single();

    if (error) {
      console.error("[Newsletter] Error creating campaign:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Campaign created but ID not returned",
      };
    }

    return {
      success: true,
      campaignId: data.id,
    };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in createNewsletterCampaign:",
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update a newsletter campaign (server-side implementation)
 * @param id Campaign ID to update
 * @param updates Partial campaign data to update
 * @returns Object with success status and error if any
 */
export async function updateNewsletterCampaign(
  id: string,
  updates: Partial<Omit<NewsletterCampaign, "id" | "created_at">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Campaign ID is required",
      };
    }

    // Get Supabase client - use service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return { success: false, error: "Database connection failed" };
    }

    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("newsletter_campaigns")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("[Newsletter] Error updating campaign:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in updateNewsletterCampaign:",
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a newsletter campaign (server-side implementation)
 * @param id Campaign ID to delete
 * @returns Object with success status and error if any
 */
export async function deleteNewsletterCampaign(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Campaign ID is required",
      };
    }

    // Get Supabase client - use service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return { success: false, error: "Database connection failed" };
    }

    const { error } = await supabase
      .from("newsletter_campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Newsletter] Error deleting campaign:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in deleteNewsletterCampaign:",
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Schedule a newsletter campaign (server-side implementation)
 * @param id Campaign ID to schedule
 * @param scheduledTime ISO string of when to send the campaign
 * @returns Object with success status and error if any
 */
export async function scheduleNewsletterCampaign(
  id: string,
  scheduledTime: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Campaign ID is required",
      };
    }

    if (!scheduledTime) {
      return {
        success: false,
        error: "Scheduled time is required",
      };
    }

    // Validate that the scheduled time is in the future
    const scheduledDate = new Date(scheduledTime);
    const now = new Date();

    if (scheduledDate <= now) {
      return {
        success: false,
        error: "Scheduled time must be in the future",
      };
    }

    // Get Supabase client - use service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return { success: false, error: "Database connection failed" };
    }

    // Update the campaign with scheduled status and time
    const { error } = await supabase
      .from("newsletter_campaigns")
      .update({
        status: "scheduled",
        sent_at: scheduledTime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[Newsletter] Error scheduling campaign:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: "Campaign scheduled successfully",
    };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in scheduleNewsletterCampaign:",
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// USER REGISTRATION INTEGRATION
// ============================================================================

/**
 * Handle newsletter subscription for newly registered users
 * This function links a user account to their newsletter subscription
 * @param email User's email address
 * @param name User's name
 * @param userId User's ID from the users table
 * @returns Object with success status and message
 */
export async function handleUserRegistrationNewsletter(
  email: string,
  name: string,
  userId: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!email || !userId) {
      return {
        success: false,
        message: "Email and user ID are required",
      };
    }

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return {
        success: false,
        message: "Database connection failed",
        error: "Supabase client not initialized",
      };
    }

    // Check if newsletter subscriber already exists for this email
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error(
        "[Newsletter] Error checking existing subscriber:",
        checkError,
      );
      return {
        success: false,
        message: "Failed to check subscription status",
        error: checkError.message,
      };
    }

    const now = new Date().toISOString();
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    if (existingSubscriber) {
      // First, verify that the user exists in the users table
      const { data: userExists, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();

      if (userCheckError || !userExists) {
        console.warn(
          "[Newsletter] User not found in users table, skipping newsletter linking:",
          {
            userId,
            email,
            error: userCheckError?.message,
          },
        );
        return {
          success: true,
          message:
            "Newsletter subscription will be linked when user account is fully created",
        };
      }

      // Link existing newsletter subscription to user account
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          user_id: userId,
          name: name || existingSubscriber.name,
          updated_at: now,
          unsubscribe_token: unsubscribeToken,
        })
        .eq("id", existingSubscriber.id);

      if (updateError) {
        console.error(
          "[Newsletter] Error linking existing subscriber to user:",
          updateError,
        );
        // If it's a foreign key constraint error, handle it gracefully
        if (updateError.code === "23503") {
          console.warn(
            "[Newsletter] Foreign key constraint violation, user may not exist yet",
          );
          return {
            success: true,
            message:
              "Newsletter subscription will be linked when user account is fully created",
          };
        }
        return {
          success: false,
          message: "Failed to link newsletter subscription to user account",
          error: updateError.message,
        };
      }

      return {
        success: true,
        message: "Newsletter subscription linked to user account",
      };
    } else {
      // First, verify that the user exists in the users table
      const { data: userExists, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();

      if (userCheckError || !userExists) {
        console.warn(
          "[Newsletter] User not found in users table, creating newsletter subscription without user_id:",
          {
            userId,
            email,
            error: userCheckError?.message,
          },
        );

        // Create newsletter subscription without user_id for now
        const { error: insertError } = await supabase
          .from("newsletter_subscribers")
          .insert({
            email,
            name: name || null,
            user_id: null, // Don't link to user_id yet
            newsletter_subscribed: true,
            manually_unsubscribed: false,
            unsubscribe_token: unsubscribeToken,
            subscribed_at: now,
            created_at: now,
            updated_at: now,
          });

        if (insertError) {
          console.error(
            "[Newsletter] Error creating newsletter subscription without user_id:",
            insertError,
          );
          return {
            success: false,
            message: "Failed to create newsletter subscription",
            error: insertError.message,
          };
        }

        return {
          success: true,
          message:
            "Newsletter subscription created, will be linked to user account when ready",
        };
      }

      // Create new newsletter subscription for the user (subscribed by default)
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email,
          name: name || null,
          user_id: userId,
          newsletter_subscribed: true,
          manually_unsubscribed: false,
          unsubscribe_token: unsubscribeToken,
          subscribed_at: now,
          created_at: now,
          updated_at: now,
        });

      if (insertError) {
        console.error(
          "[Newsletter] Error creating newsletter subscription for new user:",
          insertError,
        );
        // If it's a foreign key constraint error, create without user_id
        if (insertError.code === "23503") {
          console.warn(
            "[Newsletter] Foreign key constraint violation, creating subscription without user_id",
          );
          const { error: fallbackInsertError } = await supabase
            .from("newsletter_subscribers")
            .insert({
              email,
              name: name || null,
              user_id: null, // Don't link to user_id yet
              newsletter_subscribed: true,
              manually_unsubscribed: false,
              unsubscribe_token: unsubscribeToken,
              subscribed_at: now,
              created_at: now,
              updated_at: now,
            });

          if (fallbackInsertError) {
            console.error(
              "[Newsletter] Error creating fallback newsletter subscription:",
              fallbackInsertError,
            );
            return {
              success: false,
              message: "Failed to create newsletter subscription",
              error: fallbackInsertError.message,
            };
          }

          return {
            success: true,
            message:
              "Newsletter subscription created, will be linked to user account when ready",
          };
        }

        return {
          success: false,
          message: "Failed to create newsletter subscription",
          error: insertError.message,
        };
      }

      return {
        success: true,
        message: "Newsletter subscription created for new user",
      };
    }

    // After successful creation/linking, try to link any orphaned subscriptions
    try {
      const linkResult = await linkOrphanedNewsletterSubscriptions(
        email,
        userId,
      );
      if (linkResult.success && linkResult.message?.includes("linked")) {
        console.log(`[Newsletter] ${linkResult.message} for user: ${email}`);
      }
    } catch (linkError) {
      console.warn(
        "[Newsletter] Error linking orphaned subscriptions (non-critical):",
        linkError,
      );
      // Don't fail the main operation if orphaned linking fails
    }

    return {
      success: true,
      message: "Newsletter subscription handled successfully",
    };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in handleUserRegistrationNewsletter:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "An unexpected error occurred",
      error: errorMessage,
    };
  }
}

/**
 * Link orphaned newsletter subscriptions to a user account
 * This function finds newsletter subscriptions with matching email but no user_id
 * and links them to the provided user account
 * @param email User's email address
 * @param userId User's ID from the users table
 * @returns Object with success status and message
 */
export async function linkOrphanedNewsletterSubscriptions(
  email: string,
  userId: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (!email || !userId) {
      return {
        success: false,
        message: "Email and user ID are required",
      };
    }

    console.log(
      `[Newsletter] Linking orphaned newsletter subscriptions for: ${email}`,
    );

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error("[Newsletter] Supabase client not initialized");
      return {
        success: false,
        message: "Database connection failed",
        error: "Supabase client not initialized",
      };
    }

    // Find newsletter subscriptions with matching email but no user_id
    const { data: orphanedSubscriptions, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .is("user_id", null);

    if (findError) {
      console.error(
        "[Newsletter] Error finding orphaned subscriptions:",
        findError,
      );
      return {
        success: false,
        message: "Failed to find orphaned newsletter subscriptions",
        error: findError.message,
      };
    }

    if (!orphanedSubscriptions || orphanedSubscriptions.length === 0) {
      console.log(
        `[Newsletter] No orphaned newsletter subscriptions found for: ${email}`,
      );
      return {
        success: true,
        message: "No orphaned newsletter subscriptions to link",
      };
    }

    // Verify that the user exists in the users table
    const { data: userExists, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userCheckError || !userExists) {
      console.warn("[Newsletter] User not found in users table:", {
        userId,
        email,
        error: userCheckError?.message,
      });
      return {
        success: false,
        message: "User not found in users table",
        error: userCheckError?.message,
      };
    }

    // Link all orphaned subscriptions to the user
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        user_id: userId,
        updated_at: now,
      })
      .eq("email", email)
      .is("user_id", null);

    if (updateError) {
      console.error(
        "[Newsletter] Error linking orphaned subscriptions:",
        updateError,
      );
      return {
        success: false,
        message: "Failed to link orphaned newsletter subscriptions",
        error: updateError.message,
      };
    }

    console.log(
      `[Newsletter] Successfully linked ${orphanedSubscriptions.length} orphaned newsletter subscriptions for: ${email}`,
    );
    return {
      success: true,
      message: `Successfully linked ${orphanedSubscriptions.length} orphaned newsletter subscriptions`,
    };
  } catch (error) {
    console.error(
      "[Newsletter] Unexpected error in linkOrphanedNewsletterSubscriptions:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "An unexpected error occurred",
      error: errorMessage,
    };
  }
}
