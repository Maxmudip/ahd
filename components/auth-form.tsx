"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import { authMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase";

type AuthFormProps = {
  mode: "login" | "register";
  /** Message shown above the form, e.g. after a failed email confirmation link. */
  initialError?: string;
};

const points = [
  "Chatdan rasmiy kelishuv",
  "Raqamli imzo bir zumda",
  "Qarz — ikki tomonlama kelishuv",
];

export function AuthForm({ mode, initialError = "" }: AuthFormProps) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [error, setError] = useState(initialError);
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    setBusy(true);
    setError("");
    setInfo("");
    try {
      const supabase = createClient();
      // Only follow same-site relative paths from ?next=
      const requested = new URLSearchParams(window.location.search).get("next");
      const destination = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(authMessage(signInError));
          return;
        }
        router.replace(destination);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(authMessage(signUpError));
        return;
      }
      // Supabase hides "email already registered" by returning a user with no identities.
      if (data.user && data.user.identities?.length === 0) {
        setError(authMessage({ message: "User already registered" }));
        return;
      }
      if (data.session) {
        router.replace(destination);
        router.refresh();
        return;
      }
      setInfo(`${email} manziliga tasdiqlash xati yuborildi. Havolani bosing, so'ng kiring.`);
    } catch (e) {
      console.error("[auth] unexpected error:", e);
      setError(authMessage({ message: e instanceof Error ? e.message : "Kutilmagan xatolik", name: e instanceof Error ? e.name : undefined }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-[#111] px-12 py-12 text-white lg:flex">
        <Logo href="/" light />
        <div>
          <p className="text-[56px] leading-none font-bold tracking-[-0.03em]">Ahd</p>
          <p className="mt-4 text-[20px] text-[#ACABA8]">So&apos;zingiz hujjat bo&apos;lsin</p>
          <ul className="mt-10 space-y-3 text-[15px] text-[#EDECE9]">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2.5">
                <Check size={16} strokeWidth={2} className="text-[#C9A84C]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] text-[#787774]">© 2026 Ahd</p>
      </aside>

      <div className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-[360px]">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-[#111]">
            {isLogin ? "Kirish" : "Ro'yxatdan o'tish"}
          </h1>
          <p className="mt-2 text-[14px] text-[#787774]">
            {isLogin ? "Kelishuvlaringizga qayting." : "Bir necha daqiqada hisob oching."}
          </p>

          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5">
            {!isLogin && (
              <label className="block text-[14px] text-[#787774]">
                Ism
                <input required name="name" placeholder="Muhammad" className="field mt-1.5" />
              </label>
            )}
            <label className="block text-[14px] text-[#787774]">
              Email
              <input required type="email" name="email" placeholder="ism@ahd.uz" className="field mt-1.5" />
            </label>
            <label className="block text-[14px] text-[#787774]">
              Parol
              <input
                required
                type="password"
                name="password"
                placeholder="••••••••"
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="field mt-1.5"
              />
            </label>
            {error ? (
              <p role="alert" className="rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-[14px] whitespace-pre-line break-words text-[#C4554D]">
                {error}
              </p>
            ) : null}
            {info ? (
              <p role="status" className="rounded-[6px] bg-[#E8EEDC] px-3 py-2 text-[14px] text-[#5A6B38]">
                {info}
              </p>
            ) : null}
            <Button type="submit" wide disabled={busy} className="mt-1">
              {busy ? "Kuting…" : isLogin ? "Kirish" : "Ro'yxatdan o'tish"}
            </Button>
          </form>

          <p className="my-6 text-center text-[13px] text-[#ACABA8]">yoki</p>
          <button type="button" className="btn-secondary w-full" disabled>
            Google bilan davom etish
          </button>

          <p className="mt-8 text-center text-[14px] text-[#787774]">
            {isLogin ? (
              <>
                Hisobingiz yo&apos;qmi?{" "}
                <Link href="/register" className="font-medium text-[#37352F] hover:underline">
                  Ro&apos;yxatdan o&apos;ting
                </Link>
              </>
            ) : (
              <>
                Allaqachon hisob bormi?{" "}
                <Link href="/login" className="font-medium text-[#37352F] hover:underline">
                  Kirish
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
