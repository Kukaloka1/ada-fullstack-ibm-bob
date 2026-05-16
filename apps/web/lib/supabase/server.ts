import { createClient } from '@supabase/supabase-js';
import type { Database } from '../ada/types';

/**
 * Create a Supabase client for server-side operations
 * 
 * This client uses the service role key for admin operations.
 * Use with caution - only in server components, API routes, or server actions.
 * 
 * For the MVP, we're not using Supabase Auth, so this is a simple client.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

