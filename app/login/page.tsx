import { AuthForm } from "@/components/auth-form";
import { initialAuthError } from "@/lib/auth-errors";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, reason } = await searchParams;
  return <AuthForm mode="login" initialError={initialAuthError(error, reason)} />;
}
