import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { handleApiError } from '../../utils';

export async function GET(event: RequestEvent) {
  try {
    // Return basic blog information
    return json({
      success: true,
      message: 'Blog API is operational'
    });
  } catch (err) {
    return handleApiError(err);
  }
}