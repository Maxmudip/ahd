import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <AuthForm
      mode="login"
      initialError={error === "confirm" ? "Tasdiqlash havolasi eskirgan yoki noto'g'ri. Qayta kiring." : ""}
    />
  );
}
