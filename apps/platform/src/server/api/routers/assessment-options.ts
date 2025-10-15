/**
 * Assessment Options tRPC Router
 * Handles CRUD operations for the assessment_options table
 */

import { createTRPCRouter, adminProcedure } from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createServiceRoleClient } from "@/utils/supabase/server";

// Zod schemas for assessment options
const listByQuestionIdSchema = z.object({
  questionId: z.string().uuid("Invalid question ID"),
});

const createOptionSchema = z.object({
  question_id: z.string().uuid("Invalid question ID"),
  option_text: z
    .string()
    .min(1, "Option text is required")
    .max(500, "Option text must be 500 characters or less"),
  value: z.string().optional(), // JSON string
  sort_order: z
    .number()
    .int()
    .min(0, "Sort order must be non-negative")
    .default(0),
});

const updateOptionSchema = z.object({
  id: z.string().uuid("Invalid option ID"),
  option_text: z
    .string()
    .min(1, "Option text is required")
    .max(500, "Option text must be 500 characters or less"),
  value: z.string().optional(), // JSON string
  sort_order: z.number().int().min(0, "Sort order must be non-negative"),
});

const deleteOptionSchema = z.object({
  id: z.string().uuid("Invalid option ID"),
});

export const assessmentOptionsRouter = createTRPCRouter({
  // List all options for a specific question
  listByQuestionId: adminProcedure
    .input(listByQuestionIdSchema)
    .query(async ({ input }) => {
      try {
        const supabase = createServiceRoleClient();

        const { data: options, error } = await supabase
          .from("assessment_options")
          .select("*")
          .eq("question_id", input.questionId)
          .order("sort_order", { ascending: true });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch assessment options",
            cause: error,
          });
        }

        return options || [];
      } catch (error) {
        console.error(
          "[AssessmentOptionsRouter] Error fetching options:",
          error,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch assessment options",
          cause: error,
        });
      }
    }),

  // Create a new option
  create: adminProcedure
    .input(createOptionSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = createServiceRoleClient();

        // Parse and validate JSON if provided
        let parsedValue = null;
        if (input.value) {
          try {
            parsedValue = JSON.parse(input.value);
          } catch (e) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid JSON format in value field",
            });
          }
        }

        const { data: option, error } = await supabase
          .from("assessment_options")
          .insert({
            question_id: input.question_id,
            option_text: input.option_text,
            value: parsedValue,
            sort_order: input.sort_order,
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create assessment option",
            cause: error,
          });
        }

        return option;
      } catch (error) {
        console.error(
          "[AssessmentOptionsRouter] Error creating option:",
          error,
        );
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create assessment option",
          cause: error,
        });
      }
    }),

  // Update an existing option
  update: adminProcedure
    .input(updateOptionSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = createServiceRoleClient();

        // Parse and validate JSON if provided
        let parsedValue = null;
        if (input.value) {
          try {
            parsedValue = JSON.parse(input.value);
          } catch (e) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid JSON format in value field",
            });
          }
        }

        const { data: option, error } = await supabase
          .from("assessment_options")
          .update({
            option_text: input.option_text,
            value: parsedValue,
            sort_order: input.sort_order,
          })
          .eq("id", input.id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update assessment option",
            cause: error,
          });
        }

        if (!option) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Assessment option not found",
          });
        }

        return option;
      } catch (error) {
        console.error(
          "[AssessmentOptionsRouter] Error updating option:",
          error,
        );
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update assessment option",
          cause: error,
        });
      }
    }),

  // Delete an option
  delete: adminProcedure
    .input(deleteOptionSchema)
    .mutation(async ({ input }) => {
      try {
        const supabase = createServiceRoleClient();

        const { error } = await supabase
          .from("assessment_options")
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete assessment option",
            cause: error,
          });
        }

        return { success: true };
      } catch (error) {
        console.error(
          "[AssessmentOptionsRouter] Error deleting option:",
          error,
        );
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete assessment option",
          cause: error,
        });
      }
    }),
});
