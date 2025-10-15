import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { authConfig } from "./auth.config";
import { createSimpleEmailProvider } from "./lib/simple-email-provider";
import { createServiceRoleClient } from "@/utils/supabase/server";
import crypto from "crypto";
import { handleUserRegistrationNewsletter } from "@/lib/newsletterService";

// Import bcrypt at the top level to avoid dynamic import warnings
let bcrypt: typeof import("bcrypt") | undefined;
if (
  typeof window === "undefined" &&
  typeof (globalThis as any).EdgeRuntime === "undefined"
) {
  // Only import bcrypt on server side (not in edge runtime)
  try {
    bcrypt = require("bcrypt");
  } catch (error) {
    console.warn("[Auth] bcrypt not available in this runtime environment");
  }
}

// Initialize NextAuth with official Supabase adapter
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use official Supabase adapter
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  // Force JWT strategy for Edge Runtime compatibility with database adapter
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // Providers configuration
  providers: [
    // Google OAuth provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Fix: Enable automatic account linking for trusted OAuth providers
      // This allows multiple OAuth accounts with the same email to be linked to the same user
      allowDangerousEmailAccountLinking: true,
      checks: ["pkce", "state"],
      profile(profile) {
        // Debug logging disabled to reduce console noise
        // console.log(`[Google Provider] Profile received for: ${profile.email}, Google ID: ${profile.sub}`);
        // console.log(`[Google Provider] Full profile data:`, JSON.stringify(profile, null, 2));

        // Return user object that will be used by the Supabase adapter
        // This follows NextAuth.js v5 best practices for profile mapping
        // Note: Only return fields that exist in the official NextAuth.js schema
        // Don't set ID - let NextAuth generate a UUID automatically
        return {
          // id: profile.sub, // Don't override ID - let NextAuth generate UUID
          name:
            profile.name ||
            profile.given_name + " " + profile.family_name ||
            null, // Ensure name is captured
          email: profile.email,
          image: profile.picture || null, // Google profile picture URL
          emailVerified: profile.email_verified ? new Date() : null, // Convert boolean to Date or null
          // Role is handled in the session callback to avoid database schema conflicts
        };
      },
    }),

    // Email provider for magic link authentication
    createSimpleEmailProvider(),

    // Credentials provider for email/password login
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>>,
        request: Request,
      ) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        // Type assertion after validation
        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          console.log(
            `[NextAuth Credentials] Verifying credentials for email: ${email}`,
          );

          // Get the Supabase client with service role to bypass RLS
          const supabase = createServiceRoleClient();

          if (!supabase) {
            console.error(
              "[NextAuth Credentials] Supabase client not initialized",
            );
            return null;
          }

          // Check if the user exists
          const { data: user, error } = (await supabase
            .from("users")
            .select(
              "id, email, password_hash, name, role, provider, picture, custom_picture, email_verified, login_count, last_login",
            )
            .eq("email", email)
            .single()) as {
            data: {
              id: string;
              email: string;
              password_hash: string | null;
              name: string | null;
              role: string | null;
              provider: string | null;
              picture: string | null;
              custom_picture: boolean | null;
              email_verified: boolean | null;
              login_count: number | null;
              last_login: string | null;
            } | null;
            error: any;
          };

          if (error) {
            if (error.code === "PGRST116") {
              // No rows returned
              console.log(
                `[NextAuth Credentials] No user found with email: ${email}`,
              );
            } else {
              console.error(
                `[NextAuth Credentials] Error fetching user: ${error.code} - ${error.message}`,
              );
            }
            return null;
          }

          if (!user) {
            console.log(
              `[NextAuth Credentials] No user data returned for email: ${email}`,
            );
            return null;
          }

          console.log(`[NextAuth Credentials] User found:`, {
            id: user.id,
            email: user.email,
            provider: user.provider,
            hasPasswordHash: !!user.password_hash,
            emailVerified: user.email_verified,
          });

          // Check if the user can sign in with password (either email provider or has password_hash)
          if (
            user.provider === "email" ||
            user.provider === "credentials" ||
            user.password_hash
          ) {
            // If no password hash exists, user can't sign in with password
            if (!user.password_hash) {
              console.log(
                `[NextAuth Credentials] User has no password hash: ${email}`,
              );
              return null;
            }

            console.log(
              `[NextAuth Credentials] Verifying password for: ${email}`,
            );

            // Try password verification using pre-imported bcrypt
            let isPasswordValid = false;

            try {
              if (!bcrypt) {
                console.error(
                  `[NextAuth Credentials] bcrypt not available (edge runtime or client-side execution)`,
                );
                return null;
              }

              if (
                !user.password_hash ||
                typeof user.password_hash !== "string"
              ) {
                console.error(
                  `[NextAuth Credentials] No password hash found for user: ${email}`,
                );
                return null;
              }

              const passwordResult = await bcrypt.compare(
                password,
                user.password_hash as string,
              );
              isPasswordValid = passwordResult;
              console.log(
                `[NextAuth Credentials] Password verification result: ${isPasswordValid}`,
              );
            } catch (bcryptError) {
              console.error(
                `[NextAuth Credentials] Error in bcrypt.compare: ${bcryptError}`,
              );
              return null;
            }

            if (!isPasswordValid) {
              console.log(
                `[NextAuth Credentials] Invalid password for user: ${email}`,
              );
              return null;
            }

            console.log(
              `[NextAuth Credentials] Password verified successfully for: ${email}`,
            );
          } else if (user.provider === "google") {
            console.log(
              `[NextAuth Credentials] Google account cannot be verified with password: ${email}`,
            );
            return null;
          }

          // Password verified, update login stats
          try {
            const { error: updateError } = await supabase
              .from("users")
              .update({
                last_login: new Date().toISOString(),
                login_count: user.login_count ? user.login_count + 1 : 1,
              })
              .eq("id", user.id);

            if (updateError) {
              console.error(
                `[NextAuth Credentials] Error updating login stats: ${updateError.message}`,
              );
              // Continue anyway, this is not critical
            } else {
              console.log(
                `[NextAuth Credentials] Login stats updated successfully`,
              );
            }
          } catch (updateErr) {
            console.error(
              `[NextAuth Credentials] Exception updating login stats: ${updateErr}`,
            );
            // Continue anyway, this is not critical
          }

          // Return user data for NextAuth
          console.log(
            `[NextAuth Credentials] Authentication successful for: ${email}`,
          );
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.custom_picture ? user.picture : null,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("[NextAuth Credentials] Unexpected error:", error);
          return null;
        }
      },
    }),
  ],

  // Disable debug mode to reduce console noise
  debug: false,

  // Callbacks optimized for JWT sessions with Supabase adapter
  callbacks: {
    // JWT callback - now used with JWT sessions for Edge Runtime compatibility
    async jwt({ token, user, account }) {
      const TOKEN_VERSION = 1.1; // Increment this number to force-invalidate all sessions.

      // On initial sign-in, the 'user' object from the provider is available.
      if (account && user) {
        // This is the first login. The token is being created.
        const supabase = createServiceRoleClient();
        const { data: dbUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (dbUser) {
          token.id = dbUser.id; // CRITICAL: This is the ID from public.users
          token.role = dbUser.role;
          token.isFlagged = dbUser.is_spam_flagged;
          token.isSuspended = dbUser.suspended;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
          token.provider = account?.provider || dbUser.provider || "email";
          token.suspended = dbUser.suspended || false;
          token.suspension_expires_at = dbUser.suspension_expires_at || null;
          token.is_spam_flagged = dbUser.is_spam_flagged || false;

          // Use custom picture if available
          if (dbUser.picture) {
            token.picture = dbUser.picture;
          }
        }

        // Set token version to ensure all tokens have the correct structure
        token.version = TOKEN_VERSION;
        return token;
      }

      // For subsequent requests, 'token' is available. We need to re-validate.

      // Check token version - if it doesn't match, invalidate the session
      if (token.version !== TOKEN_VERSION) {
        console.log(
          `[JWT Callback] Token version mismatch. Expected: ${TOKEN_VERSION}, Got: ${token.version}. Invalidating session.`,
        );
        return { ...token, error: "TokenVersionMismatch" };
      }

      if (!token.id) {
        // If token has no ID, it's invalid.
        return { ...token, error: "NoUserIdInToken" };
      }

      // Re-fetch user from DB on every request to get the latest status.
      const supabase = createServiceRoleClient();
      const { data: dbUser } = await supabase
        .from("users")
        .select(
          "id, role, suspended, suspension_expires_at, is_spam_flagged, has_active_membership",
        )
        .eq("id", token.id)
        .single();

      if (!dbUser) {
        // User has been deleted from our system. Invalidate token.
        return { ...token, error: "UserNotFoundInDB" };
      }

      // Check if user is suspended
      if (dbUser.suspended) {
        // Check if suspension has expired
        if (dbUser.suspension_expires_at) {
          const expirationDate = new Date(dbUser.suspension_expires_at);
          const now = new Date();

          if (now > expirationDate) {
            // Suspension has expired, automatically unsuspend
            await supabase
              .from("users")
              .update({
                suspended: false,
                suspended_at: null,
                suspended_by: null,
                suspension_reason: null,
                suspension_expires_at: null,
              })
              .eq("id", token.id as string);

            token.suspended = false;
            token.suspension_expires_at = null;
          } else {
            // Suspension is still active - invalidate session
            return { ...token, error: "AccountSuspendedError" };
          }
        } else {
          // Permanent suspension - invalidate session
          return { ...token, error: "AccountSuspendedError" };
        }
      }

      // Update token with latest status
      token.role = dbUser.role;
      token.isFlagged = dbUser.is_spam_flagged;
      token.isSuspended = dbUser.suspended;
      token.suspended = dbUser.suspended || false;
      token.suspension_expires_at = dbUser.suspension_expires_at || null;
      token.is_spam_flagged = dbUser.is_spam_flagged || false;
      token.has_active_membership = dbUser.has_active_membership || false;

      // Set token version to ensure all tokens have the correct structure
      token.version = TOKEN_VERSION;
      return token;
    },

    // SignIn callback - let the adapter handle user creation, just validate
    async signIn({ user, account, profile }) {
      // Debug logging disabled to reduce console noise
      // console.log(`[SignIn Callback] Processing sign-in for: ${user?.email}`);
      // console.log(`[SignIn Callback] User object:`, JSON.stringify(user, null, 2));
      // console.log(`[SignIn Callback] Account object:`, JSON.stringify(account, null, 2));

      if (!user?.email) {
        console.error("[SignIn Callback] No email provided");
        return false;
      }

      // Check if user is suspended or spam-flagged before allowing sign-in
      try {
        const supabase = createServiceRoleClient();
        const { data: userData, error } = await supabase
          .from("users")
          .select(
            "suspended, suspension_expires_at, suspension_reason, suspended_at, suspended_by, is_spam_flagged, spam_flagged_at, spam_flagged_by, spam_score",
          )
          .eq("email", user.email)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          console.error(
            "[SignIn Callback] Error checking user suspension status:",
            error,
          );
          // Allow sign-in if we can't check status to avoid blocking legitimate users
        } else if (userData?.suspended) {
          // Check if suspension has expired
          if (userData.suspension_expires_at) {
            const expirationDate = new Date(userData.suspension_expires_at);
            const now = new Date();

            if (now > expirationDate) {
              // Suspension has expired, automatically unsuspend the user
              await supabase
                .from("users")
                .update({
                  suspended: false,
                  suspended_at: null,
                  suspended_by: null,
                  suspension_reason: null,
                  suspension_expires_at: null,
                })
                .eq("email", user.email);

              console.log(
                `[SignIn Callback] Auto-unsuspended expired suspension for: ${user.email}`,
              );
            } else {
              // Suspension is still active - redirect with details
              console.log(
                `[SignIn Callback] Blocked sign-in for suspended user: ${user.email}`,
              );
              const params = new URLSearchParams({
                error: "AccountSuspended",
                ...(userData.suspension_reason && {
                  reason: userData.suspension_reason,
                }),
                ...(userData.suspended_at && {
                  suspended_at: userData.suspended_at,
                }),
                ...(userData.suspended_by && {
                  suspended_by: userData.suspended_by,
                }),
                ...(userData.suspension_expires_at && {
                  expires_at: userData.suspension_expires_at,
                }),
              });
              return `/auth/error?${params.toString()}`;
            }
          } else {
            // Permanent suspension (no expiration date) - redirect with details
            console.log(
              `[SignIn Callback] Blocked sign-in for permanently suspended user: ${user.email}`,
            );
            const params = new URLSearchParams({
              error: "AccountSuspended",
              ...(userData.suspension_reason && {
                reason: userData.suspension_reason,
              }),
              ...(userData.suspended_at && {
                suspended_at: userData.suspended_at,
              }),
              ...(userData.suspended_by && {
                suspended_by: userData.suspended_by,
              }),
            });
            return `/auth/error?${params.toString()}`;
          }
        }

        // Check if user is spam-flagged (allow sign-in but they'll see the banner)
        if (userData?.is_spam_flagged) {
          console.log(
            `[SignIn Callback] User is spam-flagged but allowing sign-in: ${user.email}`,
          );
          // Note: We allow spam-flagged users to sign in but they'll see the banner
          // If you want to block them completely, uncomment the lines below:
          /*
          const params = new URLSearchParams({
            error: 'AccountSpamFlagged',
            ...(userData.spam_flagged_at && { flagged_at: userData.spam_flagged_at }),
            ...(userData.spam_flagged_by && { flagged_by: userData.spam_flagged_by }),
            ...(userData.spam_score && { spam_score: userData.spam_score.toString() }),
          });
          return `/auth/error?${params.toString()}`;
          */
        }
      } catch (error) {
        console.error(
          "[SignIn Callback] Error checking suspension status:",
          error,
        );
        // Allow sign-in if we can't check status to avoid blocking legitimate users
      }

      // Handle newsletter subscription for OAuth users
      // This runs after the Supabase adapter creates/updates the user
      if (user.id && user.email && user.name) {
        try {
          // Use setTimeout to run newsletter handling after the current callback completes
          setTimeout(async () => {
            try {
              await handleUserRegistrationNewsletter(
                user.email!,
                user.name!,
                user.id!,
              );
              console.log(
                `[Auth] Newsletter subscription handled for OAuth user: ${user.email}`,
              );
            } catch (newsletterError) {
              console.error(
                "[Auth] Error handling newsletter subscription for OAuth user:",
                newsletterError,
              );
            }
          }, 100);
        } catch (error) {
          console.error(
            "[Auth] Error setting up newsletter handling for OAuth user:",
            error,
          );
          // Don't fail sign-in if newsletter handling fails
        }
      }

      // Let the official Supabase adapter handle user creation and account linking
      // We just validate that the sign-in should be allowed
      // console.log(`[SignIn Callback] Sign-in successful for: ${user.email}`);
      return true;
    },

    // Session callback - now using JWT tokens for Edge Runtime compatibility
    async session({ session, token }) {
      // Debug logging disabled to reduce console noise
      // console.log(`[Session Callback] Processing session for token:`, token);

      // Check if token has an error (e.g., AccountSuspendedError, TokenVersionMismatch)
      if (token?.error === "AccountSuspendedError") {
        // Force sign out by throwing an error instead of returning null
        throw new Error("Session invalidated due to account suspension");
      }

      if (token?.error === "TokenVersionMismatch") {
        // Force sign out due to token version mismatch
        throw new Error("Session invalidated due to token version mismatch");
      }

      if (token?.error === "UserNotFoundInDB") {
        // Force sign out because user doesn't exist in our database
        throw new Error(
          "Session invalidated because user not found in database",
        );
      }

      if (token && session.user) {
        // With JWT sessions, the user data comes from the token
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        (session.user as any).role =
          token.role ||
          (session.user.email === "ishanbestdabang@gmail.com"
            ? "admin"
            : "user");
        (session.user as any).provider = token.provider || "email";
        (session.user as any).permissions = [];

        // Add suspension and spam status to session
        (session.user as any).suspended = token.suspended || false;
        (session.user as any).suspension_expires_at =
          token.suspension_expires_at || null;
        (session.user as any).isFlagged = token.is_spam_flagged || false;
        (session.user as any).is_spam_flagged = token.is_spam_flagged || false;
        (session.user as any).has_active_membership =
          token.has_active_membership || false;

        // Debug logging disabled to reduce console noise
        // console.log(`[Session Callback] Session configured for user: ${session.user.email} with role: ${(session.user as any).role}, provider: ${(session.user as any).provider}, name: ${session.user.name}, image: ${session.user.image}, suspended: ${(session.user as any).suspended}, isFlagged: ${(session.user as any).isFlagged}`);
      }

      return session;
    },
  },
});
