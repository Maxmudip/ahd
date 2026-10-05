import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deployment self-check: open `/api/auth-check` on production to see whether the Supabase env vars
 * made it into the build, whether Supabase is reachable, and which redirect URL to allow-list.
 * Returns only booleans and Supabase's own public settings — never keys.
 */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const origin = request.nextUrl.origin;

  const report: Record<string, unknown> = {
    envUrlSet: Boolean(url),
    envKeySet: Boolean(key),
    supabaseHost: url ? new URL(url).host : null,
    siteOrigin: origin,
    addToSupabaseRedirectUrls: [`${origin}/auth/callback`, `${origin}/**`],
  };

  if (!url || !key) {
    report.ok = false;
    report.problem =
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY yo'q. Vercel → Settings → Environment Variables ga qo'shing va qayta deploy qiling.";
    return NextResponse.json(report, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key }, cache: "no-store" });
    report.authReachable = res.ok;
    report.authStatus = res.status;
    if (res.ok) {
      const settings = await res.json();
      report.emailLoginEnabled = settings?.external?.email ?? null;
      report.signupsDisabled = settings?.disable_signup ?? null;
      report.emailAutoconfirm = settings?.mailer_autoconfirm ?? null;
    } else {
      report.problem = "Supabase auth javob berdi, lekin xato bilan — kalit (anon key) noto'g'ri bo'lishi mumkin.";
    }
  } catch (error) {
    report.authReachable = false;
    report.problem = `Supabase'ga ulanib bo'lmadi: ${error instanceof Error ? error.message : "noma'lum xato"}`;
  }

  report.ok = report.authReachable === true;
  return NextResponse.json(report, { status: report.ok ? 200 : 500 });
}
