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

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
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
