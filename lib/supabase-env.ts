export type SupabaseEnv = { url: string; key: string };

const clean = (value: string | undefined) => (value ?? "").trim().replace(/^["']|["']$/g, "").trim();

/**
 * Validates the Supabase env vars. Values pasted into Vercel often carry stray quotes, spaces or a
 * missing `https://`, which makes the Supabase client throw and the whole request return a 500.
 * Returns null when they are unusable so callers can degrade gracefully instead of crashing.
 *
 * Pass `process.env.NEXT_PUBLIC_*` as literals at the call site — Next.js only inlines them for
 * the browser bundle when they are written out in full.
 */
export function readSupabaseEnv(rawUrl: string | undefined, rawKey: string | undefined): SupabaseEnv | null {
  const url = clean(rawUrl).replace(/\/+$/, "");
  const key = clean(rawKey);
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  } catch {
    return null;
  }
  return { url, key };
}

/** Server-side convenience wrapper. */
export function serverSupabaseEnv(): SupabaseEnv | null {
  return readSupabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
