import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { error } = await searchParams;
  return (
    <AuthForm
      mode="register"
      initialError={error === "confirm" ? "Tasdiqlash havolasi eskirgan yoki noto'g'ri. Qayta kiring." : ""}
    />
  );
}
