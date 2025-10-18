import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { requireAdmin } from '$lib/server/auth';
import { getUserPermissions } from '$lib/server/permissions';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await requireAdmin({ locals } as any);
  
  // Load user permissions for component rendering
  const permissions = await getUserPermissions(session.user.userId);
  
  return {
    user: session.user,
    permissions
  };
};