import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

/** Email confirmation / magic link landing: exchanges the `code` for a session, then opens the app. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // Only allow same-site relative redirects.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const fail = (reason: string) => {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "confirm");
    url.searchParams.set("reason", reason.slice(0, 200));
    return NextResponse.redirect(url);
  };

  // Supabase redirects here with ?error=...&error_description=... when the link is invalid/expired.
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) return fail(providerError);
  if (!code) return fail("Havolada tasdiqlash kodi yo'q (code parametri topilmadi).");

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession:", error.message);
      return fail(error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kutilmagan xatolik";
    console.error("[auth/callback] failed:", message);
    return fail(message);
  }
  return NextResponse.redirect(`${origin}${target}`);
}
