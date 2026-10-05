import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { serverSupabaseEnv } from "@/lib/supabase-env";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads the session from the request cookies; the proxy (`proxy.ts`) keeps those cookies fresh.
 */
export async function createServerSupabase() {
  const env = serverSupabaseEnv();
  if (!env) throw new Error("Supabase environment variables are missing or invalid (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");
  const cookieStore = await cookies();

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. The proxy refreshes the
          // session, so this is safe to ignore.
        }
      },
    },
  });
}
