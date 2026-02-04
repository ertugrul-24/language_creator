import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
}

// Log bound project URL for quick verification in browser console
try {
  // Using a distinct marker to make grep/search easy
  console.log('🔎 [Supabase] Bound project URL:', supabaseUrl);
} catch {}

// Instrument fetch to log REST requests for forensic debugging
const instrumentedFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const url = typeof input === 'string' ? input : (input as Request).url;
    const method = init?.method || 'GET';
    if (url.includes('/rest/')) {
      let body: any = undefined;
      try {
        body = init?.body ? (typeof init.body === 'string' ? JSON.parse(init.body as any) : init.body) : undefined;
      } catch {
        body = init?.body;
      }
      console.log('🛰️ [Supabase REST] Request', { method, url, body });
    }
  } catch {}
  const res = await fetch(input as any, init);
  try {
    const url = typeof input === 'string' ? input : (input as Request).url;
    if (url.includes('/rest/')) {
      console.log('🛰️ [Supabase REST] Response', { status: res.status, url });
    }
  } catch {}
  return res;
};

// Explicitly bind to the public schema and inject instrumented fetch
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
  global: { fetch: instrumentedFetch },
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
    (window as any).__whoAmI = async () => {
      const { data: { user } = { user: null } } = await supabase.auth.getUser();
      console.log('AUTH USER:', user?.id || null, user);
      return user;
    };
    (window as any).__insertTestRule = async (languageId: string) => {
      const { data: { user } = { user: null } } = await supabase.auth.getUser();
      if (!user) { console.warn('No authenticated user'); return; }
      const payload = {
        language_id: languageId,
        owner_id: user.id,
        name: 'UI Test Rule',
        description: 'Inserted via __insertTestRule',
        category: 'syntax',
        rule_type: 'word_order',
        pattern: 'SVO',
        examples: [],
      };
      console.log('🧪 Inserting test rule payload:', payload);
      const res = await supabase.from('grammar_rules').insert([payload]).select('*').single();
      console.log('🧪 Insert result:', res);
      return res;
    };
  }
} catch {}
