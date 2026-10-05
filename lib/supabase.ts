import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * Supabase client for Client Components (browser). Safe to call anywhere — it returns one shared
 * instance. Server-side code uses `createServerSupabase()` from `@/lib/supabase-server` instead.
 */
export function createClient(): SupabaseClient {
  if (client) return client;

  // Next.js inlines NEXT_PUBLIC_* variables only when they are read as literal `process.env.NAME`.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart `npm run dev`.",
    );
  }

  client = createBrowserClient(url, key);
  return client;
}
