/**
 * Newsletter tRPC Router
 * Handles public newsletter operations like subscription
 */

import { createTRPCRouter, publicProcedure } from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  subscribeToNewsletter,
  getNewsletterSubscriberByEmail,
  unsubscribeByToken,
} from "@/lib/newsletterService";

export const newsletterRouter = createTRPCRouter({
  // Public newsletter subscription
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Pass the user ID from session context if available
        const userId = ctx.session?.user?.id;
        const result = await subscribeToNewsletter(
          input.email,
          input.name,
          userId,
        );

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message || "Subscription failed",
          });
        }

        return {
          success: true,
          message: result.message,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process subscription",
          cause: error,
        });
      }
    }),

  // Check if email is already subscribed
  checkEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const subscriber = await getNewsletterSubscriberByEmail(input.email);

        return {
          exists: !!subscriber,
          subscribed: subscriber?.newsletter_subscribed || false,
          manually_unsubscribed: subscriber?.manually_unsubscribed || false,
          token: subscriber?.unsubscribe_token,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check email status",
          cause: error,
        });
      }
    }),

  // Unsubscribe using token
  unsubscribe: publicProcedure
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await unsubscribeByToken(input.token);

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message || "Unsubscribe failed",
          });
        }

        return {
          success: true,
          message: result.message,
          email: result.email,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process unsubscribe request",
          cause: error,
        });
      }
    }),
});
