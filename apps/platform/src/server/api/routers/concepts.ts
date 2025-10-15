/**
 * Concepts tRPC Router
 * Handles CRUD operations for the Golden Thread concepts system
 */

import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Input validation schemas
const createConceptSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
});

const updateConceptSchema = z.object({
  id: z.string().uuid("Invalid concept ID"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),
  description: z.string().optional(),
});

const deleteConceptSchema = z.object({
  id: z.string().uuid("Invalid concept ID"),
});

const getConceptSchema = z.object({
  id: z.string().uuid("Invalid concept ID"),
});

const linkBlogPostConceptSchema = z.object({
  blogPostId: z.string().uuid("Invalid blog post ID"),
  conceptIds: z.array(z.string().uuid("Invalid concept ID")),
});

const linkProjectConceptSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  conceptIds: z.array(z.string().uuid("Invalid concept ID")),
});

export const conceptsRouter = createTRPCRouter({
  // List all concepts with usage statistics
  list: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: concepts, error } = await supabase
        .from("concepts")
        .select(
          `
          *,
          blog_post_concepts(count),
          project_concepts(count)
        `,
        )
        .order("name", { ascending: true });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch concepts",
          cause: error,
        });
      }

      // Transform the data to include usage counts
      const conceptsWithUsage = concepts.map((concept: any) => ({
        ...concept,
        blog_posts_count: concept.blog_post_concepts?.length || 0,
        projects_count: concept.project_concepts?.length || 0,
        total_usage:
          (concept.blog_post_concepts?.length || 0) +
          (concept.project_concepts?.length || 0),
      }));

      return conceptsWithUsage;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch concepts",
        cause: error,
      });
    }
  }),

  // Get a single concept by ID
  get: adminProcedure.input(getConceptSchema).query(async ({ input, ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: concept, error } = await supabase
        .from("concepts")
        .select(
          `
            *,
            blog_post_concepts(
              blog_post_id,
              blog_posts(title, slug)
            ),
            project_concepts(
              project_id,
              projects(title, slug)
            )
          `,
        )
        .eq("id", input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Concept not found",
          cause: error,
        });
      }

      return concept;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch concept",
        cause: error,
      });
    }
  }),

  // Create a new concept
  create: adminProcedure
    .input(createConceptSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Check if slug already exists
        const { data: existingConcept, error: checkError } = await supabase
          .from("concepts")
          .select("id")
          .eq("slug", input.slug)
          .single();

        if (existingConcept) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A concept with this slug already exists",
          });
        }

        const { data: concept, error } = await supabase
          .from("concepts")
          .insert({
            name: input.name,
            slug: input.slug,
            description: input.description || null,
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create concept",
            cause: error,
          });
        }

        return concept;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create concept",
          cause: error,
        });
      }
    }),

  // Update an existing concept
  update: adminProcedure
    .input(updateConceptSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // If slug is being updated, check if it already exists
        if (input.slug) {
          const { data: existingConcept, error: checkError } = await supabase
            .from("concepts")
            .select("id")
            .eq("slug", input.slug)
            .neq("id", input.id)
            .single();

          if (existingConcept) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A concept with this slug already exists",
            });
          }
        }

        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.slug !== undefined) updateData.slug = input.slug;
        if (input.description !== undefined)
          updateData.description = input.description;

        const { data: concept, error } = await supabase
          .from("concepts")
          .update(updateData)
          .eq("id", input.id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update concept",
            cause: error,
          });
        }

        return concept;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update concept",
          cause: error,
        });
      }
    }),

  // Delete a concept
  delete: adminProcedure
    .input(deleteConceptSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("concepts")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete concept",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete concept",
          cause: error,
        });
      }
    }),

  // Link concepts to a blog post
  linkToBlogPost: adminProcedure
    .input(linkBlogPostConceptSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // First, remove existing links for this blog post
        const { error: deleteError } = await supabase
          .from("blog_post_concepts")
          .delete()
          .eq("blog_post_id", input.blogPostId);

        if (deleteError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update blog post concepts",
            cause: deleteError,
          });
        }

        // Then, add new links if any concepts are provided
        if (input.conceptIds.length > 0) {
          const linksToInsert = input.conceptIds.map((conceptId) => ({
            blog_post_id: input.blogPostId,
            concept_id: conceptId,
          }));

          const { error: insertError } = await supabase
            .from("blog_post_concepts")
            .insert(linksToInsert);

          if (insertError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to link concepts to blog post",
              cause: insertError,
            });
          }
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to link concepts to blog post",
          cause: error,
        });
      }
    }),

  // Link concepts to a project
  linkToProject: adminProcedure
    .input(linkProjectConceptSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // First, remove existing links for this project
        const { error: deleteError } = await supabase
          .from("project_concepts")
          .delete()
          .eq("project_id", input.projectId);

        if (deleteError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update project concepts",
            cause: deleteError,
          });
        }

        // Then, add new links if any concepts are provided
        if (input.conceptIds.length > 0) {
          const linksToInsert = input.conceptIds.map((conceptId) => ({
            project_id: input.projectId,
            concept_id: conceptId,
          }));

          const { error: insertError } = await supabase
            .from("project_concepts")
            .insert(linksToInsert);

          if (insertError) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to link concepts to project",
              cause: insertError,
            });
          }
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to link concepts to project",
          cause: error,
        });
      }
    }),
});
