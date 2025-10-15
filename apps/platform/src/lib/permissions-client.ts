/**
 * Client-side permissions utilities
 * This file contains only code that is safe to use in client components
 */

// Define permission scopes
export const PERMISSION_SCOPES = {
  MANAGE_ADMINS: "MANAGE_ADMINS",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_BLOG: "MANAGE_BLOG",
  MANAGE_COMMENTS: "MANAGE_COMMENTS",
  MANAGE_NEWSLETTER: "MANAGE_NEWSLETTER",
  MANAGE_IMAGES: "MANAGE_IMAGES",
  MANAGE_SERVICES: "MANAGE_SERVICES",
  // Customer Support Permissions
  MANAGE_SUPPORT: "MANAGE_SUPPORT", // Full support system management
  VIEW_SUPPORT_TICKETS: "VIEW_SUPPORT_TICKETS", // View and respond to tickets
  MANAGE_CHAT: "MANAGE_CHAT", // Handle live chat sessions
  ASSIGN_TICKETS: "ASSIGN_TICKETS", // Assign tickets to team members
  VIEW_SUPPORT_ANALYTICS: "VIEW_SUPPORT_ANALYTICS", // View support metrics and reports
  // Sales & Revenue Permissions
  MANAGE_SALES: "MANAGE_SALES", // Full sales dashboard management
  // Analytics Permissions
  VIEW_ANALYTICS: "VIEW_ANALYTICS", // View site analytics and metrics
} as const;

export type PermissionScope = keyof typeof PERMISSION_SCOPES;

/**
 * Helper function to check if a user has a permission from the session
 * This function is safe to use in client components
 *
 * @param session The user session
 * @param permission The permission to check for
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermissionFromSession(
  session: any,
  permission: string,
): boolean {
  if (!session?.user) return false;

  // If the user is not an admin, they have no permissions
  if (session.user.role !== "admin") return false;

  // Check if the user is a primary admin (by email)
  // FIXED: Removed ishan.parihar.personal@gmail.com from primary admin list as it should be a regular user
  const primaryAdminEmails = ["ishanbestdabang@gmail.com"];
  const isPrimaryAdmin = primaryAdminEmails.includes(
    session.user.email?.trim().toLowerCase(),
  );

  // Primary admins have all permissions
  if (isPrimaryAdmin) {
    return true;
  }

  // For all permissions, check the permissions array
  return (
    Array.isArray(session.user.permissions) &&
    session.user.permissions.includes(permission)
  );
}
