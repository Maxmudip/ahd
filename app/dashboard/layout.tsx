import { redirect } from "next/navigation";
import { AppProvider } from "@/components/app-store";
import { ChatShell } from "@/components/chat-shell";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // The profile row is created by a database trigger; fall back to the sign-up metadata if it is not there yet.
  const { data: profile } = await supabase.from("users").select("full_name, phone").eq("id", user.id).maybeSingle();
  const email = user.email ?? "";
  const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const name = profile?.full_name?.trim() || metaName.trim() || email.split("@")[0] || "Foydalanuvchi";

  return (
    <AppProvider user={{ id: user.id, name, email, phone: profile?.phone ?? "" }}>
      <ChatShell>{children}</ChatShell>
    </AppProvider>
  );
}
