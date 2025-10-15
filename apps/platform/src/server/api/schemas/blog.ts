/**
 * Blog tRPC Schemas
 * Validation schemas for blog-related operations
 */

import { z } from "zod";
import {
  uuidSchema,
  slugSchema,
  paginationSchema,
  searchSchema,
  sortOrderSchema,
  blogSortSchema,
  contentTypeSchema,
  urlSchema,
} from "./common";

// Blog post creation schema
export const createBlogPostSchema = z.object({
  title: z.string().min(5).max(200),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  cover_image: urlSchema.optional(),
  category: z.string().min(1),
  featured: z.boolean().default(false),
  draft: z.boolean().default(true),
  premium: z.boolean().default(false),
  content_type: contentTypeSchema.default("blog"),
  recommendation_tags: z.array(z.string()).default([]),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  keywords: z.array(z.string()).default([]),
  published_at: z.string().datetime().optional(),
  concept_ids: z.array(uuidSchema).default([]),
});

// Blog post update schema
export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  id: uuidSchema,
});

// Blog post query schema
export const getBlogPostSchema = z.object({
  slug: slugSchema,
  includeEngagement: z.boolean().default(false),
  includeDrafts: z.boolean().default(false),
});

// Blog posts list schema
export const getBlogPostsSchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  draft: z.boolean().optional(),
  premium: z.boolean().optional(),
  author_user_id: uuidSchema.optional(),
  content_type: contentTypeSchema.optional(),
  sortBy: blogSortSchema,
  sortOrder: sortOrderSchema,
  includeDrafts: z.boolean().default(false),
});

// Admin blog posts schema (simplified for admin operations)
export const getAdminBlogPostsSchema = z.object({
  includeDrafts: z.boolean().default(true),
  category: z.string().optional(),
});

// Admin single blog post schema
export const getAdminBlogPostSchema = z.object({
  slug: slugSchema,
  includeDrafts: z.boolean().default(true),
});

// Blog categories schema
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema,
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  featured: z.boolean().default(false),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: uuidSchema,
});

// Blog engagement schemas
export const incrementViewSchema = z.object({
  slug: slugSchema,
  userId: uuidSchema.optional(),
});

export const toggleLikeSchema = z.object({
  postId: uuidSchema,
});

export const toggleBookmarkSchema = z.object({
  postId: uuidSchema,
});

// Blog post slug schema
export const getBlogPostSlugSchema = z.object({
  id: uuidSchema,
});

// Comment count schema
export const getCommentCountSchema = z.object({
  postId: uuidSchema,
});

// Comment schemas
export const createCommentSchema = z.object({
  postId: uuidSchema,
  content: z.string().min(1).max(1000),
  parentId: uuidSchema.nullable().optional(),
});

export const updateCommentSchema = z.object({
  id: uuidSchema,
  content: z.string().min(1).max(1000),
});

export const deleteCommentSchema = z.object({
  id: uuidSchema,
});

export const moderateCommentSchema = z.object({
  commentId: uuidSchema,
  action: z.enum([
    "approve",
    "reject",
    "delete",
    "restore",
    "permanent_delete",
    "clear_report",
  ]),
  moderatorComment: z.string().optional(),
  userDeleted: z.boolean().optional(),
});

export const getCommentsSchema = z.object({
  postId: uuidSchema,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  includeReplies: z.boolean().default(true),
  sortBy: z
    .enum(["created_at", "updated_at", "likes_count"])
    .default("created_at"),
  sortOrder: sortOrderSchema,
});

export const getAllCommentsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  sortBy: z.enum(["created_at", "updated_at"]).default("created_at"),
  sortOrder: sortOrderSchema,
  status: z
    .enum(["all", "approved", "pending", "deleted", "reported"])
    .default("all"),
});

// Blog analytics schemas
export const getBlogAnalyticsSchema = z.object({
  postId: uuidSchema.optional(),
  dateRange: z
    .object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    })
    .optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

// Response schemas
export const blogPostSchema = z.object({
  id: uuidSchema,
  slug: slugSchema,
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  cover_image: z.string().nullable(),
  cover_image_url_processed: z.string().nullable(),
  date: z.string().datetime(),
  author_user_id: uuidSchema,
  category: z.string(),
  featured: z.boolean(),
  draft: z.boolean(),
  premium: z.boolean(),
  content_type: contentTypeSchema,
  recommendation_tags: z.array(z.string()),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  keywords: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  published_at: z.string().datetime().nullable(),
  // Engagement metrics
  likes_count: z.number().optional(),
  comments_count: z.number().optional(),
  views_count: z.number().optional(),
  // Author info
  author: z
    .object({
      id: uuidSchema,
      name: z.string().nullable(),
      avatar: z.string().nullable(),
    })
    .optional(),
});

export const blogCategorySchema = z.object({
  id: uuidSchema,
  name: z.string(),
  slug: slugSchema,
  description: z.string().nullable(),
  color: z.string().nullable(),
  featured: z.boolean(),
  posts_count: z.number().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const commentSchema: z.ZodType<any> = z.object({
  id: uuidSchema,
  content: z.string(),
  blog_post_id: uuidSchema, // Fixed: was post_id, should be blog_post_id
  user_id: uuidSchema,
  parent_id: uuidSchema.nullable(),
  is_approved: z.boolean(), // Fixed: was approved, should be is_approved
  is_reported: z.boolean(), // Fixed: was reported, should be is_reported
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // User info
  user: z.object({
    id: uuidSchema,
    name: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
  // Replies (if included)
  replies: z.array(z.lazy(() => commentSchema)).optional(),
});

// Export type helpers
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type GetBlogPostInput = z.infer<typeof getBlogPostSchema>;
export type GetBlogPostsInput = z.infer<typeof getBlogPostsSchema>;
export type GetBlogPostSlugInput = z.infer<typeof getBlogPostSlugSchema>;
export type GetCommentCountInput = z.infer<typeof getCommentCountSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type BlogCategory = z.infer<typeof blogCategorySchema>;
export type Comment = z.infer<typeof commentSchema>;
