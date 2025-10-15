/**
 * Unified Permission Service - Client-Safe Exports Only
 *
 * This file provides a centralized interface for client-safe permission operations.
 * Server-only functions must be imported directly from permissions-server.ts
 */

// Re-export client-safe utilities only
export {
  PERMISSION_SCOPES,
  type PermissionScope,
  hasPermissionFromSession,
} from "./permissions-client";

/**
 * Permission Service Documentation
 *
 * CLIENT-SAFE FUNCTIONS (exported from this file):
 * - PERMISSION_SCOPES: Constants defining available permissions
 * - hasPermissionFromSession: Check permissions from NextAuth session
 *
 * SERVER-ONLY FUNCTIONS (import directly from './permissions-server'):
 * - getUserPermissions: Get all permissions for a user from database
 * - hasPermission: Check if user has specific permission in database
 * - addPermission: Add permission to user
 * - removePermission: Remove permission from user
 * - setUserPermissions: Replace all user permissions
 * - getAdminUsers: Get all admin users with their permissions
 * - promoteUserToAdmin: Promote user to admin role
 * - demoteAdminToUser: Demote admin to regular user
 */
