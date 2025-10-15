/**
 * Server-side tRPC API caller
 * This file provides a server-side API caller for use in server components,
 * API routes, and other server-side code.
 */

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/lib/trpc";

/**
 * Create a server-side API caller with proper context
 * This creates a direct caller to tRPC procedures without HTTP overhead
 */
export async function createServerApi() {
  const context = await createTRPCContext();
  return appRouter.createCaller(context);
}

/**
 * Server-side API caller factory
 * Use this in server components and API routes
 */
export const api = {
  blog: {
    getPost: async (input: { slug: string }) => {
      const caller = await createServerApi();
      return caller.blog.getPost(input);
    },
    getPosts: async (input?: {
      page?: number;
      limit?: number;
      category?: string;
      featured?: boolean;
      search?: string;
      sortBy?:
        | "created_at"
        | "updated_at"
        | "title"
        | "views_count"
        | "likes_count";
      sortOrder?: "asc" | "desc";
      includeDrafts?: boolean;
    }) => {
      const caller = await createServerApi();
      return caller.blog.getPosts(input || {});
    },
  },
  payments: {
    getOrderDetails: async (input: { orderId: string }) => {
      const caller = await createServerApi();
      return caller.payments.getOrderDetails(input);
    },
    generateReceipt: async (input: { orderId: string }) => {
      const caller = await createServerApi();
      return caller.payments.generateReceipt(input);
    },
  },
  admin: {
    getAccountDetails: async (input: { userId: string }) => {
      const caller = await createServerApi();
      return caller.admin.getAccountDetails(input);
    },
  },
};
