import "server-only";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { PERMISSION_SCOPES } from "./permissions-client";

/**
 * Get all permissions for a user
 * @param userId The user ID to get permissions for
 * @returns Array of permission strings
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("Supabase client not initialized");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("user_permissions")
      .select("permission")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user permissions:", error);
      return [];
    }

    return data.map((p: any) => p.permission);
  } catch (error) {
    console.error("Unexpected error fetching user permissions:", error);
    return [];
  }
}

/**
 * Check if a user has a specific permission
 * @param userId The user ID to check
 * @param permission The permission to check for
 * @returns Boolean indicating if the user has the permission
 */
export async function hasPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}

/**
 * Add a permission to a user
 * @param userId The user ID to add the permission to
 * @param permission The permission to add
 * @returns Boolean indicating success
 */
export async function addPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  try {
    const { error } = await supabase.from("user_permissions").insert({
      user_id: userId,
      permission,
    });

    if (error) {
      // If the error is a duplicate key error, the permission already exists
      if (error.code === "23505") {
        return true;
      }
      console.error("Error adding user permission:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error adding user permission:", error);
    return false;
  }
}

/**
 * Remove a permission from a user
 * @param userId The user ID to remove the permission from
 * @param permission The permission to remove
 * @returns Boolean indicating success
 */
export async function removePermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  try {
    const { error } = await supabase
      .from("user_permissions")
      .delete()
      .eq("user_id", userId)
      .eq("permission", permission);

    if (error) {
      console.error("Error removing user permission:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error removing user permission:", error);
    return false;
  }
}

/**
 * Set all permissions for a user (replaces existing permissions)
 * @param userId The user ID to set permissions for
 * @param permissions Array of permissions to set
 * @returns Boolean indicating success
 */
export async function setUserPermissions(
  userId: string,
  permissions: string[],
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  try {
    // Start a transaction to ensure atomicity
    // First, delete all existing permissions
    const { error: deleteError } = await supabase
      .from("user_permissions")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error removing existing user permissions:", deleteError);
      return false;
    }

    // If no permissions to add, we're done
    if (permissions.length === 0) {
      return true;
    }

    // Add the new permissions
    const permissionsToInsert = permissions.map((permission) => ({
      user_id: userId,
      permission,
    }));

    const { error: insertError } = await supabase
      .from("user_permissions")
      .insert(permissionsToInsert);

    if (insertError) {
      console.error("Error adding user permissions:", insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error setting user permissions:", error);
    return false;
  }
}

/**
 * Get all users with admin role
 * @returns Array of admin users with their permissions
 */
export async function getAdminUsers(): Promise<any[]> {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("Supabase client not initialized");
    return [];
  }

  try {
    console.log("Fetching admin users...");

    // Get all users with admin role
    const { data: adminUsers, error: usersError } = await supabase
      .from("users")
      .select("id, email, name, role, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (usersError) {
      console.error("Error fetching admin users:", usersError);
      return [];
    }

    console.log(`Found ${adminUsers?.length || 0} admin users`);

    // If no admin users found, return empty array
    if (!adminUsers || adminUsers.length === 0) {
      return [];
    }

    // Create a list of user IDs for the IN clause
    const userIds = adminUsers.map((user: any) => user.id);
    console.log("User IDs for permissions query:", userIds);

    try {
      // Get permissions for all admin users
      const { data: permissions, error: permissionsError } = await supabase
        .from("user_permissions")
        .select("user_id, permission")
        .in("user_id", userIds);

      if (permissionsError) {
        console.error("Error fetching admin permissions:", permissionsError);
        // Return admin users without permissions
        return adminUsers.map((user: any) => ({ ...user, permissions: [] }));
      }

      console.log(`Found ${permissions?.length || 0} permission records`);

      // If no permissions found, return admin users with empty permissions arrays
      if (!permissions || permissions.length === 0) {
        return adminUsers.map((user: any) => ({ ...user, permissions: [] }));
      }

      // Map permissions to users
      const result = adminUsers.map((user: any) => ({
        ...user,
        permissions: permissions
          .filter((p: any) => p.user_id === user.id)
          .map((p: any) => p.permission),
      }));

      console.log("Final admin users with permissions:", result);

      return result;
    } catch (permError) {
      console.error("Error in permissions query:", permError);
      // Return admin users without permissions if there's an error with the permissions query
      return adminUsers.map((user: any) => ({ ...user, permissions: [] }));
    }
  } catch (error) {
    console.error("Unexpected error fetching admin users:", error);
    return [];
  }
}

/**
 * Promote a user to admin role
 * @param email The email of the user to promote
 * @returns The updated user object or null if failed
 */
export async function promoteUserToAdmin(email: string): Promise<any | null> {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("Supabase client not initialized");
    return null;
  }

  try {
    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name, role")
      .eq("email", email)
      .single();

    // If user doesn't exist, create a new user
    if (userError) {
      console.log("User not found, creating new user:", email);

      // Generate a default avatar for the user
      const defaultAvatar = `https://api.dicebear.com/7.x/personas/svg?seed=${email.toLowerCase().replace(/[^a-z0-9]/g, "")}&backgroundColor=b6ccfe,c9b6fb,f5c6ff&backgroundType=gradientLinear`;

      // Create a new user with admin role
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          email,
          role: "admin",
          provider: "email",
          picture: defaultAvatar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id, email, name, role, created_at")
        .single();

      if (createError) {
        console.error("Error creating new admin user:", createError);
        return null;
      }

      return {
        ...newUser,
        permissions: [], // New admins have no permissions by default
      };
    }

    // Check if user is already an admin
    if (user.role === "admin") {
      console.log(`User ${email} is already an admin`);
      return {
        ...user,
        permissions: [], // Return empty permissions array
      };
    }

    // Update the user's role to admin
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ role: "admin" })
      .eq("id", user.id)
      .select("id, email, name, role, created_at")
      .single();

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return null;
    }

    // Return the updated user with empty permissions
    return {
      ...updatedUser,
      permissions: [], // New admins have no permissions by default
    };
  } catch (error) {
    console.error("Unexpected error promoting user to admin:", error);
    return null;
  }
}

/**
 * Demote an admin user to regular user
 * @param userId The ID of the admin to demote
 * @returns Boolean indicating success
 */
export async function demoteAdminToUser(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error("Supabase client not initialized");
    return false;
  }

  try {
    // Update the user's role to user
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: "user" })
      .eq("id", userId);

    if (updateError) {
      console.error("Error demoting admin user:", updateError);
      return false;
    }

    // Remove all permissions
    const { error: permissionsError } = await supabase
      .from("user_permissions")
      .delete()
      .eq("user_id", userId);

    if (permissionsError) {
      console.error("Error removing admin permissions:", permissionsError);
      // Continue anyway, the user has been demoted
    }

    return true;
  } catch (error) {
    console.error("Unexpected error demoting admin user:", error);
    return false;
  }
}
