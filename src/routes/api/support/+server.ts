import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../lib/server/supabase';

const createTicketSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional()
});

export async function POST(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();
    const data = await event.request.json();
    const validatedData = validateRequest(createTicketSchema, data);

    // Create a new support ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: auth.user.userId,
        subject: validatedData.subject,
        message: validatedData.message,
        priority: validatedData.priority,
        category: validatedData.category || 'general',
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;

    return json({ success: true, ticket });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();

    // Get user's support tickets
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', auth.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return json({ tickets: tickets || [] });
  } catch (error) {
    return handleApiError(error);
  }
}