/**
 * Auth Newsletter Integration
 *
 * This module provides functions to integrate authentication with newsletter subscriptions.
 * It handles automatic subscription of users who sign in through Google and manages
 * email verification for email/password sign-ups.
 */

import {
  subscribeToNewsletter,
  linkOrphanedNewsletterSubscriptions,
} from "./newsletterService";
import { sendVerificationEmail } from "./verification-email";
import crypto from "crypto";

/**
 * Subscribe a user to the newsletter after Google sign-in
 * @param userId User ID from Supabase auth
 * @param email User's email address
 * @param name User's name (optional)
 * @returns Object with success status and message
 */
export async function subscribeGoogleUser(
  userId: string,
  email: string,
  name?: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log(`[Auth Newsletter] Subscribing Google user: ${email}`);

    if (!email) {
      return {
        success: false,
        message: "Email is required",
        error: "Missing email address",
      };
    }

    // Check if user is already subscribed
    const { createServiceRoleClient } = await import("@/utils/supabase/server");
    const supabase = await createServiceRoleClient();
    if (!supabase) {
      return {
        success: false,
        message: "Database connection failed",
        error: "Supabase client not initialized",
      };
    }

    const { data: existingSubscriber, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, newsletter_subscribed")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned
      console.error(
        "[Auth Newsletter] Error checking for existing subscriber:",
        checkError,
      );
      return {
        success: false,
        message: "Failed to check subscription status",
        error: checkError.message,
      };
    }

    // If already subscribed and active, do nothing
    if (existingSubscriber && existingSubscriber.newsletter_subscribed) {
      console.log(`[Auth Newsletter] User ${email} is already subscribed`);
      return {
        success: true,
        message: "User is already subscribed",
      };
    }

    // If subscribed but inactive, reactivate
    if (existingSubscriber && !existingSubscriber.newsletter_subscribed) {
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          newsletter_subscribed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubscriber.id);

      if (updateError) {
        console.error(
          "[Auth Newsletter] Error reactivating subscriber:",
          updateError,
        );
        return {
          success: false,
          message: "Failed to reactivate subscription",
          error: updateError.message,
        };
      }

      console.log(`[Auth Newsletter] Reactivated subscription for ${email}`);
      return {
        success: true,
        message: "Subscription reactivated",
      };
    }

    // Subscribe the user to the newsletter with user ID
    const result = await subscribeToNewsletter(email, name, userId);

    if (result.success) {
      // Update the user's profile to mark them as subscribed
      const { error: updateError } = await supabase.from("users").upsert({
        id: userId,
        email: email,
        newsletter_subscribed: true,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error(
          "[Auth Newsletter] Error updating user profile:",
          updateError,
        );
        // Continue anyway, this is not critical
      }
    }

    return result;
  } catch (error) {
    console.error("[Auth Newsletter] Error subscribing Google user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to subscribe user",
      error: errorMessage,
    };
  }
}

/**
 * Generate a verification token for email verification
 * @param email User's email address
 * @returns The generated verification token
 */
export function generateVerificationToken(email: string): string {
  const timestamp = Date.now().toString();
  const randomString = crypto.randomBytes(16).toString("hex");
  return Buffer.from(`${email}:${timestamp}:${randomString}`).toString(
    "base64url",
  );
}

/**
 * Verify an email verification token
 * @param token Verification token
 * @returns Object with success status, email, and timestamp
 */
export function verifyEmailToken(token: string): {
  valid: boolean;
  email?: string;
  timestamp?: number;
  error?: string;
} {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [email, timestamp, randomString] = decoded.split(":");

    if (!email || !timestamp || !randomString) {
      return {
        valid: false,
        error: "Invalid token format",
      };
    }

    const tokenTimestamp = parseInt(timestamp);
    const currentTime = Date.now();
    const tokenAge = currentTime - tokenTimestamp;

    // Check if token is expired (24 hours)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return {
        valid: false,
        email,
        timestamp: tokenTimestamp,
        error:
          "Verification link has expired. Please request a new verification email.",
      };
    }

    return {
      valid: true,
      email,
      timestamp: tokenTimestamp,
    };
  } catch (error) {
    console.error("[Auth Newsletter] Error verifying email token:", error);
    return {
      valid: false,
      error: "Invalid token",
    };
  }
}

/**
 * Send a verification email to a user
 * @param email User's email address
 * @param name User's name (optional)
 * @returns Object with success status and message
 */
