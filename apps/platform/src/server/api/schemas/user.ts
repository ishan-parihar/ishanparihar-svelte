/**
 * User tRPC Schemas
 * Validation schemas for user-related operations
 */

import { z } from "zod";
import { emailSchema, uuidSchema } from "./common";

// User profile update schema
export const updateUserProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
  twitter: z.string().max(50).optional(),
  linkedin: z.string().max(100).optional(),
  github: z.string().max(50).optional(),
});

// User preferences schema
export const updateUserPreferencesSchema = z.object({
  email_notifications: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  newsletter_subscription: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().max(10).optional(),
});

// User password change schema
export const changeUserPasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

// User avatar upload schema
export const uploadUserAvatarSchema = z.object({
  file: z.string(), // Base64 encoded file or URL
  filename: z.string(),
  content_type: z.string(),
});

// Get user by email schema (admin use)
export const getUserByEmailSchema = z.object({
  email: emailSchema,
});

// Get user by ID schema
export const getUserByIdSchema = z.object({
  id: uuidSchema,
});

// User search schema
export const searchUsersSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
});

// User response schema
export const userSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  name: z.string().nullable(),
  bio: z.string().nullable(),
  avatar: z.string().url().nullable(),
  website: z.string().url().nullable(),
  location: z.string().nullable(),
  twitter: z.string().nullable(),
  linkedin: z.string().nullable(),
  github: z.string().nullable(),
  email_verified: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// User preferences response schema
export const userPreferencesSchema = z.object({
  user_id: uuidSchema,
  email_notifications: z.boolean(),
  marketing_emails: z.boolean(),
  newsletter_subscription: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// User stats schema
export const userStatsSchema = z.object({
  total_posts: z.number(),
  total_comments: z.number(),
  total_likes: z.number(),
  total_bookmarks: z.number(),
  joined_date: z.string().datetime(),
});

// User activity schema
export const userActivitySchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  activity_type: z.enum([
    "post_created",
    "comment_created",
    "post_liked",
    "post_bookmarked",
  ]),
  activity_data: z.record(z.any()),
  created_at: z.string().datetime(),
});

// Paginated users response schema
export const paginatedUsersSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
