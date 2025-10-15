import { jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Extended JWT payload with user role
interface AuthJWTPayload extends JWTPayload {
  role?: string;
  id?: string;
  email?: string;
}

// Error class for authentication failures
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Get the JWT secret key from environment variables
 */
export function getJwtSecretKey(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret || secret.length === 0) {
    throw new Error(
      "The environment variable AUTH_SECRET or NEXTAUTH_SECRET is not set.",
    );
  }

  return secret;
}

/**
 * Verifies the user's JWT token and returns its payload if it's valid.
 */
export async function verifyJwtAuth(
  req: NextRequest,
): Promise<AuthJWTPayload | null> {
  // CRITICAL FIX: Auth.js v5 uses 'authjs.session-token' instead of 'next-auth.session-token'
  // Try both naming conventions for backward compatibility
  const sessionToken =
    // Auth.js v5 cookie names
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    // Legacy Auth.js v4 cookie names
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    // Log available cookies for debugging
    const availableCookies = req.cookies.getAll().map((c) => c.name);
    console.log(
      `[JWT Auth] No session token found. Available cookies: ${availableCookies.join(", ")}`,
    );
    return null;
  }

  try {
    // Verify the JWT using the secret key
    const verified = await jwtVerify(
      sessionToken,
      new TextEncoder().encode(getJwtSecretKey()),
    );

    return verified.payload as AuthJWTPayload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

/**
 * Check if the user is authenticated and has the required role
 */
export async function checkUserAuth(req: NextRequest): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  payload: AuthJWTPayload | null;
}> {
  try {
    const payload = await verifyJwtAuth(req);

    if (!payload) {
      return { isAuthenticated: false, isAdmin: false, payload: null };
    }

    const isAdmin = payload.role === "admin";

    return {
      isAuthenticated: true,
      isAdmin,
      payload,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return { isAuthenticated: false, isAdmin: false, payload: null };
  }
}
