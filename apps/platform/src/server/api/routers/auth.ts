/**
 * Authentication tRPC Router
 * Handles user authentication, registration, and profile management
 */

import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  limitedProcedure,
} from "@/lib/trpc";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  sendVerificationEmailSchema,
  completeSignupSchema,
  changePasswordSchema,
  updateProfileSchema,
  checkEmailSchema,
} from "../schemas/auth";
import { createServiceRoleClient } from "@/utils/supabase/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { handleUserRegistrationNewsletter } from "@/lib/newsletterService";

export const authRouter = createTRPCRouter({
  // Check if email is available
  checkEmail: publicProcedure
    .input(checkEmailSchema)
    .query(async ({ input, ctx }) => {
      const { email } = input;

      const { data: existingUser } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      return {
        available: !existingUser,
        message: existingUser
          ? "Email is already registered"
          : "Email is available",
      };
    }),

  // Register new user
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password, name } = input;

      // Check if user already exists
      const { data: existingUser } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Create user
      const { data: newUser, error } = await ctx.supabase
        .from("users")
        .insert({
          email,
          password: hashedPassword,
          name,
          email_verification_token: verificationToken,
          email_verified: false,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
          cause: error,
        });
      }

      // Handle newsletter subscription for new user
      try {
        await handleUserRegistrationNewsletter(email, name, newUser.id);
        console.log(
          `[Auth] Newsletter subscription handled for new user: ${email}`,
        );
      } catch (newsletterError) {
        console.error(
          "[Auth] Error handling newsletter subscription for new user:",
          newsletterError,
        );
        // Don't fail user registration if newsletter subscription fails
      }

      // TODO: Send verification email
      // await sendVerificationEmail(email, verificationToken);

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.picture,
          email_verified: newUser.email_verified,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at,
        },
        message:
          "Registration successful. Please check your email for verification.",
        requiresVerification: true,
      };
    }),

  // Login user (for tRPC clients)
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const { email, password } = input;

    // Check if user exists
    const { data: user, error } = await ctx.supabase
      .from("users")
      .select(
        "id, email, password_hash, name, role, provider, picture, custom_picture, email_verified, login_count, last_login",
      )
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to verify user",
        cause: error,
      });
    }

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Check if the user can sign in with password
    if (
      user.provider === "email" ||
      user.provider === "credentials" ||
      user.password_hash
    ) {
      if (!user.password_hash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "This account cannot be accessed with a password. Please use Google sign-in.",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash,
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
    } else if (user.provider === "google") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "This Google account cannot be accessed with a password. Please use Google sign-in.",
      });
    }

    // Update login stats
    try {
      await ctx.supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
          login_count: user.login_count ? user.login_count + 1 : 1,
        })
        .eq("id", user.id);
    } catch (updateErr) {
      console.error(
        `[tRPC Login] Exception updating login stats: ${updateErr}`,
      );
      // Continue anyway, this is not critical
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.custom_picture ? user.picture : null,
        role: user.role || "user",
        email_verified: user.email_verified,
      },
      message: "Login successful",
    };
  }),

  // Verify email
  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input, ctx }) => {
      const { token, email } = input;

      let query = ctx.supabase
        .from("users")
        .select("id, email, email_verified")
        .eq("email_verification_token", token);

      if (email) {
        query = query.eq("email", email);
      }

      const { data: user, error } = await query.single();

      if (error || !user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification token",
        });
      }

      if (user.email_verified) {
        return {
          success: true,
          message: "Email is already verified",
        };
      }

      // Update user as verified
      const { error: updateError } = await ctx.supabase
        .from("users")
        .update({
          email_verified: true,
          email_verification_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify email",
          cause: updateError,
        });
      }

      return {
        success: true,
        message: "Email verified successfully",
      };
    }),

  // Send verification email
  sendVerificationEmail: publicProcedure
    .input(sendVerificationEmailSchema)
    .mutation(async ({ input, ctx }) => {
      const { email } = input;

      const { data: user } = await ctx.supabase
        .from("users")
        .select("id, email_verified")
        .eq("email", email)
        .single();

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.email_verified) {
        return {
          success: true,
          message: "Email is already verified",
        };
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Update user with new token
      const { error } = await ctx.supabase
        .from("users")
        .update({
          email_verification_token: verificationToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate verification token",
          cause: error,
        });
      }

      // TODO: Send verification email
      // await sendVerificationEmail(email, verificationToken);

      return {
        success: true,
        message: "Verification email sent",
      };
    }),

  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User ID not found",
      });
    }

    const { data: user, error } = await ctx.supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.picture,
      bio: user.bio,
      website: user.website,
      location: user.location,
      email_verified: user.email_verified,
      newsletter_subscribed: user.newsletter_subscribed,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }),

  // Update user profile
  updateProfile: limitedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID not found",
        });
      }

      const { data: updatedUser, error } = await ctx.supabase
        .from("users")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
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
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.picture,
          bio: updatedUser.bio,
          website: updatedUser.website,
          location: updatedUser.location,
        },
      };
    }),

  // Forgot password
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { email } = input;

      // Check if user exists
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id, email, provider, password_hash")
        .eq("email", email)
        .single();

      // For security, always return success even if email doesn't exist
      if (!user) {
        return {
          success: true,
          message:
            "If an account with this email exists, a password reset link has been sent.",
        };
      }

      // Only allow password reset for email/password accounts
      if (user.provider !== "email" || !user.password_hash) {
        return {
          success: true,
          message:
            "If an account with this email exists, a password reset link has been sent.",
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      // Store reset token
      const { error } = await ctx.supabase
        .from("users")
        .update({
          reset_token: resetToken,
          reset_token_expires: resetTokenExpiry,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate reset token",
          cause: error,
        });
      }

      // TODO: Send password reset email
      // This would typically integrate with your email service
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return {
        success: true,
        message:
          "If an account with this email exists, a password reset link has been sent.",
      };
    }),

  // Reset password
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { token, password } = input;

      // Find user with valid reset token
      const { data: user, error: userError } = await ctx.supabase
        .from("users")
        .select("id, email, reset_token, reset_token_expires")
        .eq("reset_token", token)
        .single();

      if (userError || !user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      // Check if token is expired
      if (new Date() > new Date(user.reset_token_expires)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update password and clear reset token
      const { error } = await ctx.supabase
        .from("users")
        .update({
          password_hash: hashedPassword,
          reset_token: null,
          reset_token_expires: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password",
          cause: error,
        });
      }

      return {
        success: true,
        message: "Password reset successfully",
      };
    }),

  // Change password (for authenticated users)
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { currentPassword, newPassword } = input;
      const userId = ctx.user?.id;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User ID not found",
        });
      }

      // Get current user with password hash
      const { data: user, error: userError } = await ctx.supabase
        .from("users")
        .select("id, password_hash, provider")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if user has a password (email/password account)
      if (user.provider !== "email" || !user.password_hash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password change not available for this account type",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password_hash,
      );
      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const { error } = await ctx.supabase
        .from("users")
        .update({
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change password",
          cause: error,
        });
      }

      return {
        success: true,
        message: "Password changed successfully",
      };
    }),

  // Verify password reset token
  verifyResetToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // First check if token exists in password_reset_tokens table
        const { data: resetToken, error: tokenError } = await supabase
          .from("password_reset_tokens")
          .select("*")
          .eq("token", input.token)
          .gt("expires_at", new Date().toISOString()) // Token must not be expired
          .eq("used", false) // Token must not be used
          .single();

        if (tokenError || !resetToken) {
          // If password_reset_tokens table doesn't exist or token not found,
          // fall back to checking users table for legacy reset tokens
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email, reset_token, reset_token_expires")
            .eq("reset_token", input.token)
            .single();

          if (userError || !user) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid or expired token",
            });
          }

          // Check if legacy token is expired
          if (new Date() > new Date(user.reset_token_expires)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Reset token has expired",
            });
          }

          return {
            success: true,
            userId: user.id,
            email: user.email,
          };
        }

        // Get user email for the new token system
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("email")
          .eq("id", resetToken.user_id)
          .single();

        if (userError || !user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          success: true,
          userId: resetToken.user_id,
          email: user.email,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify reset token",
          cause: error,
        });
      }
    }),
});
