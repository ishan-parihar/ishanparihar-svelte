/**
 * Assessment Router Integration Tests
 * API with authentication and database mocking
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// IMPORTANT: Mock the auth module BEFORE importing the assessment router
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock the server-only module to prevent import errors  
vi.mock("server-only", () => ({}));

// Define a basic mock client that will be used for tests that don't need specific chain mocking
const basicSupabaseMockClient = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn(),
  head: vi.fn().mockReturnThis(),
};

// Mock the Supabase server utility - we'll make this dynamic to support test-specific clients
let currentSupabaseClient = basicSupabaseMockClient;

vi.mock("@/utils/supabase/server", () => ({
  createServiceRoleClient: () => currentSupabaseClient,
  createServerClient: () => currentSupabaseClient,
}));

// Now import the assessment router after mocking dependencies
const { assessmentRouter } = await import("./assessment");

  describe("Assessment Router", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Reset to the basic mock client for each test
      currentSupabaseClient = basicSupabaseMockClient;
    });

  describe("submitAssessment procedure", () => {
    it("should throw UNAUTHORIZED error when user is not authenticated", async () => {
      // Create basic mock for unauthenticated tests
      const basicMockClient = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn(),
        head: vi.fn().mockReturnThis(),
      };

      // Update the mock to return the supabase client for from() calls
      basicMockClient.from.mockReturnThis();

      const mockContext = {
        req: undefined,
        session: null, // No session
        supabase: basicMockClient,
        user: null, // No user
      };

      // Create a caller with no session
      const unauthenticatedCaller = assessmentRouter.createCaller(mockContext as any);

      const input = {
        assessment_type: "personality-test" as const,
        results: { score: 85, category: "extrovert" },
      };

      await expect(unauthenticatedCaller.submitAssessment(input)).rejects.toThrow(TRPCError);
      const error = await unauthenticatedCaller.submitAssessment(input).catch(err => err);
      expect(error.code).toBe("UNAUTHORIZED");

      // Verify that Supabase was not called
      expect(basicMockClient.from).not.toHaveBeenCalled();
    });

    it("should throw UNAUTHORIZED error when session exists but user ID is missing", async () => {
      const basicMockClient = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn(),
        head: vi.fn().mockReturnThis(),
      };

      // Update the mock to return the supabase client for from() calls
      basicMockClient.from.mockReturnThis();

      const mockContext = {
        req: undefined,
        session: {
          user: {
            id: null, // Missing user ID
            email: "test@example.com",
          },
          expires: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
        },
        supabase: basicMockClient,
        user: {
          id: null, // Missing user ID
          email: "test@example.com",
        },
      };

      const unauthenticatedCaller = assessmentRouter.createCaller(mockContext as any);

      const input = {
        assessment_type: "personality-test" as const,
        results: { score: 85, category: "extrovert" },
      };

      await expect(unauthenticatedCaller.submitAssessment(input)).rejects.toThrow(TRPCError);
      const error = await unauthenticatedCaller.submitAssessment(input).catch(err => err);
      expect(error.code).toBe("UNAUTHORIZED");

      // Verify that Supabase was not called
      expect(basicMockClient.from).not.toHaveBeenCalled();
    });

    it("should successfully submit assessment when user is authenticated", async () => {
      // Reset and set up the global mock client for this test
      vi.mocked(basicSupabaseMockClient.from).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.insert).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.select).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.eq).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.order).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.range).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.head).mockReturnThis();
      
      // We need to mock the chain: from() -> insert() -> select() -> single()
      // Since we can't modify the mock implementation mid-call, we'll mock the single() method directly
      basicSupabaseMockClient.single.mockResolvedValue({
        data: {
          id: "assessment-result-123",
          user_id: "test-user-123",
          assessment_type: "personality-test",
          results: { score: 85, category: "extrovert" },
          created_at: "2024-01-01T00:0Z",
        },
        error: null,
      });

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
        supabase: basicSupabaseMockClient, // Use the global mock
        user: {
          id: "test-user-123",
          email: "test@example.com",
          name: "Test User",
        },
      };

      const authenticatedCaller = assessmentRouter.createCaller(mockContext as any);

      const input = {
        assessment_type: "personality-test" as const,
        results: { score: 85, category: "extrovert" },
      };

      const result = await authenticatedCaller.submitAssessment(input);

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
      expect(basicSupabaseMockClient.from).toHaveBeenCalledWith("assessment_results");
      expect(basicSupabaseMockClient.insert).toHaveBeenCalledWith({
        user_id: "test-user-123",
        assessment_type: "personality-test",
        results: { score: 85, category: "extrovert" },
      });
      expect(basicSupabaseMockClient.select).toHaveBeenCalled();
      expect(basicSupabaseMockClient.single).toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      // Reset and set up the global mock client for this test
      vi.mocked(basicSupabaseMockClient.from).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.insert).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.select).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.eq).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.order).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.range).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.head).mockReturnThis();
      
      // Mock database error
      basicSupabaseMockClient.single.mockResolvedValue({
        data: null,
        error: {
          code: "23505",
          message: "duplicate key value violates unique constraint",
        },
      });

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
        supabase: basicSupabaseMockClient,
        user: {
          id: "test-user-123",
          email: "test@example.com",
          name: "Test User",
        },
      };

      const authenticatedCaller = assessmentRouter.createCaller(mockContext as any);

      const input = {
        assessment_type: "personality-test" as const,
        results: { score: 85, category: "extrovert" },
      };

      await expect(authenticatedCaller.submitAssessment(input)).rejects.toThrow(TRPCError);
      const error = await authenticatedCaller.submitAssessment(input).catch(err => err);
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");

      // Verify that Supabase was called
      expect(basicSupabaseMockClient.from).toHaveBeenCalledWith("assessment_results");
      expect(basicSupabaseMockClient.insert).toHaveBeenCalled();
    });

    it("should handle complex assessment results data", async () => {
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

      // Reset and set up the global mock client for this test
      vi.mocked(basicSupabaseMockClient.from).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.insert).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.select).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.eq).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.order).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.range).mockReturnThis();
      vi.mocked(basicSupabaseMockClient.head).mockReturnThis();
      
      // Mock successful database insertion with complex data
      basicSupabaseMockClient.single.mockResolvedValue({
        data: {
          id: "assessment-result-456",
          user_id: "test-user-456",
          assessment_type: "personality-test",
          results: complexResults,
          created_at: "2024-01-01T00:0Z",
        },
        error: null,
      });

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
        supabase: basicSupabaseMockClient,
        user: {
          id: "test-user-456",
          email: "complex@example.com",
          name: "Complex User",
        },
      };

      const authenticatedCaller = assessmentRouter.createCaller(mockContext as any);

      const input = {
        assessment_type: "personality-test" as const,
        results: complexResults,
      };

      const result = await authenticatedCaller.submitAssessment(input);

      // Verify the result contains complex data
      expect(result.assessment.results).toEqual(complexResults);
      expect(result.assessment.results.personality_traits).toBeDefined();
      expect(result.assessment.results.question_responses).toHaveLength(50);

      // Verify that Supabase was called with complex data
      expect(basicSupabaseMockClient.insert).toHaveBeenCalledWith({
        user_id: "test-user-456",
        assessment_type: "personality-test",
        results: complexResults,
      });
    });
  });

  describe("getHistory procedure", () => {
    it("should throw UNAUTHORIZED error when user is not authenticated", async () => {
      const basicMockClient = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn(),
        head: vi.fn().mockReturnThis(),
      };

      // Update the mock to return the supabase client for from() calls
      basicMockClient.from.mockReturnThis();

      const mockContext = {
        req: undefined,
        session: null, // No session
        supabase: basicMockClient,
        user: null, // No user
      };

      const unauthenticatedCaller = assessmentRouter.createCaller(mockContext as any);

      const input = {
        offset: 0,
        limit: 10,
      };

      await expect(unauthenticatedCaller.getHistory(input)).rejects.toThrow(TRPCError);
      const error = await unauthenticatedCaller.getHistory(input).catch(err => err);
      expect(error.code).toBe("UNAUTHORIZED");

      // Verify that Supabase was not called
      expect(basicMockClient.from).not.toHaveBeenCalled();
    });

    it("should return assessment history when user is authenticated", async () => {
      // Create separate mock client for this test that will replace the default mock
      const historyMockClient = {
        from: vi.fn(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn(),
        single: vi.fn(),
        eq: vi.fn(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn(),
        head: vi.fn().mockReturnThis(),
      };

      // For the count query: from() -> select("*", { count: "exact", head: true }) -> eq()
      const countEqResult = { count: 1, error: null };
      const countEqChain = {
        eq: vi.fn().mockResolvedValue(countEqResult)
      };

      const countSelectChain = {
        select: vi.fn().mockImplementation((columns, options) => {
          expect(columns).toBe("*");
          expect(options).toEqual({ count: "exact", head: true });
          return countEqChain;
        })
      };

      // For the data query: from() -> select("*") -> eq() -> order() -> range()
      const rangeResult = {
        data: [
          {
            id: "assessment-1",
            user_id: "test-user-123",
            assessment_type: "personality-test",
            results: { score: 85, category: "extrovert" },
            created_at: "2024-01-01T00:0Z",
          },
        ],
        error: null,
      };

      const dataChain = {
        select: vi.fn().mockImplementation((columns) => {
          expect(columns).toBe("*");
          return dataChain; // Return the same object to allow chaining
        }),
        eq: vi.fn().mockImplementation(() => dataChain), // Return the same object to allow chaining
        order: vi.fn().mockImplementation(() => dataChain), // Return the same object to allow chaining
        range: vi.fn().mockResolvedValue(rangeResult), // This should return the final result
      };

      // Configure the from method to return different chains for count vs data query
      let fromCallCount = 0;
      historyMockClient.from.mockImplementation((table) => {
        expect(table).toBe("assessment_results");
        fromCallCount++;
        if (fromCallCount === 1) {
          // First call is for count: from() -> select() -> eq()
          return countSelectChain;
        } else {
          // Second call is for data: from() -> select() -> eq() -> order() -> range()
          return dataChain;
        }
      });

      // Temporarily set the current client to our history mock client
      currentSupabaseClient = historyMockClient;

      const authenticatedCaller = assessmentRouter.createCaller({
        req: undefined,
        session: {
          user: {
            id: "test-user-123",
            email: "test-user-123@example.com",
            name: "Test User",
          },
          expires: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
        },
        supabase: historyMockClient, // Keep for consistency
        user: {
          id: "test-user-123",
          email: "test-user-123@example.com",
          name: "Test User",
        },
      } as any);

      const input = {
        offset: 0,
        limit: 10,
      };

      const result = await authenticatedCaller.getHistory(input);

      // Verify the result structure
      expect(result.total).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        id: "assessment-1",
        user_id: "test-user-123",
        assessment_type: "personality-test",
      });
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);

      // Verify Supabase calls
      expect(historyMockClient.from).toHaveBeenCalledTimes(2);
      expect(historyMockClient.from).toHaveBeenNthCalledWith(1, "assessment_results");
      expect(historyMockClient.from).toHaveBeenNthCalledWith(2, "assessment_results");
    });
  });
});


