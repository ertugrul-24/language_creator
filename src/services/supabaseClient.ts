import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, assertSupabaseConfig } from '@/config/supabaseConfig';

assertSupabaseConfig();

// Explicitly bind to the public schema; no instrumentation, no window helpers
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'public' },
});

// Test connection
export const testConnection = async () => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    return true;
  } catch (err) {
    return false;
  }
};

// No debug helpers; production-clean client
