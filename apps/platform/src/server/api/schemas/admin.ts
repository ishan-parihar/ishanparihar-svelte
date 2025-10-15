/**
 * Admin tRPC Schemas
 * Validation schemas for admin-related operations
 */

import { z } from "zod";
import { emailSchema, uuidSchema } from "./common";

// Admin user management schemas
export const promoteUserToAdminSchema = z.object({
  email: emailSchema,
  permissions: z.array(z.string()).optional(),
});

export const demoteAdminToUserSchema = z.object({
  userId: uuidSchema,
});

export const updateAdminPermissionsSchema = z.object({
  userId: uuidSchema,
  permissions: z.array(z.string()),
});

// Admin analytics schemas
export const getAnalyticsSchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("month"),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const getDashboardStatsSchema = z.object({
  include_charts: z.boolean().default(false),
});

// Admin content management schemas
export const moderateContentSchema = z.object({
  content_id: uuidSchema,
  content_type: z.enum(["post", "comment", "user"]),
  action: z.enum(["approve", "reject", "flag", "ban"]),
  reason: z.string().optional(),
});

export const bulkModerationSchema = z.object({
  content_ids: z.array(uuidSchema),
  content_type: z.enum(["post", "comment", "user"]),
  action: z.enum(["approve", "reject", "flag", "ban"]),
  reason: z.string().optional(),
});

// Admin user lookup schemas
export const getUserByEmailSchema = z.object({
  email: emailSchema,
});

export const searchUsersSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
  include_banned: z.boolean().default(false),
});

// Admin team management schemas
export const getTeamSchema = z.object({
  include_permissions: z.boolean().default(true),
});

export const addTeamMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "moderator", "editor"]).default("admin"),
  permissions: z.array(z.string()).optional(),
});

export const removeTeamMemberSchema = z.object({
  userId: uuidSchema,
});

// Admin response schemas
export const adminUserSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  name: z.string().nullable(),
  avatar: z.string().url().nullable(),
  role: z.enum(["admin", "moderator", "editor"]),
  permissions: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_login: z.string().datetime().nullable(),
});

export const dashboardStatsSchema = z.object({
  total_users: z.number(),
  total_posts: z.number(),
  total_comments: z.number(),
  total_orders: z.number(),
  total_revenue: z.number(),
  new_users_today: z.number(),
  new_posts_today: z.number(),
  pending_moderation: z.number(),
  active_support_tickets: z.number(),
});

export const analyticsDataSchema = z.object({
  period: z.string(),
  data: z.array(
    z.object({
      date: z.string(),
      users: z.number(),
      posts: z.number(),
      comments: z.number(),
      orders: z.number(),
      revenue: z.number(),
    }),
  ),
  totals: z.object({
    users: z.number(),
    posts: z.number(),
    comments: z.number(),
    orders: z.number(),
    revenue: z.number(),
  }),
});

export const moderationActionSchema = z.object({
  id: uuidSchema,
  content_id: uuidSchema,
  content_type: z.enum(["post", "comment", "user"]),
  action: z.enum(["approve", "reject", "flag", "ban"]),
  reason: z.string().nullable(),
  moderator_id: uuidSchema,
  created_at: z.string().datetime(),
});

// Paginated admin responses
export const paginatedAdminUsersSchema = z.object({
  users: z.array(adminUserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paginatedModerationActionsSchema = z.object({
  actions: z.array(moderationActionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
