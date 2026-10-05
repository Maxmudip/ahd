import { AuthForm } from "@/components/auth-form";
import { initialAuthError } from "@/lib/auth-errors";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { error, reason } = await searchParams;
  return <AuthForm mode="register" initialError={initialAuthError(error, reason)} />;
}
