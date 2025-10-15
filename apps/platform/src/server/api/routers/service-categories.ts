/**
 * Service Categories tRPC Router
 * Handles service category CRUD operations for admin dashboard
 */

import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Zod schemas for service categories based on the service_categories table structure
const createServiceCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  icon: z.string().max(100, "Icon must be 100 characters or less").optional(),
  color: z.string().max(7, "Color must be a valid hex color").optional(),
  sort_order: z
    .number()
    .int()
    .min(0, "Sort order must be a positive integer")
    .default(0),
  active: z.boolean().default(true),
});

const updateServiceCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  icon: z.string().max(100, "Icon must be 100 characters or less").optional(),
  color: z.string().max(7, "Color must be a valid hex color").optional(),
  sort_order: z
    .number()
    .int()
    .min(0, "Sort order must be a positive integer")
    .optional(),
  active: z.boolean().optional(),
});

const getServiceCategoryByIdSchema = z.object({
  id: z.string().uuid("Invalid category ID"),
});

const deleteServiceCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID"),
});

export const serviceCategoriesRouter = createTRPCRouter({
  // List all service categories
  list: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: categories, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch service categories",
          cause: error,
        });
      }

      return categories || [];
    } catch (error) {
      console.error("Error in service categories list:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch service categories",
        cause: error,
      });
    }
  }),

  // Get service category by ID
  getById: adminProcedure
    .input(getServiceCategoryByIdSchema)
    .query(async ({ input }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data: category, error } = await supabase
          .from("service_categories")
          .select("*")
          .eq("id", input.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Service category not found",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch service category",
            cause: error,
          });
        }

        return category;
      } catch (error) {
        console.error("Error in service category getById:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch service category",
          cause: error,
        });
      }
    }),

  // Create new service category
  create: adminProcedure
    .input(createServiceCategorySchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = createServiceRoleClient();

        // Check if slug already exists
        const { data: existingCategory } = await supabase
          .from("service_categories")
          .select("id")
          .eq("slug", input.slug)
          .single();

        if (existingCategory) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A category with this slug already exists",
          });
        }

        const { data: category, error } = await supabase
          .from("service_categories")
          .insert([
            {
              name: input.name,
              slug: input.slug,
              description: input.description || null,
              icon: input.icon || null,
              color: input.color || null,
              sort_order: input.sort_order,
              active: input.active,
            },
          ])
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create service category",
            cause: error,
          });
        }

        return category;
      } catch (error) {
        console.error("Error in service category create:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create service category",
          cause: error,
        });
      }
    }),

  // Update service category
  update: adminProcedure
    .input(updateServiceCategorySchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = createServiceRoleClient();

        // If slug is being updated, check if it already exists
        if (input.slug) {
          const { data: existingCategory } = await supabase
            .from("service_categories")
            .select("id")
            .eq("slug", input.slug)
            .neq("id", input.id)
            .single();

          if (existingCategory) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A category with this slug already exists",
            });
          }
        }

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        // Only include fields that are provided
        if (input.name !== undefined) updateData.name = input.name;
        if (input.slug !== undefined) updateData.slug = input.slug;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.icon !== undefined) updateData.icon = input.icon;
        if (input.color !== undefined) updateData.color = input.color;
        if (input.sort_order !== undefined)
          updateData.sort_order = input.sort_order;
        if (input.active !== undefined) updateData.active = input.active;

        const { data: category, error } = await supabase
          .from("service_categories")
          .update(updateData)
          .eq("id", input.id)
          .select()
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Service category not found",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update service category",
            cause: error,
          });
        }

        return category;
      } catch (error) {
        console.error("Error in service category update:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update service category",
          cause: error,
        });
      }
    }),

  // Delete service category
  delete: adminProcedure
    .input(deleteServiceCategorySchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = createServiceRoleClient();

        // Check if category exists and get its details
        const { data: existingCategory, error: fetchError } = await supabase
          .from("service_categories")
          .select("id, name")
          .eq("id", input.id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Service category not found",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch service category",
            cause: fetchError,
          });
        }

        // TODO: Check if category is being used by any services
        // This would require checking the services table for references to this category
        // For now, we'll allow deletion but this should be implemented for production

        const { error } = await supabase
          .from("service_categories")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete service category",
            cause: error,
          });
        }

        return { success: true, deletedCategory: existingCategory };
      } catch (error) {
        console.error("Error in service category delete:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete service category",
          cause: error,
        });
      }
    }),
});
