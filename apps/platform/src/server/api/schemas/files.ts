/**
 * Files tRPC Schemas
 * Validation schemas for file upload and management operations
 */

import { z } from "zod";
import { uuidSchema } from "./common";

// File upload schemas
export const uploadFileSchema = z.object({
  file: z.string(), // Base64 encoded file data
  filename: z.string().min(1).max(255),
  content_type: z.string(),
  folder: z.string().optional(),
  public: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export const uploadMultipleFilesSchema = z.object({
  files: z.array(
    z.object({
      file: z.string(), // Base64 encoded file data
      filename: z.string().min(1).max(255),
      content_type: z.string(),
    }),
  ),
  folder: z.string().optional(),
  public: z.boolean().default(false),
});

// File management schemas
export const getFileSchema = z.object({
  id: uuidSchema,
});

export const getFileByPathSchema = z.object({
  path: z.string(),
});

export const getFilesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  folder: z.string().optional(),
  content_type: z.string().optional(),
  search: z.string().optional(),
  sort: z
    .enum(["name", "size", "created_at", "updated_at"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const deleteFileSchema = z.object({
  id: uuidSchema,
});

export const deleteMultipleFilesSchema = z.object({
  ids: z.array(uuidSchema),
});

// File organization schemas
export const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
  parent_path: z.string().optional(),
  public: z.boolean().default(false),
});

export const moveFolderSchema = z.object({
  from_path: z.string(),
  to_path: z.string(),
});

export const moveFileSchema = z.object({
  id: uuidSchema,
  new_path: z.string(),
});

// Image processing schemas
export const resizeImageSchema = z.object({
  id: uuidSchema,
  width: z.number().min(1).max(4000),
  height: z.number().min(1).max(4000),
  quality: z.number().min(1).max(100).default(80),
  format: z.enum(["jpeg", "png", "webp"]).optional(),
});

export const generateThumbnailSchema = z.object({
  id: uuidSchema,
  size: z.enum(["small", "medium", "large"]).default("medium"),
});

// Digital content schemas
export const uploadDigitalContentSchema = z.object({
  file: z.string(), // Base64 encoded file data
  filename: z.string().min(1).max(255),
  content_type: z.string(),
  service_id: uuidSchema,
  access_level: z.enum(["public", "premium", "private"]).default("private"),
  download_limit: z.number().min(-1).default(-1), // -1 for unlimited
});

export const getDigitalContentSchema = z.object({
  service_id: uuidSchema,
});

// Response schemas
export const fileSchema = z.object({
  id: uuidSchema,
  filename: z.string(),
  original_filename: z.string(),
  content_type: z.string(),
  size: z.number(),
  path: z.string(),
  url: z.string().url(),
  public: z.boolean(),
  folder: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const folderSchema = z.object({
  name: z.string(),
  path: z.string(),
  parent_path: z.string().nullable(),
  public: z.boolean(),
  file_count: z.number(),
  total_size: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const digitalContentSchema = z.object({
  id: uuidSchema,
  service_id: uuidSchema,
  file_id: uuidSchema,
  filename: z.string(),
  content_type: z.string(),
  size: z.number(),
  access_level: z.enum(["public", "premium", "private"]),
  download_limit: z.number(),
  download_count: z.number(),
  download_url: z.string().url(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const fileStatsSchema = z.object({
  total_files: z.number(),
  total_size: z.number(),
  public_files: z.number(),
  private_files: z.number(),
  total_folders: z.number(),
});

// Paginated responses
export const paginatedFilesSchema = z.object({
  files: z.array(fileSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paginatedFoldersSchema = z.object({
  folders: z.array(folderSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const paginatedDigitalContentSchema = z.object({
  content: z.array(digitalContentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
