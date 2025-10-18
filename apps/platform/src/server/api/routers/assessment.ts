/**
 * Assessment tRPC Router
 * Handles assessment-related operations like submitting results and getting history
 */

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc";
import { TRPCError } from "@trpc/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import {
  submitAssessmentSchema,
  getAssessmentHistorySchema,
} from "../schemas/assessment";

export const assessmentRouter = createTRPCRouter({
  // Submit assessment results
  submitAssessment: protectedProcedure
    .input(submitAssessmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Insert assessment result into database
        const { data, error } = await supabase
          .from("assessment_results")
          .insert({
            user_id: ctx.session.user.id,
            assessment_type: input.assessment_type,
            results: input.results,
          })
          .select()
          .single();

        if (error) {
          console.error("Error submitting assessment:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit assessment",
            cause: error,
          });
        }

        return {
          success: true,
          assessment: data,
        };
      } catch (error) {
        console.error("Assessment submission error:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit assessment",
        });
      }
    }),

  // Get assessment history for the current user
  getHistory: protectedProcedure
    .input(getAssessmentHistorySchema)
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          });
        }

        const supabase = createServiceRoleClient();

        // Get total count
        const { count, error: countError } = await supabase
          .from("assessment_results")
          .select("*", { count: "exact", head: true })
          .eq("user_id", ctx.session.user.id);

        if (countError) {
          console.error("Error counting assessments:", countError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch assessment history",
            cause: countError,
          });
        }

        // Get paginated results
        const { data, error } = await supabase
          .from("assessment_results")
          .select("*")
          .eq("user_id", ctx.session.user.id)
          .order("created_at", { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);

        if (error) {
          console.error("Error fetching assessment history:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch assessment history",
            cause: error,
          });
        }

        return {
          results: data || [],
          total: count || 0,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error("Assessment history error:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch assessment history",
        });
      }
    }),
});
