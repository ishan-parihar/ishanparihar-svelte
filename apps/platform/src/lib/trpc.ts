/**
 * tRPC Configuration
 * This file sets up the core tRPC configuration including:
 * - Server-side router and context
 * - Client-side configuration
 * - Type-safe API procedures
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { createServerClient, createServiceRoleClient } from "@/utils/supabase/server";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissions-client";
import { jwtVerify } from "jose";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

/**
 * Helper function to extract session from NextAuth cookies in the request
 * This is used as a fallback when the standard auth() call returns null
 */
async function getSessionFromRequest(req: Request): Promise<any | null> {
  try {
    // Extract cookies from the request headers
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return null;
    }

    // Parse cookies to find NextAuth session token
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        acc[name] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);

    // Try different NextAuth cookie names (Auth.js v5 and legacy)
    const sessionToken =
      cookies["authjs.session-token"] ||
      cookies["__Secure-authjs.session-token"] ||
      cookies["next-auth.session-token"] ||
      cookies["__Secure-next-auth.session-token"];

    if (!sessionToken) {
      return null;
    }

    // Get JWT secret from environment
    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
    if (!jwtSecret) {
      console.error("[tRPC Context] No JWT secret found for session verification");
      return null;
    }

    // Verify and decode the JWT token
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(sessionToken, secret);

    // Reconstruct session object from JWT payload
    if (payload && payload.email) {
      return {
        user: {
          id: payload.id || payload.sub,
          email: payload.email,
          name: payload.name,
          image: payload.picture,
          role: payload.role || (payload.email === "ishanbestdabang@gmail.com" ? "admin" : "user"),
          has_active_membership: payload.has_active_membership || false,
        },
        expires: new Date(payload.exp! * 1000).toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error("[tRPC Context] Error extracting session from request:", error);
    return null;
  }
}

/**
 * Create context for tRPC requests (App Router)
 * This runs for every tRPC request and provides:
 * - User session information
 * - Supabase client
 * - Request object
 */
export const createTRPCContext = async (opts?: FetchCreateContextFnOptions) => {
  // Try to get the user session using the standard auth() method
  let session = await auth();

  // If no session and we have a request object, try to extract session from cookies
  // This handles the case where middleware has established a session but auth() returns null
  if (!session && opts?.req) {
    session = await getSessionFromRequest(opts.req);
  }

  // Create Supabase client with proper authentication context
  let supabase;

  if (session?.supabaseAccessToken) {
    // Create authenticated client using the Supabase JWT token
    supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.supabaseAccessToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  } else {
    // Fallback to the standard server client (for non-authenticated requests)
    supabase = await createServerClient();
  }

  return {
    req: opts?.req,
    session,
    supabase,
    user: session?.user ?? null,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context and transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure builders
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.user },
    },
  });
});

/**
 * Limited procedure that blocks spam-flagged users from performing certain actions
 */
export const limitedProcedure = protectedProcedure.use(({ ctx, next }) => {
  console.log("[DEBUG] limitedProcedure Check Fired.");
  console.log(`[DEBUG] User ID: ${ctx.session?.user?.id}`);
  console.log(
    `[DEBUG] User isFlagged status: ${(ctx.session?.user as any)?.isFlagged}`,
  );
  console.log(
    `[DEBUG] User is_spam_flagged status: ${(ctx.session?.user as any)?.is_spam_flagged}`,
  );
  console.log(
    `[DEBUG] Full session user object:`,
    JSON.stringify(ctx.session?.user, null, 2),
  );

  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Check if user is spam-flagged
  const isFlagged =
    (ctx.session.user as any).isFlagged ||
    (ctx.session.user as any).is_spam_flagged;

  if (isFlagged) {
    console.log("[DEBUG] ACTION BLOCKED for spam-flagged user.");
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Your account has been limited and cannot perform this action. Please contact support if you believe this is an error.",
    });
  }

  console.log("[DEBUG] Action allowed. Proceeding...");
  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.user },
    },
  });
});

/**
 * Admin procedure that requires admin permissions
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Check if user has any admin permissions
  const hasAdminPermission =
    hasPermissionFromSession(ctx.session, PERMISSION_SCOPES.MANAGE_BLOG) ||
    hasPermissionFromSession(ctx.session, PERMISSION_SCOPES.MANAGE_USERS) ||
    hasPermissionFromSession(ctx.session, PERMISSION_SCOPES.MANAGE_ADMINS) ||
    hasPermissionFromSession(ctx.session, PERMISSION_SCOPES.MANAGE_COMMENTS) ||
    hasPermissionFromSession(
      ctx.session,
      PERMISSION_SCOPES.MANAGE_NEWSLETTER,
    ) ||
    hasPermissionFromSession(ctx.session, PERMISSION_SCOPES.MANAGE_IMAGES) ||
    hasPermissionFromSession(ctx.session, PERMISSION_SCOPES.MANAGE_SERVICES) ||
    hasPermissionFromSession(ctx.session, PERMISSION_SCOPES.MANAGE_SUPPORT);

  if (!hasAdminPermission) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

/**
 * Permission-based procedure factory
 * Creates procedures that require specific permissions
 */
export const createPermissionProcedure = (requiredPermissions: string[]) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      hasPermissionFromSession(ctx.session, permission),
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Required permissions: ${requiredPermissions.join(", ")}`,
      });
    }

    return next({ ctx });
  });
};
