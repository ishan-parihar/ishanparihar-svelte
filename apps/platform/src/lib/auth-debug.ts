/**
 * Authentication debugging utilities
 * Helps track and debug authentication issues
 */

import { createServiceRoleClient } from "@/utils/supabase/server";

export interface AuthDebugInfo {
  sessionUserId?: string;
  sessionUserEmail?: string;
  adapterUserId?: string;
  adapterUserEmail?: string;
  databaseUser?: any;
  accountInfo?: any;
  timestamp: string;
}

/**
 * Debug authentication state by checking database consistency
 */
export async function debugAuthState(
  sessionUser?: any,
  adapterUser?: any,
  account?: any,
): Promise<AuthDebugInfo> {
  const debugInfo: AuthDebugInfo = {
    timestamp: new Date().toISOString(),
    sessionUserId: sessionUser?.id,
    sessionUserEmail: sessionUser?.email,
    adapterUserId: adapterUser?.id,
    adapterUserEmail: adapterUser?.email,
    accountInfo: account
      ? {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
        }
      : undefined,
  };

  // Check database state
  if (adapterUser?.id || sessionUser?.id) {
    try {
      const supabase = createServiceRoleClient();
      const userId = adapterUser?.id || sessionUser?.id;

      const { data: dbUser, error } = await supabase
        .from("users")
        .select(
          "id, email, name, provider, provider_id, role, created_at, updated_at",
        )
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[Auth Debug] Database query error:", error);
      } else if (dbUser) {
        debugInfo.databaseUser = dbUser;
      }
    } catch (error) {
      console.error("[Auth Debug] Error checking database state:", error);
    }
  }

  return debugInfo;
}

/**
 * Log authentication debug information
 */
export function logAuthDebug(context: string, debugInfo: AuthDebugInfo) {
  console.log(`[Auth Debug - ${context}] Authentication state:`, {
    timestamp: debugInfo.timestamp,
    session: {
      userId: debugInfo.sessionUserId,
      email: debugInfo.sessionUserEmail,
    },
    adapter: {
      userId: debugInfo.adapterUserId,
      email: debugInfo.adapterUserEmail,
    },
    database: debugInfo.databaseUser
      ? {
          id: debugInfo.databaseUser.id,
          email: debugInfo.databaseUser.email,
          provider: debugInfo.databaseUser.provider,
          role: debugInfo.databaseUser.role,
        }
      : "Not found",
    account: debugInfo.accountInfo,
    issues: detectIssues(debugInfo),
  });
}

/**
 * Detect potential authentication issues
 */
function detectIssues(debugInfo: AuthDebugInfo): string[] {
  const issues: string[] = [];

  // Check for user ID mismatch
  if (
    debugInfo.sessionUserId &&
    debugInfo.adapterUserId &&
    debugInfo.sessionUserId !== debugInfo.adapterUserId
  ) {
    issues.push("User ID mismatch between session and adapter");
  }

  // Check for email mismatch
  if (
    debugInfo.sessionUserEmail &&
    debugInfo.adapterUserEmail &&
    debugInfo.sessionUserEmail !== debugInfo.adapterUserEmail
  ) {
    issues.push("Email mismatch between session and adapter");
  }

  // Check if adapter user exists in database
  if (debugInfo.adapterUserId && !debugInfo.databaseUser) {
    issues.push("Adapter user ID not found in database");
  }

  // Check for email mismatch with database
  if (
    debugInfo.databaseUser &&
    debugInfo.adapterUserEmail &&
    debugInfo.databaseUser.email !== debugInfo.adapterUserEmail
  ) {
    issues.push("Email mismatch between adapter and database");
  }

  return issues;
}

/**
 * Validate user consistency across session, adapter, and database
 */
export async function validateUserConsistency(
  sessionUser?: any,
  adapterUser?: any,
  account?: any,
): Promise<{ isValid: boolean; issues: string[]; debugInfo: AuthDebugInfo }> {
  const debugInfo = await debugAuthState(sessionUser, adapterUser, account);
  const issues = detectIssues(debugInfo);

  return {
    isValid: issues.length === 0,
    issues,
    debugInfo,
  };
}
