/**
 * Assessment Questions tRPC Router
 * Handles CRUD operations for the assessment_questions table
 */

import { createTRPCRouter, adminProcedure } from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Zod schemas for assessment questions
const listByAssessmentIdSchema = z.object({
  assessmentId: z.string().uuid("Invalid assessment ID"),
});

const createQuestionSchema = z.object({
  assessment_id: z.string().uuid("Invalid assessment ID"),
  question_text: z
    .string()
    .min(1, "Question text is required")
    .max(1000, "Question text must be 1000 characters or less"),
  question_type: z
    .string()
    .min(1, "Question type is required")
    .default("multiple_choice"),
  sort_order: z
    .number()
    .int()
    .min(0, "Sort order must be a non-negative integer")
    .default(0),
});

const updateQuestionSchema = z.object({
  id: z.string().uuid("Invalid question ID"),
  question_text: z
    .string()
    .min(1, "Question text is required")
    .max(1000, "Question text must be 1000 characters or less")
    .optional(),
  question_type: z.string().min(1, "Question type is required").optional(),
  sort_order: z
    .number()
    .int()
    .min(0, "Sort order must be a non-negative integer")
    .optional(),
});

const deleteQuestionSchema = z.object({
  id: z.string().uuid("Invalid question ID"),
});

const getByIdSchema = z.object({
  id: z.string().uuid("Invalid question ID"),
});

export const assessmentQuestionsRouter = createTRPCRouter({
  // List all questions for a specific assessment
  listByAssessmentId: adminProcedure
    .input(listByAssessmentIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data: questions, error } = await supabase
          .from("assessment_questions")
          .select("*")
          .eq("assessment_id", input.assessmentId)
          .order("sort_order", { ascending: true });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch assessment questions",
            cause: error,
          });
        }

        return questions || [];
      } catch (error) {
        console.error(
          "[AssessmentQuestionsRouter] Error fetching questions:",
          error,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch assessment questions",
          cause: error,
        });
      }
    }),

  // Get question by ID
  getById: adminProcedure.input(getByIdSchema).query(async ({ input, ctx }) => {
    try {
      const supabase = createServiceRoleClient();

      const { data: question, error } = await supabase
        .from("assessment_questions")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Question not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch question",
          cause: error,
        });
      }

      return question;
    } catch (error) {
      console.error(
        "[AssessmentQuestionsRouter] Error fetching question:",
        error,
      );
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch question",
        cause: error,
      });
    }
  }),

  // Create new question
  create: adminProcedure
    .input(createQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        // Verify the assessment exists
        const { data: assessment, error: assessmentError } = await supabase
          .from("assessments")
          .select("id")
          .eq("id", input.assessment_id)
          .single();

        if (assessmentError || !assessment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assessment not found",
          });
        }

        const { data: question, error } = await supabase
          .from("assessment_questions")
          .insert({
            assessment_id: input.assessment_id,
            question_text: input.question_text,
            question_type: input.question_type,
            sort_order: input.sort_order,
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create question",
            cause: error,
          });
        }

        return question;
      } catch (error) {
        console.error(
          "[AssessmentQuestionsRouter] Error creating question:",
          error,
        );
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create question",
          cause: error,
        });
      }
    }),

  // Update question
  update: adminProcedure
    .input(updateQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const updateData: any = {};
        if (input.question_text !== undefined)
          updateData.question_text = input.question_text;
        if (input.question_type !== undefined)
          updateData.question_type = input.question_type;
        if (input.sort_order !== undefined)
          updateData.sort_order = input.sort_order;

        const { data: question, error } = await supabase
          .from("assessment_questions")
          .update(updateData)
          .eq("id", input.id)
          .select()
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Question not found",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update question",
            cause: error,
          });
        }

        return question;
      } catch (error) {
        console.error(
          "[AssessmentQuestionsRouter] Error updating question:",
          error,
        );
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update question",
          cause: error,
        });
      }
    }),

  // Delete question
  delete: adminProcedure
    .input(deleteQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("assessment_questions")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete question",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        console.error(
          "[AssessmentQuestionsRouter] Error deleting question:",
          error,
        );
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete question",
          cause: error,
        });
      }
    }),
});
