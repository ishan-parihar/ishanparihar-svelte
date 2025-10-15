/**
 * Authentication tRPC Schemas
 * Validation schemas for authentication-related operations
 */

import { z } from "zod";
import { emailSchema, passwordSchema, uuidSchema } from "./common";

// User registration schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(2).max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// User login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Email verification schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  email: emailSchema.optional(),
});

// Send verification email schema
export const sendVerificationEmailSchema = z.object({
  email: emailSchema,
});

// Complete signup schema (for additional profile info)
export const completeSignupSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
  newsletter_subscribed: z.boolean().default(false),
});

// Change password schema (for authenticated users)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });

// Update profile schema
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
});

// Check email availability schema
export const checkEmailSchema = z.object({
  email: emailSchema,
});

// Session management schemas
export const createSessionSchema = z.object({
  userId: uuidSchema,
  expiresAt: z.date(),
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Two-factor authentication schemas (for future use)
export const enable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const verify2FASchema = z.object({
  code: z.string().length(6, "2FA code must be 6 digits"),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
  code: z.string().length(6, "2FA code must be 6 digits"),
});

// Response schemas
export const authUserSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  name: z.string().nullable(),
  avatar: z.string().url().nullable(),
  email_verified: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const loginResponseSchema = z.object({
  user: authUserSchema,
  session: z.object({
    id: z.string(),
    expires: z.string().datetime(),
  }),
  message: z.string(),
});

export const registerResponseSchema = z.object({
  user: authUserSchema,
  message: z.string(),
  requiresVerification: z.boolean(),
});

// Export type helpers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type CompleteSignupInput = z.infer<typeof completeSignupSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
