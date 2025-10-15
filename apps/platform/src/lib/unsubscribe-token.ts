/**
 * Unsubscribe Token Utilities
 *
 * This module provides functions for generating and validating unsubscribe tokens
 * for newsletter subscribers.
 */

import crypto from "crypto";
import { createClient } from "@/utils/supabase/client";

/**
 * Generate a unique unsubscribe token for a subscriber
 * @param email Subscriber's email address
 * @returns The generated token or null if there was an error
 */
export async function generateUnsubscribeToken(
  email: string,
): Promise<string | null> {
  try {
    // Generate a random token
    const randomBytes = crypto.randomBytes(32);
    const token = randomBytes.toString("hex");

    // Get Supabase client
    const supabase = createClient();
    if (!supabase) {
      console.error("[Unsubscribe] Failed to get Supabase client");
      return null;
    }

    // Update the subscriber record with the new token
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribe_token: token })
      .eq("email", email);

    if (error) {
      console.error("[Unsubscribe] Error storing unsubscribe token:", error);
      return null;
    }

    return token;
  } catch (error) {
    console.error("[Unsubscribe] Error generating unsubscribe token:", error);
    return null;
  }
}

/**
 * Get a subscriber's email by their unsubscribe token
 * @param token Unsubscribe token
 * @returns The subscriber's email or null if not found
 */
export async function getSubscriberByToken(
  token: string,
): Promise<string | null> {
  try {
    // Get Supabase client
    const supabase = createClient();
    if (!supabase) {
      console.error("[Unsubscribe] Failed to get Supabase client");
      return null;
    }

    // Find the subscriber with this token
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("unsubscribe_token", token)
      .single();

    if (error || !data) {
      console.error("[Unsubscribe] Error finding subscriber by token:", error);
      return null;
    }

    return data.email;
  } catch (error) {
    console.error("[Unsubscribe] Error getting subscriber by token:", error);
    return null;
  }
}

/**
 * Unsubscribe a subscriber using their token
 * @param token Unsubscribe token
 * @returns Object with success status and message
 */
export async function unsubscribeByToken(
  token: string,
): Promise<{ success: boolean; message: string; email?: string }> {
  try {
    // Get Supabase client
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        message: "Database connection failed",
      };
    }

    // Find the subscriber with this token
    const { data, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("email, newsletter_subscribed")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !data) {
      return {
        success: false,
        message: "Invalid or expired unsubscribe link",
      };
    }

    // Check if already unsubscribed
    if (data.newsletter_subscribed === false) {
      return {
        success: true,
        message: "You were already unsubscribed",
        email: data.email,
      };
    }

    // Update the subscriber's status to inactive
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        newsletter_subscribed: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("unsubscribe_token", token);

    if (updateError) {
      console.error(
        "[Unsubscribe] Error updating subscriber status:",
        updateError,
      );
      return {
        success: false,
        message: "Failed to unsubscribe. Please try again.",
      };
    }

    return {
      success: true,
      message: "You have been successfully unsubscribed",
      email: data.email,
    };
  } catch (error) {
    console.error("[Unsubscribe] Error unsubscribing by token:", error);
    return {
      success: false,
      message: "An error occurred while processing your request",
    };
  }
}
