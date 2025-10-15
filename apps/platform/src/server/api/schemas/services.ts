/**
 * Services tRPC Schemas
 * Validation schemas for service/product operations
 */

import { z } from "zod";
import { uuidSchema } from "./common";

// Service creation and update schemas
export const createServiceSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  short_description: z.string().max(500).optional(),
  price: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  image_url: z.string().url().optional(),
  gallery_images: z.array(z.string().url()).optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  is_digital: z.boolean().default(false),
  download_url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateServiceSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  short_description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  image_url: z.string().url().optional(),
  gallery_images: z.array(z.string().url()).optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
  is_digital: z.boolean().optional(),
  download_url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

// Service retrieval schemas
export const getServicesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  search: z.string().optional(),
  sort: z
    .enum(["name", "price", "created_at", "updated_at"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const getServiceSchema = z.object({
  slug: z.string(),
});

export const getServiceByIdSchema = z.object({
  id: uuidSchema,
});

// Admin service management schemas
export const getServicesAdminSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  includeUnpublished: z.boolean().default(false),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z
    .enum(["name", "price", "created_at", "updated_at"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const deleteServiceSchema = z.object({
  id: uuidSchema,
});

// Service category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  parent_id: uuidSchema.optional(),
});

export const updateCategorySchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  parent_id: uuidSchema.optional(),
});

export const getCategoriesSchema = z.object({
  include_hidden: z.boolean().default(false),
});

// Response schemas
export const serviceSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  short_description: z.string().nullable(),
  price: z.number(),
  currency: z.string(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  features: z.array(z.string()),
  image_url: z.string().url().nullable(),
  gallery_images: z.array(z.string().url()),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  is_digital: z.boolean(),
  download_url: z.string().url().nullable(),
  metadata: z.record(z.any()).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const serviceCategorySchema = z.object({
  id: uuidSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  parent_id: uuidSchema.nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const serviceStatsSchema = z.object({
  total_services: z.number(),
  published_services: z.number(),
  featured_services: z.number(),
  digital_services: z.number(),
  total_categories: z.number(),
});

// Paginated responses
export const paginatedServicesSchema = z.object({
  services: z.array(serviceSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paginatedCategoriesSchema = z.object({
  categories: z.array(serviceCategorySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
