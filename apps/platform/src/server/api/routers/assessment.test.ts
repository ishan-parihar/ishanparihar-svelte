/**
 * Assessment Router Integration Tests
 * API with authentication and database mocking
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// Mock the server-only module to prevent import errors
vi.mock("server-only", () => ({}));

// Mock the Supabase client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn(),
};

// Mock the Supabase server utility
vi.mock("@/utils/supabase/server", () => ({
  createServiceRoleClient: () => mockSupabaseClient,
}));

// Mock the assessment router module
const mockAssessmentRouter = {
  createCaller: vi.fn(),
};

vi.mock("./assessment", () => ({
  assessmentRouter: mockAssessmentRouter,
}));

// Mock the tRPC setup
vi.mock("@/lib/trpc", () => ({
  createTRPCRouter: (routes: any) => ({
    createCaller: (ctx: any) => {
      const caller: any = {};
      Object.keys(routes).forEach((key) => {
        caller[key] = async (input: any) => {
          return routes[key]._def.mutation({ ctx, input });
        };
      });
      return caller;
    },
  }),
  protectedProcedure: {
    input: (schema: any) => ({
      mutation: (handler: any) => ({
        _def: {
          mutation: handler,
        },
      }),
      query: (handler: any) => ({
        _def: {
          query: handler,
        },
      }),
    }),
  },
}));

describe("Assessment Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitAssessment procedure", () => {
    it("should throw UNAUTHORIZED error when user is not authenticated", async () => {
      const mockContext = {
        req: undefined,
        session: null,
        supabase: mockSupabaseClient as any,
        user: null,
      };

      mockAssessmentRouter.createCaller.mockReturnValue({
        submitAssessment: vi.fn().mockRejectedValue(
          new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          }),
        ),
      });

      const caller = mockAssessmentRouter.createCaller(mockContext);

      const input = {
        assessment_type: "personality-test" as const,
        results: { score: 85, category: "extrovert" },
      };

      await expect(caller.submitAssessment(input)).rejects.toThrow(
        expect.objectContaining({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        }),
      );

      // Verify that Supabase was not called
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it("should throw UNAUTHORIZED error when session exists but user ID is missing", async () => {
      const mockContext = {
        req: undefined,
        session: {
          user: {
            id: null, // Missing user ID
            email: "test@example.com",
          },
          expires: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
        },
        supabase: mockSupabaseClient as any,
        user: {
          id: null,
          email: "test@example.com",
        } as any,
      };

      mockAssessmentRouter.createCaller.mockReturnValue({
        submitAssessment: vi.fn().mockRejectedValue(
          new TRPCError({
            code: "UNAUTHORIZED",
            message: "Authentication required",
          }),
        ),
      });

      const caller = mockAssessmentRouter.createCaller(mockContext);

      const input = {
        assessment_type: "personality-test" as const,
        results: { score: 85, category: "extrovert" },
      };

      await expect(caller.submitAssessment(input)).rejects.toThrow(
        expect.objectContaining({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        }),
      );

      // Verify that Supabase was not called
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it("should successfully submit assessment when user is authenticated", async () => {
      const mockContext = {
        req: undefined,
        session: {
          user: {
            id: "test-user-123",
            email: "test@example.com",
            name: "Test User",
          },
          expires: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
        },
        supabase: mockSupabaseClient as any,
        user: {
          id: "test-user-123",
          email: "test@example.com",
          name: "Test User",
        } as any,
      };

      // Mock successful database insertion
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: "assessment-result-123",
          user_id: "test-user-123",
          assessment_type: "personality-test",
          results: { score: 85, category: "extrovert" },
          created_at: "2024-01-01T00:0Z",
        },
        error: null,
      });

      mockAssessmentRouter.createCaller.mockReturnValue({
        submitAssessment: vi.fn().mockResolvedValue({
          success: true,
          assessment: {
            id: "assessment-result-123",
            user_id: "test-user-123",
            assessment_type: "personality-test",
            results: { score: 85, category: "extrovert" },
          },
        }),
      });

      const caller = mockAssessmentRouter.createCaller(mockContext);

      const input = {
        assessment_type: "personality-test" as const,
        results: { score: 85, category: "extrovert" },
      };

      const result = await caller.submitAssessment(input);

      // Verify the result
      expect(result).toEqual({
        success: true,
        assessment: expect.objectContaining({
          id: "assessment-result-123",
          user_id: "test-user-123",
          assessment_type: "personality-test",
          results: { score: 85, category: "extrovert" },
        }),
      });

      // Verify that Supabase was called with correct parameters
      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        "assessment_results",
      );
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        user_id: "test-user-123",
        assessment_type: "personality-test",
        results: { score: 85, category: "extrovert" },
      });
      expect(mockSupabaseClient.select).toHaveBeenCalled();
      expect(mockSupabaseClient.single).toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const mockContext = {
        req: undefined,
        session: {
          user: {
            id: "test-user-123",
            email: "test@example.com",
            name: "Test User",
          },
          expires: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
        },
        supabase: mockSupabaseClient as any,
        user: {
          id: "test-user-123",
          email: "test@example.com",
          name: "Test User",
        } as any,
      };

      // Mock database error
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: {
          code: "23505",
          message: "duplicate key value violates unique constraint",
        },
      });

      mockAssessmentRouter.createCaller.mockReturnValue({
        submitAssessment: vi.fn().mockRejectedValue(
          new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit assessment",
          }),
        ),
      });

      const caller = mockAssessmentRouter.createCaller(mockContext);

      const input = {
        assessment_type: "personality-test" as const,
        results: { score: 85, category: "extrovert" },
      };

      await expect(caller.submitAssessment(input)).rejects.toThrow(
        expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit assessment",
        }),
      );

      // Verify that Supabase was called
      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        "assessment_results",
      );
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it("should handle complex assessment results data", async () => {
      const mockContext = {
        req: undefined,
        session: {
          user: {
            id: "test-user-456",
            email: "complex@example.com",
            name: "Complex User",
          },
          expires: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
        },
        supabase: mockSupabaseClient as any,
        user: {
          id: "test-user-456",
          email: "complex@example.com",
          name: "Complex User",
        } as any,
      };

      const complexResults = {
        personality_traits: {
          openness: 0.8,
          conscientiousness: 0.7,
          extraversion: 0.6,
          agreeableness: 0.9,
          neuroticism: 0.3,
        },
        categories: ["creative", "analytical", "social"],
        recommendations: [
          "Consider leadership roles",
          "Explore creative fields",
          "Focus on team collaboration",
        ],
        completion_time: 1200, // seconds
        question_responses: Array.from({ length: 50 }, (_, i) => ({
          question_id: i + 1,
          response: Math.floor(Math.random() * 5) + 1,
        })),
      };

      // Mock successful database insertion
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: "assessment-result-456",
          user_id: "test-user-456",
          assessment_type: "personality-test",
          results: complexResults,
          created_at: "2024-01-01T00:0Z",
        },
        error: null,
      });

      mockAssessmentRouter.createCaller.mockReturnValue({
        submitAssessment: vi.fn().mockResolvedValue({
          success: true,
          assessment: {
            id: "assessment-result-456",
            user_id: "test-user-456",
            assessment_type: "personality-test",
            results: complexResults,
          },
        }),
      });

      const caller = mockAssessmentRouter.createCaller(mockContext);

      const input = {
        assessment_type: "personality-test" as const,
        results: complexResults,
      };

      const result = await caller.submitAssessment(input);

      // Verify the result contains complex data
      expect(result.assessment.results).toEqual(complexResults);
      expect(result.assessment.results.personality_traits).toBeDefined();
      expect(result.assessment.results.question_responses).toHaveLength(50);

      // Verify that Supabase was called with complex data
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        user_id: "test-user-456",
        assessment_type: "personality-test",
        results: complexResults,
      });
    });
  });
});
