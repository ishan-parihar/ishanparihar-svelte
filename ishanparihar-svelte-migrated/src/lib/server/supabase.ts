import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

function createSupabaseClient() {
  const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();