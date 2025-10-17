import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError, requireAdmin } from '../../utils';

export async function GET(event: RequestEvent) {
  try {
    const session = await requireAdmin(event);
    
    return json({
      success: true,
      message: 'Admin API is operational',
      user: session.user
    });
  } catch (err) {
    return handleApiError(err);
  }
}