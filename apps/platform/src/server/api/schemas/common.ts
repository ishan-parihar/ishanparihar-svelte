/**
 * Common tRPC Schemas
 * Shared validation schemas used across multiple routers
 */

import { z } from "zod";

// Common ID schemas
export const uuidSchema = z.string().uuid();
export const slugSchema = z.string().min(1).max(200);

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(10),
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  draft: z.boolean().optional(),
  premium: z.boolean().optional(),
});

// Sort schemas
export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");
export const blogSortSchema = z
  .enum(["created_at", "updated_at", "title", "views_count", "likes_count"])
  .default("created_at");

// Status schemas
export const statusSchema = z.enum([
  "active",
  "inactive",
  "pending",
  "archived",
]);
export const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);

// File upload schemas
export const imageUploadSchema = z.object({
  file: z.string(), // base64 encoded file
  filename: z.string(),
  contentType: z.string(),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
});

// Response schemas
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

// Date range schema
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Email schema
export const emailSchema = z.string().email();

// Password schema with validation
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[a-z]/, { message: "Password must include lowercase letters" })
  .regex(/[A-Z]/, { message: "Password must include uppercase letters" })
  .regex(/[0-9]/, { message: "Password must include numbers" })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Password must include special characters",
  });

// URL schema
export const urlSchema = z.string().url();

// Phone schema
export const phoneSchema = z.string().min(10).max(15);

// Metadata schema for flexible key-value pairs
export const metadataSchema = z.record(z.any()).optional();

// Content type schemas
export const contentTypeSchema = z.enum(["blog", "research_paper"]);
export const serviceTypeSchema = z.enum([
  "product",
  "service",
  "course",
  "consultation",
]);
export const pricingTypeSchema = z.enum(["one_time", "recurring", "custom"]);
export const billingPeriodSchema = z.enum([
  "monthly",
  "yearly",
  "weekly",
  "daily",
]);

// Currency schema
export const currencySchema = z
  .enum(["USD", "EUR", "GBP", "INR"])
  .default("USD");

// Order and payment status schemas
export const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "refunded",
  "completed",
]);
export const paymentStatusSchema = z.enum([
  "created",
  "attempted",
  "failed",
  "captured",
  "refunded",
  "partially_refunded",
]);

// Support ticket schemas - includes resolved status
export const ticketStatusSchema = z.enum([
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
]);
export const ticketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

// Chat session schemas
export const chatStatusSchema = z.enum(["active", "inactive", "ended"]);

// Permission schemas
export const permissionScopeSchema = z.enum([
  "MANAGE_BLOG",
  "MANAGE_USERS",
  "MANAGE_ADMINS",
  "MANAGE_COMMENTS",
  "MANAGE_NEWSLETTER",
  "MANAGE_IMAGES",
  "MANAGE_SERVICES",
  "MANAGE_PAYMENTS",
  "VIEW_ANALYTICS",
  "MANAGE_SUPPORT",
  "MANAGE_CHAT",
  "VIEW_SUPPORT_TICKETS",
  "ASSIGN_TICKETS",
  "VIEW_SUPPORT_ANALYTICS",
  "MANAGE_SALES",
]);

// Newsletter schemas
export const newsletterStatusSchema = z.enum([
  "subscribed",
  "unsubscribed",
  "pending",
]);
export const campaignStatusSchema = z.enum([
  "draft",
  "sending",
  "sent",
  "failed",
  "scheduled",
]);

// Newsletter campaign schemas
export const createCampaignSchema = z.object({
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  status: campaignStatusSchema.default("draft"),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: uuidSchema,
});

export const getCampaignSchema = z.object({
  id: uuidSchema,
});

export const sendCampaignSchema = z.object({
  id: uuidSchema,
  scheduledTime: z.string().datetime().optional(),
});

// Newsletter welcome template schemas
export const welcomeTemplateSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().optional(),
  isEnabled: z.boolean().default(true),
});

export const sendWelcomeTestSchema = z.object({
  email: emailSchema,
  subject: z.string().min(1, "Subject is required"),
  content: z.string().optional(),
});

// User profile picture update schema
export const updateProfilePictureDirectSchema = z.object({
  pictureUrl: z.string().url("Valid picture URL is required"),
});

// Password reset token verification schema
export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Export type helpers
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type MetadataInput = z.infer<typeof metadataSchema>;
export type WelcomeTemplateInput = z.infer<typeof welcomeTemplateSchema>;
export type SendWelcomeTestInput = z.infer<typeof sendWelcomeTestSchema>;
export type UpdateProfilePictureDirectInput = z.infer<
  typeof updateProfilePictureDirectSchema
>;
export type VerifyResetTokenInput = z.infer<typeof verifyResetTokenSchema>;
