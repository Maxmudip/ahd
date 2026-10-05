import { NextResponse } from "next/server";
import { createAnthropic, describeKey, readAnthropicKey } from "@/lib/anthropic";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY debug endpoint — delete it once AI generation works.
 *   GET /api/debug-env           -> what the server sees (the key is never returned in full)
 *   GET /api/debug-env?verify=1  -> also asks Anthropic whether the key is accepted (signed-in users only;
 *                                    uses the free "list models" call, no tokens are spent)
 */
export async function GET(request: Request) {
  const raw = process.env.ANTHROPIC_API_KEY;
  const info = describeKey(raw);

  const report: Record<string, unknown> = {
    hasAnthropicKey: !!raw,
    keyPrefix: raw?.substring(0, 10),
    keyLength: info.length,
    keyHadWhitespaceOrQuotes: info.hadWhitespaceOrQuotes,
    keyLooksValid: info.looksValid,
    // The SDK also honours these; a stale value here is a classic cause of "invalid key" 401s.
    anthropicBaseUrlEnv: process.env.ANTHROPIC_BASE_URL ? new URL(process.env.ANTHROPIC_BASE_URL).host : null,
    hasAnthropicAuthTokenEnv: !!process.env.ANTHROPIC_AUTH_TOKEN,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  };

  if (new URL(request.url).searchParams.get("verify") === "1") {
    const key = readAnthropicKey();
    if (!key) {
      report.verify = { ok: false, error: "ANTHROPIC_API_KEY is empty or missing" };
    } else {
      let signedIn = false;
      try {
        const supabase = await createServerSupabase();
        signedIn = Boolean((await supabase.auth.getUser()).data.user);
      } catch {
        signedIn = false;
      }
      if (!signedIn) {
        report.verify = { ok: false, error: "Sign in first (verify is for signed-in users only)" };
      } else {
        try {
          const client = createAnthropic(key);
          await client.models.list({ limit: 1 });
          report.verify = { ok: true, baseURL: new URL(client.baseURL).host };
        } catch (error) {
          report.verify = {
            ok: false,
            status: (error as { status?: number }).status ?? null,
            error: error instanceof Error ? error.message : "unknown error",
          };
        }
      }
    }
  }

  return NextResponse.json(report);
}
