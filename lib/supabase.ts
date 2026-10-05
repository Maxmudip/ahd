import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/supabase-env";

let client: SupabaseClient | undefined;

/**
 * Supabase client for Client Components (browser). Safe to call anywhere — it returns one shared
 * instance. Server-side code uses `createServerSupabase()` from `@/lib/supabase-server` instead.
 */
export function createClient(): SupabaseClient {
  if (client) return client;

  // Next.js inlines NEXT_PUBLIC_* variables only when they are read as literal `process.env.NAME`.
  const env = readSupabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!env) {
    throw new Error(
      "Supabase sozlanmagan yoki noto'g'ri: NEXT_PUBLIC_SUPABASE_URL (https://...supabase.co) va NEXT_PUBLIC_SUPABASE_ANON_KEY topilmadi. " +
        "Lokal: .env.local faylida belgilang va `npm run dev` ni qayta ishga tushiring. " +
        "Vercel: Project Settings → Environment Variables ga qo'shing va qayta deploy qiling " +
        "(NEXT_PUBLIC_* qiymatlari faqat build vaqtida kiritiladi).",
    );
  }

  client = createBrowserClient(env.url, env.key);
  return client;
}
