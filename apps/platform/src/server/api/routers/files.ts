/**
 * Files tRPC Router
 * Handles file uploads and image management
 */

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { imageUploadSchema, paginationSchema } from "../schemas/common";
import { createServiceRoleClient } from "@/utils/supabase/server";
import {
  uploadFileServer,
  ensureBucketExistsServer,
  deleteImageFromBucketServer,
  getImagePublicUrl,
} from "@/lib/imageService";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export const filesRouter = createTRPCRouter({
  // Upload image
  uploadImage: protectedProcedure
    .input(
      z.object({
        file: z.string(), // base64 encoded file
        filename: z.string(),
        contentType: z.string(),
        size: z.number().max(10 * 1024 * 1024), // 10MB max
        bucket: z.string().default("site-images"),
        altText: z.string().optional(),
        caption: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
          });
        }

        // Convert base64 to buffer
        const base64Data = input.file.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Process image with sharp
        const processedImageBuffer = await sharp(buffer)
          .webp({ quality: 85 }) // Convert to WebP with 85% quality
          .resize({
            width: 2000, // Maximum width
            height: 2000, // Maximum height
            fit: "inside", // Don't enlarge if smaller
            withoutEnlargement: true,
          })
          .toBuffer();

        // Get image metadata
        const metadata = await sharp(processedImageBuffer).metadata();

        // Generate unique filename
        const uniqueId = uuidv4();
        const sanitizedOriginalName = input.filename
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .replace(/\.[^/.]+$/, ""); // Remove extension
        const webpFilename = `${sanitizedOriginalName}-${uniqueId}.webp`;
        const supabasePath = `public/${webpFilename}`;

        const supabase = createServiceRoleClient();

        // Ensure bucket exists
        const bucketExists = await ensureBucketExistsServer(input.bucket);
        if (!bucketExists) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create or access storage bucket",
          });
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(input.bucket)
          .upload(supabasePath, processedImageBuffer, {
            contentType: "image/webp",
            upsert: false,
          });

        if (uploadError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload image",
            cause: uploadError,
          });
        }

        // Get public URL
        const publicUrl = getImagePublicUrl(
          supabase,
          input.bucket,
          supabasePath,
        );

        if (!publicUrl) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate public URL",
          });
        }

        // Store image metadata in database
        const { data: imageRecord, error: dbError } = await supabase
          .from("images")
          .insert({
            supabase_path: supabasePath,
            bucket_name: input.bucket,
            alt_text: input.altText || "",
            caption: input.caption || "",
            filename_original: input.filename,
            mime_type: "image/webp",
            width: metadata.width,
            height: metadata.height,
            size_bytes: processedImageBuffer.length,
            tags: input.tags || [],
            uploader_user_id: ctx.session.user.id,
          })
          .select()
          .single();

        if (dbError) {
          console.error("Failed to store image metadata:", dbError);
          // Don't throw error here as the image is already uploaded
        }

        return {
          id: imageRecord?.id,
          publicUrl,
          path: supabasePath,
          bucket: input.bucket,
          filename: webpFilename,
          size: processedImageBuffer.length,
          width: metadata.width,
          height: metadata.height,
          mimeType: "image/webp",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
          cause: error,
        });
      }
    }),

  // Get images (admin)
  getImages: adminProcedure
    .input(
      paginationSchema.extend({
        search: z.string().optional(),
        bucket: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Calculate offset for pagination
        const offset = (input.page - 1) * input.limit;

        // Build the query
        let query = supabase
          .from("images")
          .select(
            `
            *,
            uploader:uploader_user_id(id, name, email)
          `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + input.limit - 1);

        // Apply filters
        if (input.bucket) {
          query = query.eq("bucket_name", input.bucket);
        }

        if (input.search) {
          query = query.or(
            `filename_original.ilike.%${input.search}%,alt_text.ilike.%${input.search}%,caption.ilike.%${input.search}%`,
          );
        }

        const { data: images, error } = await query;

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch images",
            cause: error,
          });
        }

        // Get total count for pagination
        let countQuery = supabase
          .from("images")
          .select("*", { count: "exact", head: true });

        if (input.bucket) {
          countQuery = countQuery.eq("bucket_name", input.bucket);
        }
        if (input.search) {
          countQuery = countQuery.or(
            `filename_original.ilike.%${input.search}%,alt_text.ilike.%${input.search}%,caption.ilike.%${input.search}%`,
          );
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get images count",
            cause: countError,
          });
        }

        // Add public URLs to images
        const imagesWithUrls =
          images?.map((image: any) => ({
            ...image,
            publicUrl: getImagePublicUrl(
              supabase,
              image.bucket_name,
              image.supabase_path,
            ),
          })) || [];

        return {
          images: imagesWithUrls,
          total: count || 0,
          page: input.page,
          limit: input.limit,
          totalPages: Math.ceil((count || 0) / input.limit),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch images",
          cause: error,
        });
      }
    }),

  // Delete image (admin)
  deleteImage: adminProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        path: z.string().optional(),
        bucket: z.string().default("site-images"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        let imagePath = input.path;
        let imageId = input.id;

        // If ID is provided, get the image details
        if (imageId) {
          const { data: image, error: imageError } = await supabase
            .from("images")
            .select("supabase_path, bucket_name")
            .eq("id", imageId)
            .single();

          if (imageError || !image) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Image not found",
              cause: imageError,
            });
          }

          imagePath = image.supabase_path;
          input.bucket = image.bucket_name;
        }

        if (!imagePath) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Either image ID or path must be provided",
          });
        }

        // Delete from storage
        const deleteResult = await deleteImageFromBucketServer(
          input.bucket,
          imagePath,
        );

        if (!deleteResult.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              deleteResult.error || "Failed to delete image from storage",
          });
        }

        // Delete from database if ID is provided
        if (imageId) {
          const { error: dbError } = await supabase
            .from("images")
            .delete()
            .eq("id", imageId);

          if (dbError) {
            console.error(
              "Failed to delete image record from database:",
              dbError,
            );
            // Don't throw error here as the file is already deleted from storage
          }
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete image",
          cause: error,
        });
      }
    }),

  // Get upload URL for direct uploads
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        bucket: z.string().default("site-images"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
          });
        }

        const supabase = createServiceRoleClient();

        // Ensure bucket exists
        const bucketExists = await ensureBucketExistsServer(input.bucket);
        if (!bucketExists) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create or access storage bucket",
          });
        }

        // Generate unique filename
        const uniqueId = uuidv4();
        const sanitizedOriginalName = input.filename.replace(
          /[^a-zA-Z0-9.-]/g,
          "_",
        );
        const extension = input.filename.split(".").pop() || "";
        const uniqueFilename = `${sanitizedOriginalName}-${uniqueId}.${extension}`;
        const supabasePath = `uploads/${uniqueFilename}`;

        // Create signed upload URL
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from(input.bucket)
            .createSignedUploadUrl(supabasePath);

        if (signedUrlError || !signedUrlData) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create upload URL",
            cause: signedUrlError,
          });
        }

        return {
          uploadUrl: signedUrlData.signedUrl,
          path: supabasePath,
          token: signedUrlData.token,
          bucket: input.bucket,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
          cause: error,
        });
      }
    }),

  // Process uploaded file
  processUpload: protectedProcedure
    .input(
      z.object({
        path: z.string(),
        bucket: z.string().default("site-images"),
        metadata: z.record(z.any()).optional(),
        altText: z.string().optional(),
        caption: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Check if file exists in storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from(input.bucket)
          .list(input.path.split("/").slice(0, -1).join("/"), {
            search: input.path.split("/").pop(),
          });

        if (fileError || !fileData || fileData.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Uploaded file not found",
            cause: fileError,
          });
        }

        const file = fileData[0];

        // Get public URL
        const publicUrl = getImagePublicUrl(supabase, input.bucket, input.path);

        if (!publicUrl) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate public URL",
          });
        }

        // Store file metadata in database
        const { data: fileRecord, error: dbError } = await supabase
          .from("images")
          .insert({
            supabase_path: input.path,
            bucket_name: input.bucket,
            alt_text: input.altText || "",
            caption: input.caption || "",
            filename_original: file.name,
            mime_type: file.metadata?.mimetype || "application/octet-stream",
            size_bytes: file.metadata?.size || 0,
            tags: input.tags || [],
            uploader_user_id: ctx.session.user.id,
            ...input.metadata,
          })
          .select()
          .single();

        if (dbError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to store file metadata",
            cause: dbError,
          });
        }

        return {
          id: fileRecord.id,
          publicUrl,
          path: input.path,
          bucket: input.bucket,
          filename: file.name,
          size: file.metadata?.size || 0,
          mimeType: file.metadata?.mimetype || "application/octet-stream",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process upload",
          cause: error,
        });
      }
    }),

  // Upload digital content (admin)
  uploadDigitalContent: adminProcedure
    .input(
      z.object({
        file: z.string(), // base64 encoded file
        filename: z.string(),
        contentType: z.string(),
        size: z.number().max(100 * 1024 * 1024), // 100MB max
        altText: z.string().optional(),
        caption: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        // Validate file type
        const allowedTypes = [
          "application/pdf",
          "application/zip",
          "application/x-rar-compressed",
          "video/mp4",
          "video/quicktime",
          "audio/mpeg",
          "audio/wav",
          "audio/mp3",
          "application/epub+zip",
          "application/x-mobipocket-ebook",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "text/plain",
          "application/json",
        ];

        if (!allowedTypes.includes(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file type for digital content.",
          });
        }

        // Convert base64 to buffer
        const base64Data = input.file.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        const supabase = createServiceRoleClient();
        const targetBucket = "digital-content";

        // Ensure bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.find(
          (bucket: any) => bucket.name === targetBucket,
        );

        if (!bucketExists) {
          const { error: bucketError } = await supabase.storage.createBucket(
            targetBucket,
            {
              public: false, // Private bucket for security
              fileSizeLimit: 100 * 1024 * 1024, // 100MB
            },
          );

          if (bucketError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create storage bucket",
              cause: bucketError,
            });
          }
        }

        // Generate unique filename
        const fileExtension = input.filename.split(".").pop() || "";
        const uniqueId = uuidv4();
        const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const sanitizedOriginalName = input.filename
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .replace(/_{2,}/g, "_");

        const filename = `${timestamp}/${uniqueId}_${sanitizedOriginalName}`;
        const supabasePath = `content/${filename}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(targetBucket)
          .upload(supabasePath, buffer, {
            contentType: input.contentType,
            upsert: false,
          });

        if (uploadError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload digital content",
            cause: uploadError,
          });
        }

        // Generate signed URL for secure access (valid for 1 hour)
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from(targetBucket)
            .createSignedUrl(supabasePath, 3600); // 1 hour expiry

        return {
          path: supabasePath,
          bucket: targetBucket,
          filename: input.filename,
          size: input.size,
          mimeType: input.contentType,
          signedUrl: signedUrlData?.signedUrl,
          uploadedAt: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload digital content",
          cause: error,
        });
      }
    }),

  // Get buckets (admin)
  getBuckets: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch buckets",
          cause: error,
        });
      }

      return buckets || [];
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch buckets",
        cause: error,
      });
    }
  }),

  // Upload profile picture
  uploadProfilePicture: protectedProcedure
    .input(
      z.object({
        file: z.string(), // Base64 encoded file
        fileName: z.string(),
        fileType: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(input.fileType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
          });
        }

        // Decode base64 file
        const buffer = Buffer.from(input.file, "base64");

        // Generate unique filename
        const fileExtension = input.fileName.split(".").pop();
        const uniqueFileName = `profile-${ctx.session.user.id}-${Date.now()}.${fileExtension}`;

        const supabase = createServiceRoleClient();

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(uniqueFileName, buffer, {
            contentType: input.fileType,
            upsert: true,
          });

        if (uploadError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload profile picture",
            cause: uploadError,
          });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(uploadData.path);

        // Update user's profile picture in database
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update({
            picture: urlData.publicUrl,
            custom_picture: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ctx.session.user.id)
          .select("id, email, name, picture, custom_picture")
          .single();

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user profile",
            cause: updateError,
          });
        }

        return {
          success: true,
          url: urlData.publicUrl,
          user: updatedUser,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload profile picture",
          cause: error,
        });
      }
    }),
});
