import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../../lib/server/api/utils';
import { createServiceRoleClient } from '../../../lib/server/supabase';

const sendMessageSchema = z.object({
  message: z.string().min(1),
  type: z.enum(['customer', 'support']).default('customer')
});

export async function POST(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();
    const data = await event.request.json();
    const validatedData = validateRequest(sendMessageSchema, data);

    // Create a new chat message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: auth.user.userId,
        message: validatedData.message,
        type: validatedData.type,
        read: false
      })
      .select()
      .single();

    if (error) throw error;

    return json({ success: true, message });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(event: RequestEvent) {
  try {
    const auth = await requireAuth(event);
    const supabase = createServiceRoleClient();

    // Get chat messages for the user
    const url = new URL(event.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const before = url.searchParams.get('before');

    let dbQuery = supabase
      .from('chat_messages')
      .select(`
        *,
        user:users(email, name)
      `)
      .eq('user_id', auth.user.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      dbQuery = dbQuery.lt('created_at', before);
    }

    const { data: messages, error } = await dbQuery;

    if (error) throw error;

    // Mark messages as read
    await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('user_id', auth.user.userId)
      .eq('read', false);

    return json({ messages: messages || [] });
  } catch (error) {
    return handleApiError(error);
  }
}