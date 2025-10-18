import { createServiceRoleClient } from './supabase';
import { PERMISSION_SCOPES } from '$lib/constants/permissions';

async function getSupabaseClient() {
  return createServiceRoleClient();
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
  
  if (data && Array.isArray(data)) {
    return data.map((p: any) => p.permission);
  }
  
  return [];
}

export async function hasPermission(
  userId: string,
  permission: keyof typeof PERMISSION_SCOPES
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(PERMISSION_SCOPES[permission]);
}

export async function requirePermission(
  userId: string,
  permission: keyof typeof PERMISSION_SCOPES
) {
  const hasRequiredPermission = await hasPermission(userId, permission);
  if (!hasRequiredPermission) {
    throw new Error(`Permission required: ${permission}`);
  }
}