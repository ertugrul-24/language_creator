// Single source of truth for Supabase project binding.
// TEMPORARY: Hardcode your dashboard project values here to eliminate env ambiguity.
// IMPORTANT: Replace the placeholders below with your actual project URL and anon key.

export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

// Optional: assert they were replaced to avoid silent misbinding.
export function assertSupabaseConfig() {
  if (SUPABASE_URL.includes('YOUR-PROJECT') || SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY')) {
    throw new Error('Supabase config not set. Update src/config/supabaseConfig.ts with your real project URL and anon key.');
  }
}
