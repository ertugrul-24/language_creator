import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
}

// Log bound project URL for quick verification in browser console
try {
  // Using a distinct marker to make grep/search easy
  console.log('🔎 [Supabase] Bound project URL:', supabaseUrl);
} catch {}

// Explicitly bind to the public schema to avoid accidental non-public exposure
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
});

// Test connection
export const testConnection = async () => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✅ Supabase connected');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    return false;
  }
};

// Lightweight helper to test API layer visibility for grammar_rules
export const testApiVisibility = async () => {
  try {
    const { data, error } = await supabase
      .from('grammar_rules')
      .select('*')
      .limit(1);

    console.log('🔎 [Supabase] API visibility check → data:', data);
    if (error) {
      console.error('❌ [Supabase] API visibility check → error:', {
        message: error.message,
        code: (error as any).code,
        status: (error as any).status,
        details: (error as any).details,
        hint: (error as any).hint,
      });
    }
    return { data, error };
  } catch (err) {
    console.error('❌ [Supabase] API visibility check failed:', err);
    return { data: null, error: err as any };
  }
};

// Expose helpers to the browser console for quick verification
try {
  if (typeof window !== 'undefined') {
    (window as any).__supabase = supabase;
    (window as any).__testGrammarRules = async () => {
      const test = await supabase.from('grammar_rules').select('*').limit(1);
      console.log('GRAMMAR RULES TEST:', test);
      return test;
    };
  }
} catch {}
