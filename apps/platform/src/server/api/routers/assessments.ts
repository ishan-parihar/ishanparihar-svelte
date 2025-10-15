/**
 * Assessments tRPC Router
 * Handles CRUD operations for the main assessments table
 */

import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
  protectedProcedure,
} from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Zod schemas for assessments
const createAssessmentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be 255 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  is_published: z.boolean().optional().default(false),
});

const updateAssessmentSchema = z.object({
  id: z.string().uuid("Invalid assessment ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be 255 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  is_published: z.boolean().optional(),
});

const getByIdSchema = z.object({
  id: z.string().uuid("Invalid assessment ID"),
});

const deleteSchema = z.object({
  id: z.string().uuid("Invalid assessment ID"),
});

const getBySlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

const getAssessmentForTakingSchema = z.object({
  assessmentId: z.string().uuid("Invalid assessment ID"),
});

export const assessmentsRouter = createTRPCRouter({
  // List all assessments
  list: adminProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: assessments, error } = await supabase
        .from("assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch assessments",
          cause: error,
        });
      }

      return assessments || [];
    } catch (error) {
      console.error("[AssessmentsRouter] Error fetching assessments:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch assessments",
        cause: error,
      });
    }
  }),

  // Get assessment by ID
  getById: adminProcedure.input(getByIdSchema).query(async ({ input, ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: assessment, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assessment not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch assessment",
          cause: error,
        });
      }

      return assessment;
    } catch (error) {
      console.error(
        "[AssessmentsRouter] Error fetching assessment by ID:",
        error,
      );
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch assessment",
        cause: error,
      });
    }
  }),

  // Create new assessment
  create: adminProcedure
    .input(createAssessmentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Check if slug already exists
        const { data: existingAssessment } = await supabase
          .from("assessments")
          .select("id")
          .eq("slug", input.slug)
          .single();

        if (existingAssessment) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An assessment with this slug already exists",
          });
        }

        const { data: assessment, error } = await supabase
          .from("assessments")
          .insert({
            title: input.title,
            slug: input.slug,
            description: input.description || null,
            is_published: input.is_published || false,
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create assessment",
            cause: error,
          });
        }

        return assessment;
      } catch (error) {
        console.error("[AssessmentsRouter] Error creating assessment:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create assessment",
          cause: error,
        });
      }
    }),

  // Update assessment
  update: adminProcedure
    .input(updateAssessmentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // If slug is being updated, check if it already exists
        if (input.slug) {
          const { data: existingAssessment } = await supabase
            .from("assessments")
            .select("id")
            .eq("slug", input.slug)
            .neq("id", input.id)
            .single();

          if (existingAssessment) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "An assessment with this slug already exists",
            });
          }
        }

        const updateData: any = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.slug !== undefined) updateData.slug = input.slug;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.is_published !== undefined)
          updateData.is_published = input.is_published;

        const { data: assessment, error } = await supabase
          .from("assessments")
          .update(updateData)
          .eq("id", input.id)
          .select()
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Assessment not found",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update assessment",
            cause: error,
          });
        }

        return assessment;
      } catch (error) {
        console.error("[AssessmentsRouter] Error updating assessment:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update assessment",
          cause: error,
        });
      }
    }),

  // Delete assessment
  delete: adminProcedure
    .input(deleteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("assessments")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete assessment",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        console.error("[AssessmentsRouter] Error deleting assessment:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete assessment",
          cause: error,
        });
      }
    }),

  // List published assessments (public access)
  listPublic: publicProcedure.query(async ({ ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: assessments, error } = await supabase
        .from("assessments")
        .select("id, title, slug, description")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch published assessments",
          cause: error,
        });
      }

      return assessments || [];
    } catch (error) {
      console.error(
        "[AssessmentsRouter] Error fetching published assessments:",
        error,
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch published assessments",
        cause: error,
      });
    }
  }),

  // Get published assessment by slug (public access)
  getBySlug: publicProcedure
    .input(getBySlugSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data: assessment, error } = await supabase
          .from("assessments")
          .select("id, title, slug, description")
          .eq("slug", input.slug)
          .eq("is_published", true)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Published assessment not found",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch assessment",
            cause: error,
          });
        }

        return assessment;
      } catch (error) {
        console.error(
          "[AssessmentsRouter] Error fetching assessment by slug:",
          error,
        );
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch assessment",
          cause: error,
        });
      }
    }),

  // Get assessment with questions and options for taking (protected access)
  getAssessmentForTaking: protectedProcedure
    .input(getAssessmentForTakingSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // First, verify the assessment exists and is published
        const { data: assessment, error: assessmentError } = await supabase
          .from("assessments")
          .select("id, title, slug, description")
          .eq("id", input.assessmentId)
          .eq("is_published", true)
          .single();

        if (assessmentError) {
          if (assessmentError.code === "PGRST116") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Published assessment not found",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch assessment",
            cause: assessmentError,
          });
        }

        // Get all questions for this assessment
        const { data: questions, error: questionsError } = await supabase
          .from("assessment_questions")
          .select("id, question_text, question_type")
          .eq("assessment_id", input.assessmentId)
          .order("sort_order", { ascending: true });

        if (questionsError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch assessment questions",
            cause: questionsError,
          });
        }

        // Get all options for all questions in a single query
        const questionIds = questions?.map((q: any) => q.id) || [];
        const { data: allOptions, error: optionsError } = await supabase
          .from("assessment_options")
          .select("id, question_id, option_text, value")
          .in("question_id", questionIds)
          .order("sort_order", { ascending: true });

        if (optionsError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch assessment options",
            cause: optionsError,
          });
        }

        // Group options by question_id for efficient lookup
        const optionsByQuestionId = (allOptions || []).reduce(
          (
            acc: Record<
              string,
              Array<{ id: string; option_text: string; value: any }>
            >,
            option: any,
          ) => {
            if (!acc[option.question_id]) {
              acc[option.question_id] = [];
            }
            acc[option.question_id].push({
              id: option.id,
              option_text: option.option_text,
              value: option.value,
            });
            return acc;
          },
          {} as Record<
            string,
            Array<{ id: string; option_text: string; value: any }>
          >,
        );

        // Combine questions with their options
        const questionsWithOptions = (questions || []).map((question: any) => ({
          id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          options: optionsByQuestionId[question.id] || [],
        }));

        return {
          id: assessment.id,
          title: assessment.title,
          slug: assessment.slug,
          description: assessment.description,
          questions: questionsWithOptions,
        };
      } catch (error) {
        console.error(
          "[AssessmentsRouter] Error fetching assessment for taking:",
          error,
        );
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch assessment for taking",
          cause: error,
        });
      }
    }),
});
