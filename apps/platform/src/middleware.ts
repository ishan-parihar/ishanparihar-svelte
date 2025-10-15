import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Debug mode flag
const DEBUG_MODE =
  process.env.NODE_ENV === "development" &&
  process.env.MIDDLEWARE_DEBUG === "true";

// Create auth instance for middleware (Edge Runtime compatible)
const { auth } = NextAuth(authConfig);

// Auth.js v5 middleware following official pattern
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  if (DEBUG_MODE) {
    console.log(`[Middleware v5] Processing ${nextUrl.pathname}`);
    console.log(`[Middleware v5] Session exists: ${!!session}`);
    if (session) {
      console.log(
        `[Middleware v5] User: ${session.user?.email}, Role: ${session.user?.role}`,
      );
    }
  }

  // Admin routes protection
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      console.log(
        "[Middleware v5] No session found for admin route, redirecting to home with auth flag",
      );
      // Redirect to home page with auth required flag
      const homeUrl = new URL("/", nextUrl.origin);
      homeUrl.searchParams.set("requireAuth", "true");
      homeUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(homeUrl);
    }

    // Enhanced debugging for admin access
    console.log("[Middleware v5] Admin route access attempt:", {
      path: nextUrl.pathname,
      userId: session.user?.id,
      userEmail: session.user?.email,
      userRole: session.user?.role,
      hasSession: !!session,
      hasUser: !!session.user,
    });

    // Check if user has admin role
    if (session.user?.role !== "admin") {
      console.log(
        `[Middleware v5] Non-admin role "${session.user?.role}" attempting admin route, redirecting.`,
      );
      console.log(
        "[Middleware v5] Full session object:",
        JSON.stringify(session, null, 2),
      );
      // Redirect non-admin users to account page
      return NextResponse.redirect(new URL("/account", nextUrl.origin));
    }

    console.log(
      "[Middleware v5] Admin role verified, allowing access to admin route.",
    );
    // Allow admin access
    return NextResponse.next();
  }

  // Account routes protection
  if (nextUrl.pathname.startsWith("/account")) {
    if (!session) {
      console.log(
        "[Middleware v5] No session found for account route, redirecting to home with auth flag",
      );
      // Redirect to home page with auth required flag
      const homeUrl = new URL("/", nextUrl.origin);
      homeUrl.searchParams.set("requireAuth", "true");
      homeUrl.searchParams.set("callbackUrl", "/account");
      return NextResponse.redirect(homeUrl);
    }

    console.log(
      "[Middleware v5] User authenticated, allowing access to account route.",
    );
    // Allow authenticated users to access account pages
    return NextResponse.next();
  }

  // Premium routes protection
  if (nextUrl.pathname.startsWith("/premium")) {
    if (DEBUG_MODE) {
      console.log(
        `[Middleware v5] Processing premium route: ${nextUrl.pathname}`,
      );
    }

    // Check if user is authenticated
    if (!session) {
      console.log(
        "[Middleware v5] No session found for premium route, redirecting to pricing",
      );
      // Redirect to pricing page for unauthenticated users
      return NextResponse.redirect(new URL("/pricing", nextUrl.origin));
    }

    // Enhanced debugging for premium access
    if (DEBUG_MODE) {
      console.log("[Middleware v5] Premium route access attempt:", {
        path: nextUrl.pathname,
        userId: session.user?.id,
        userEmail: session.user?.email,
        userRole: session.user?.role,
        hasActiveMembership: (session.user as any)?.has_active_membership,
        hasSession: !!session,
        hasUser: !!session.user,
      });
    }

    // Check if user has premium access (admin role OR active membership)
    const isAdmin = session.user?.role === "admin";
    const hasActiveMembership =
      (session.user as any)?.has_active_membership === true;
    const hasPremiumAccess = isAdmin || hasActiveMembership;

    if (!hasPremiumAccess) {
      console.log(
        `[Middleware v5] User "${session.user?.email}" without premium access attempting premium route, redirecting to pricing.`,
      );
      console.log(
        `[Middleware v5] Premium access details: isAdmin=${isAdmin}, hasActiveMembership=${hasActiveMembership}`,
      );
      return NextResponse.redirect(new URL("/pricing", nextUrl.origin));
    }

    console.log(
      "[Middleware v5] Premium access verified, allowing access to premium route.",
    );
    // Allow admin access to premium content
    return NextResponse.next();
  }

  // Assessments routes - allow access for both authenticated and unauthenticated users
  // The middleware runs to establish session if user is logged in, but doesn't block access
  if (nextUrl.pathname.startsWith("/assessments")) {
    if (DEBUG_MODE) {
      console.log(
        `[Middleware v5] Processing assessments route: ${nextUrl.pathname}`,
      );
      console.log(
        `[Middleware v5] Session available: ${!!session}`,
      );
    }

    // Allow access regardless of authentication status
    // Session will be available to the page if user is logged in
    return NextResponse.next();
  }

  // Redirect any auth pages to home page with auth modal flag
  if (
    nextUrl.pathname === "/auth/signin" ||
    nextUrl.pathname === "/auth/signup" ||
    nextUrl.pathname === "/user/signin" ||
    nextUrl.pathname === "/user/signup"
  ) {
    console.log(
      "[Middleware v5] Redirecting from auth page to home with auth modal flag",
    );
    const homeUrl = new URL("/", nextUrl.origin);

    // Preserve any query parameters
    const params = new URLSearchParams(nextUrl.search);
    params.forEach((value, key) => {
      homeUrl.searchParams.set(key, value);
    });

    // Add auth required flag to trigger the modal
    homeUrl.searchParams.set("requireAuth", "true");

    // Set the modal view based on the path
    if (nextUrl.pathname.includes("signup")) {
      homeUrl.searchParams.set("authView", "signUp");
    } else {
      homeUrl.searchParams.set("authView", "signIn");
    }

    // Ensure we have a callback URL
    if (!params.has("callbackUrl")) {
      // Default to account page, but use the current URL if it's not an auth page
      const callbackUrl =
        nextUrl.pathname.includes("/auth/") ||
        nextUrl.pathname.includes("/user/")
          ? "/account"
          : nextUrl.pathname;
      homeUrl.searchParams.set("callbackUrl", callbackUrl);
    }

    return NextResponse.redirect(homeUrl);
  }

  // Allow all other requests to proceed
  return NextResponse.next();
});

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Admin and account routes (protected by Auth.js)
    "/admin/:path*",
    "/admin",
    "/account/:path*",
    "/account",
    // Premium routes (protected by premium status check)
    "/premium/:path*",
    "/premium",
    // Assessments routes (need session for user history)
    "/assessments/:path*",
    "/assessments",
    // Auth routes that need to be processed by middleware
    "/api/auth/callback/:path*",
    "/auth/callback/:path*",
    "/callback/:path*",
    "/api/auth/signin/:path*",
    "/auth/error",
    // Sign-out routes - included to ensure they're properly bypassed
    "/auth/signout",
    // Legacy auth routes that need redirection
    "/auth/signin",
    "/auth/signup",
    "/user/signin",
    "/user/signup",
  ],
};
