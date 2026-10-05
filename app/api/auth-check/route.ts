import { NextResponse, type NextRequest } from "next/server";
import { serverSupabaseEnv } from "@/lib/supabase-env";

export const dynamic = "force-dynamic";

/**
 * Deployment self-check: open `/api/auth-check` on production to see whether the Supabase env vars
 * made it into the build, whether Supabase is reachable, and which redirect URL to allow-list.
 * Returns only booleans and Supabase's own public settings — never keys.
 */
export async function GET(request: NextRequest) {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const env = serverSupabaseEnv();
  const origin = request.nextUrl.origin;

  const report: Record<string, unknown> = {
    envUrlSet: Boolean(rawUrl),
    envKeySet: Boolean(rawKey),
    envValid: Boolean(env),
    supabaseHost: env ? new URL(env.url).host : null,
    siteOrigin: origin,
    addToSupabaseRedirectUrls: [`${origin}/auth/callback`, `${origin}/**`],
  };

  if (!env) {
    report.ok = false;
    report.problem =
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY yo'q yoki noto'g'ri (URL https:// bilan boshlanishi, qo'shtirnoq/bo'sh joy bo'lmasligi kerak). Vercel → Settings → Environment Variables ga qo'shing va qayta deploy qiling.";
    return NextResponse.json(report, { status: 500 });
  }

  try {
    const res = await fetch(`${env.url}/auth/v1/settings`, { headers: { apikey: env.key }, cache: "no-store" });
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
