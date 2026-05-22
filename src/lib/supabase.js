/**
 * Supabase client (backend v2). Enable when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set.
 */
let client = null;

export async function getSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (client) return client;
  const { createClient } = await import('@supabase/supabase-js');
  client = createClient(url, key);
  return client;
}

export default getSupabase;
