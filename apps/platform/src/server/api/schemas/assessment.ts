/**
 * Assessment tRPC Schemas
 * Validation schemas for assessment-related operations
 */

import { z } from "zod";
import { uuidSchema } from "./common";

// Assessment type enum
export const assessmentTypeSchema = z.enum(["personality-test"]);

// Assessment results schema - flexible JSON structure
export const assessmentResultsSchema = z.record(z.any());

// Submit assessment schema
export const submitAssessmentSchema = z.object({
  assessment_type: assessmentTypeSchema,
  results: assessmentResultsSchema,
});

// Get assessment history schema
export const getAssessmentHistorySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

// Assessment result response schema
export const assessmentResultSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  assessment_type: assessmentTypeSchema,
  results: assessmentResultsSchema,
  created_at: z.string().datetime(),
});

// Paginated assessment results schema
export const paginatedAssessmentResultsSchema = z.object({
  results: z.array(assessmentResultSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});
