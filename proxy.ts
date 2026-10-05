import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before /dashboard, /login and /register:
 *  - refreshes the Supabase session cookie,
 *  - sends signed-out visitors from /dashboard to /login,
 *  - sends signed-in users away from /login and /register.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Missing env vars (e.g. not set on Vercel) must not turn /login into a 500: let the page render so
  // the form can show a readable error. Protected routes stay closed.
  if (!url || !key) {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const to = request.nextUrl.clone();
      to.pathname = "/login";
      to.search = "?error=config";
      return NextResponse.redirect(to);
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() verifies the JWT; do not run code between createServerClient and this call.
  let signedIn = false;
  try {
    const { data } = await supabase.auth.getClaims();
    signedIn = Boolean(data?.claims);
  } catch (error) {
    // Supabase unreachable / bad key: treat as signed out instead of crashing the request.
    console.error("[proxy] auth check failed:", error instanceof Error ? error.message : error);
  }
  const { pathname, search } = request.nextUrl;

  const redirect = (to: string, query?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = query ?? "";
    const redirectResponse = NextResponse.redirect(url);
    // Keep any refreshed session cookies on the redirect.
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  };

  if (!signedIn && pathname.startsWith("/dashboard")) {
    return redirect("/login", `?next=${encodeURIComponent(pathname + search)}`);
  }
  if (signedIn && (pathname === "/login" || pathname === "/register")) {
    return redirect("/dashboard");
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
