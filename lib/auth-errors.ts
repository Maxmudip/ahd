/** Supabase auth errors -> readable Uzbek copy, always keeping the technical detail visible. */
export type AuthIssue = { message: string; code?: string; status?: number; name?: string };

export function authMessage(error: AuthIssue): string {
  const text = error.message.toLowerCase();
  let friendly: string | null = null;

  if (text.includes("invalid login credentials")) friendly = "Email yoki parol noto'g'ri.";
  else if (text.includes("email not confirmed")) friendly = "Email manzilingiz hali tasdiqlanmagan. Pochtangizdagi havolani bosing.";
  else if (text.includes("already registered") || text.includes("already been registered")) {
    friendly = "Bu email bilan hisob mavjud. Kirish sahifasiga o'ting.";
  } else if (text.includes("password") && text.includes("least")) friendly = "Parol kamida 6 belgidan iborat bo'lsin.";
  else if (text.includes("rate limit") || error.code === "over_email_send_rate_limit") {
    friendly = "Juda ko'p urinish yoki email limiti tugagan. Birozdan so'ng qayta urinib ko'ring.";
  } else if (text.includes("signups not allowed") || error.code === "signup_disabled") {
    friendly = "Ro'yxatdan o'tish Supabase'da o'chirilgan (Auth → Sign In / Providers).";
  } else if (text.includes("invalid api key") || text.includes("apikey")) {
    friendly = "Supabase kaliti (anon key) noto'g'ri yoki yo'q. Vercel environment variables ni tekshiring.";
  } else if (text.includes("failed to fetch") || text.includes("networkerror") || text.includes("load failed")) {
    friendly = "Supabase'ga ulanib bo'lmadi. NEXT_PUBLIC_SUPABASE_URL to'g'riligini va internetni tekshiring.";
  } else if (text.includes("error sending") && text.includes("email")) {
    friendly = "Tasdiqlash xatini yuborib bo'lmadi (Supabase SMTP sozlamalari).";
  } else if (text.includes("database error")) {
    friendly = "Ma'lumotlar bazasi xatosi. Migratsiya (supabase/migrations) ishga tushirilganini tekshiring.";
  }

  const detail = [error.status ? `HTTP ${error.status}` : null, error.code ?? null, error.message].filter(Boolean).join(" · ");
  // Unknown errors show the raw message only once; known ones add it as a technical line.
  return friendly ? `${friendly}\n[${detail}]` : error.message;
}

/** `?error=` values set by proxy.ts and /auth/callback. */
export function initialAuthError(error?: string | string[], reason?: string | string[]): string {
  const code = Array.isArray(error) ? error[0] : error;
  const why = Array.isArray(reason) ? reason[0] : reason;
  if (code === "config") {
    return "Server sozlanmagan: Supabase environment variables topilmadi. /api/auth-check sahifasini oching.";
  }
  if (code === "confirm") {
    const base = "Tasdiqlash havolasi eskirgan yoki noto'g'ri. Qayta kiring.";
    return why ? `${base}\n[${why}]` : base;
  }
  return "";
}
