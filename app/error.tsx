"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Route-level error boundary: a readable page (with the error digest to find in Vercel logs) instead of a bare 500. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <h1 className="text-[24px] font-semibold text-[#111]">Xatolik yuz berdi</h1>
      <p className="max-w-[420px] text-[14px] text-[#787774]">
        Sahifani yuklab bo&apos;lmadi. Qayta urinib ko&apos;ring yoki bosh sahifaga qayting.
        {error.digest ? <span className="mt-2 block text-[12px] text-[#ACABA8]">Kod: {error.digest}</span> : null}
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Qayta urinish
        </button>
        <Link href="/" className="btn-secondary">
          Bosh sahifa
        </Link>
      </div>
    </main>
  );
}
