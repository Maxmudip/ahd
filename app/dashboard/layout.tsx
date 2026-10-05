import { redirect, unstable_rethrow } from "next/navigation";
import { AppProvider } from "@/components/app-store";
import { ChatShell } from "@/components/chat-shell";
import { createServerSupabase } from "@/lib/supabase-server";
import { serverSupabaseEnv } from "@/lib/supabase-env";

type Session = { id: string; name: string; email: string; phone: string };

/** Reads the signed-in user. Returns "config" / "unreachable" instead of throwing, so production never shows a bare 500. */
async function loadSession(): Promise<Session | null | "config" | "unreachable"> {
  if (!serverSupabaseEnv()) return "config";
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // The profile row is created by a database trigger; fall back to the sign-up metadata if it is not there yet.
    const { data: profile } = await supabase.from("users").select("full_name, phone").eq("id", user.id).maybeSingle();
    const email = user.email ?? "";
    const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
    const name = profile?.full_name?.trim() || metaName.trim() || email.split("@")[0] || "Foydalanuvchi";
    return { id: user.id, name, email, phone: profile?.phone ?? "" };
  } catch (error) {
    // Next.js control-flow errors (dynamic-rendering bailout, redirects) must not be swallowed.
    unstable_rethrow(error);
    console.error("[dashboard/layout] session load failed:", error instanceof Error ? error.message : error);
    return "unreachable";
  }
}

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await loadSession();
  if (session === "config") redirect("/login?error=config");
  if (session === "unreachable") redirect("/login?error=server");
  if (!session) redirect("/login");

  return (
    <AppProvider user={session}>
      <ChatShell>{children}</ChatShell>
    </AppProvider>
  );
}