export async function sendAccountVerificationEmail(
  email: string,
  name?: string,
): Promise<{
  success: boolean;
  message: string;
  error?: string;
  token?: string;
}> {
  try {
    console.log(`[Auth Newsletter] Sending verification email to: ${email}`);

    if (!email) {
      return {
        success: false,
        message: "Email is required",
        error: "Missing email address",
      };
    }

    // Generate verification token
    const token = generateVerificationToken(email);

    // Store verification token in database
    const { createServiceRoleClient } = await import("@/utils/supabase/server");
    const supabase = await createServiceRoleClient();
    if (!supabase) {
      return {
        success: false,
        message: "Database connection failed",
        error: "Supabase client not initialized",
      };
    }

    // Check if verification_tokens table exists
    const { error: tableCheckError } = await supabase
      .from("verification_tokens")
      .select("id")
      .limit(1);

    // If table exists, store the token
    if (!tableCheckError) {
      const { error: insertError } = await supabase
        .from("verification_tokens")
        .insert({
          email,
          token,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        });

      if (insertError) {
        console.error(
          "[Auth Newsletter] Error storing verification token:",
          insertError,
        );
        // Continue anyway, we'll send the email even if we can't store the token
      }
    } else {
      console.log(
        "[Auth Newsletter] Verification tokens table doesn't exist, skipping token storage",
      );
    }

    // Create verification link
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.split(",")[0] ||
      "http://localhost:3000";
    const verificationLink = `${baseUrl}/auth/verify?token=${token}`;

    // Send verification email
    const result = await sendVerificationEmail(
      email,
      name,
      undefined,
      verificationLink,
    );

    if (!result.success) {
      return {
        success: false,
        message: "Failed to send verification email",
        error: result.error,
      };
    }

    return {
      success: true,
      message: "Verification email sent",
      token: process.env.NODE_ENV === "development" ? token : undefined, // Only include token in development
    };
  } catch (error) {
    console.error("[Auth Newsletter] Error sending verification email:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to send verification email",
      error: errorMessage,
    };
  }
}

/**
 * Verify a user's email and finalize account creation
 * @param token Verification token
 * @returns Object with success status and message
 */
export async function verifyUserEmail(
  token: string,
): Promise<{
  success: boolean;
  message: string;
  error?: string;
  email?: string;
}> {
  try {
    console.log(
      `[Auth Newsletter] Verifying email with token: ${token.substring(0, 10)}...`,
    );

    // Verify the token
    const tokenResult = verifyEmailToken(token);
    console.log(`[Auth Newsletter] Token verification result:`, tokenResult);

    if (!tokenResult.valid || !tokenResult.email) {
      console.log(`[Auth Newsletter] Token validation failed:`, {
        valid: tokenResult.valid,
        email: tokenResult.email,
        error: tokenResult.error,
      });
      return {
        success: false,
        message: tokenResult.error || "Invalid verification link",
        error: tokenResult.error,
        email: tokenResult.email,
      };
    }

    const email = tokenResult.email;

    // Get Supabase client
    const { createServiceRoleClient } = await import("@/utils/supabase/server");
    const supabase = await createServiceRoleClient();
    if (!supabase) {
      return {
        success: false,
        message: "Database connection failed",
        error: "Supabase client not initialized",
      };
    }

    // Check if verification_tokens table exists and validate token
    const { data: tokenData, error: tokenCheckError } = await supabase
      .from("verification_tokens")
      .select("id, email")
      .eq("token", token)
      .single();

    // Check if the token exists in the database
    if (!tokenCheckError && tokenData) {
      // Token exists in database, delete it
      await supabase.from("verification_tokens").delete().eq("token", token);
    } else {
      // Check if the token has already been used by checking if the user is already verified
      const { data: userData, error: userCheckError } = await supabase
        .from("users")
        .select("email_verified")
        .eq("email", email)
        .single();

      if (!userCheckError && userData && userData.email_verified) {
        // User is already verified, token was probably used before
        return {
          success: false,
          message:
            "This verification link has already been used. Your email is already verified.",
          email,
        };
      }

      console.log(
        "[Auth Newsletter] Token not found in database, checking if user exists before verification",
      );

      // Check if the user exists before proceeding
      const { data: userExists, error: userExistsError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userExistsError || !userExists) {
        return {
          success: false,
          message:
            "No account found with this email address. Please sign up first.",
          error: "User not found",
        };
      }

      console.log(
        "[Auth Newsletter] User exists, continuing with verification",
      );
    }

    // Update user's email_verified status
    // We mark the email as verified but don't set a password or name yet
    // This will ensure the user is directed to the complete-profile page
    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      console.error(
        "[Auth Newsletter] Error updating user verification status:",
        updateError,
      );
      return {
        success: false,
        message: "Failed to verify email",
        error: updateError.message,
      };
    }

    // Subscribe the user to the newsletter
    const subscribeResult = await subscribeToNewsletter(email, undefined);

    if (!subscribeResult.success) {
      console.error(
        "[Auth Newsletter] Error subscribing verified user:",
        subscribeResult.error,
      );
      // Continue anyway, the email verification is more important
    }

    console.log(
      `[Auth Newsletter] Email verification successful for: ${email}`,
    );
    return {
      success: true,
      message: "Email verified successfully",
      email,
    };
  } catch (error) {
    console.error("[Auth Newsletter] Error verifying email:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to verify email",
      error: errorMessage,
    };
  }
}
