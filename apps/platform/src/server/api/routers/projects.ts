/**
 * Projects tRPC Router
 * Handles project CRUD operations and concept linking
 */

import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Input validation schemas
const createProjectSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(200, "Slug must be less than 200 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  source_url: z.string().url().optional(),
  live_url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  status: z
    .enum(["planning", "in_progress", "completed", "archived"])
    .default("completed"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  concept_ids: z.array(z.string().uuid()).default([]),
});

const updateProjectSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(200, "Slug must be less than 200 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  source_url: z.string().url().optional(),
  live_url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  status: z
    .enum(["planning", "in_progress", "completed", "archived"])
    .optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  concept_ids: z.array(z.string().uuid()).optional(),
});

const deleteProjectSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
});

const getProjectSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
});

export const projectsRouter = createTRPCRouter({
  // List all projects
  list: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: projects, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          project_concepts(
            concept_id,
            concepts(id, name, slug)
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch projects",
          cause: error,
        });
      }

      // Transform the data to include concepts array
      const projectsWithConcepts = projects.map((project: any) => ({
        ...project,
        concepts: project.project_concepts?.map((pc: any) => pc.concepts) || [],
      }));

      return projectsWithConcepts;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch projects",
        cause: error,
      });
    }
  }),

  // Get a single project by ID
  get: adminProcedure.input(getProjectSchema).query(async ({ input, ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: project, error } = await supabase
        .from("projects")
        .select(
          `
            *,
            project_concepts(
              concept_id,
              concepts(id, name, slug)
            )
          `,
        )
        .eq("id", input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
          cause: error,
        });
      }

      // Transform the data to include concepts array
      const projectWithConcepts = {
        ...project,
        concepts: project.project_concepts?.map((pc: any) => pc.concepts) || [],
      };

      return projectWithConcepts;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch project",
        cause: error,
      });
    }
  }),

  // Create a new project
  create: adminProcedure
    .input(createProjectSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Check if slug already exists
        const { data: existingProject, error: checkError } = await supabase
          .from("projects")
          .select("id")
          .eq("slug", input.slug)
          .single();

        if (existingProject) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A project with this slug already exists",
          });
        }

        const { concept_ids, ...projectData } = input;

        const { data: project, error } = await supabase
          .from("projects")
          .insert({
            ...projectData,
            author_user_id: ctx.session?.user?.id,
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
            cause: error,
          });
        }

        // Link concepts to the project if any are provided
        if (concept_ids && concept_ids.length > 0) {
          const conceptLinks = concept_ids.map((conceptId) => ({
            project_id: project.id,
            concept_id: conceptId,
          }));

          const { error: conceptError } = await supabase
            .from("project_concepts")
            .insert(conceptLinks);

          if (conceptError) {
            console.error("Failed to link concepts to project:", conceptError);
            // Don't fail the entire operation, just log the error
          }
        }

        return project;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
          cause: error,
        });
      }
    }),

  // Update an existing project
  update: adminProcedure
    .input(updateProjectSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // If slug is being updated, check if it already exists
        if (input.slug) {
          const { data: existingProject, error: checkError } = await supabase
            .from("projects")
            .select("id")
            .eq("slug", input.slug)
            .neq("id", input.id)
            .single();

          if (existingProject) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A project with this slug already exists",
            });
          }
        }

        const { id, concept_ids, ...updateData } = input;

        // Remove undefined values
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(
            ([_, value]) => value !== undefined,
          ),
        );

        const { data: project, error } = await supabase
          .from("projects")
          .update(cleanUpdateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update project",
            cause: error,
          });
        }

        // Update concept links if concept_ids is provided
        if (concept_ids !== undefined) {
          // First, remove existing concept links
          const { error: deleteError } = await supabase
            .from("project_concepts")
            .delete()
            .eq("project_id", id);

          if (deleteError) {
            console.error(
              "Failed to remove existing concept links:",
              deleteError,
            );
          }

          // Then, add new concept links if any are provided
          if (concept_ids.length > 0) {
            const conceptLinks = concept_ids.map((conceptId) => ({
              project_id: id,
              concept_id: conceptId,
            }));

            const { error: conceptError } = await supabase
              .from("project_concepts")
              .insert(conceptLinks);

            if (conceptError) {
              console.error(
                "Failed to link concepts to project:",
                conceptError,
              );
              // Don't fail the entire operation, just log the error
            }
          }
        }

        return project;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update project",
          cause: error,
        });
      }
    }),

  // Delete a project
  delete: adminProcedure
    .input(deleteProjectSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete project",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete project",
          cause: error,
        });
      }
    }),

  // Public query for portfolio display
  getPublicProjects: publicProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: projects, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          project_concepts(
            concept_id,
            concepts(id, name, slug)
          )
        `,
        )
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch public projects",
          cause: error,
        });
      }

      // Transform the data to include concepts array
      const projectsWithConcepts = projects.map((project: any) => ({
        ...project,
        concepts: project.project_concepts?.map((pc: any) => pc.concepts) || [],
      }));

      return projectsWithConcepts;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch public projects",
        cause: error,
      });
    }
  }),
});
