"use client";

import { useState } from "react";
import { useApp } from "@/components/app-store";
import { Button } from "@/components/button";
import { KindBadge } from "@/components/kind-badge";
import type { Deal } from "@/lib/deals";
import { COUNTERPART_ROLE, ROLE_LABEL } from "@/lib/roles";

export function InviteActions({
  onAccept,
  onReject,
  wide = false,
}: {
  onAccept: () => void;
  onReject: () => void;
  wide?: boolean;
}) {
  const [busy, setBusy] = useState<"yes" | "no" | null>(null);

  async function run(which: "yes" | "no", fn: () => void | Promise<void>) {
    if (busy) return;
    setBusy(which);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={`flex gap-2 ${wide ? "w-full" : ""}`}>
      <button
        type="button"
        disabled={busy !== null}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void run("yes", onAccept);
        }}
        className="h-11 flex-1 rounded-[8px] bg-[#111] px-3 text-[13px] font-semibold text-white hover:opacity-85 disabled:opacity-40 md:h-9"
      >
        {busy === "yes" ? "…" : "✅ Qabul qilish"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void run("no", onReject);
        }}
        className="h-11 flex-1 rounded-[8px] border border-[#E8B4B0] px-3 text-[13px] font-semibold text-[#C4554D] hover:bg-[#FDEBEC] disabled:opacity-40 md:h-9"
      >
        {busy === "no" ? "…" : "❌ Rad etish"}
      </button>
    </div>
  );
}

/** Full-page waiting / rejected / incoming-invite states. Chat is hidden until the deal is active. */
export function DealGate({
  deal,
  meName,
  onAccept,
  onReject,
  onResend,
}: {
  deal: Deal;
  meName: string;
  onAccept: () => Promise<void> | void;
  onReject: () => Promise<void> | void;
  onResend: (email: string) => Promise<void>;
}) {
  const { syncError } = useApp();
  const [email, setEmail] = useState(deal.invitation?.email ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const theirRole = deal.initiatorRole ? ROLE_LABEL[COUNTERPART_ROLE[deal.initiatorRole]] : "qarshi tomon";
  const myRole = deal.initiatorRole ? ROLE_LABEL[deal.initiatorRole] : "";

  if (deal.incomingInvite) {
    const from = deal.parties.find((p) => p.userId === deal.createdBy)?.name || deal.counterparty || "Kimdir";
    return (
      <div className="chat-bg flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-[40px]" aria-hidden>
          📨
        </p>
        <p className="mt-3 text-[18px] font-semibold text-ink">{from} sizni kelishuvga taklif qildi</p>
        <p className="mt-2 max-w-sm text-[14px] text-ink2">
          {deal.title}
          {myRole ? ` · Sizning rolingiz: ${theirRole}` : null}
        </p>
        <div className="mt-6 w-full max-w-[320px]">
          <InviteActions onAccept={onAccept} onReject={onReject} wide />
        </div>
      </div>
    );
  }

  if (deal.status === "rejected") {
    return (
      <div className="chat-bg flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-[40px]" aria-hidden>
          ❌
        </p>
        <p className="mt-3 text-[18px] font-semibold text-[#C4554D]">Taklif rad etildi</p>
        <p className="mt-2 max-w-sm text-[14px] text-ink2">
          {deal.counterparty} taklifni rad etdi. Boshqa emailga qayta yuborishingiz mumkin.
        </p>
        <form
          className="mt-6 flex w-full max-w-[360px] flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const next = email.trim();
            if (!next.includes("@") || sending) return;
            setSending(true);
            setError("");
            void onResend(next)
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Yuborib bo'lmadi."))
              .finally(() => setSending(false));
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yangi@pochta.uz"
            className="field"
          />
          {error ? <p className="text-[13px] text-[#C4554D]">{error}</p> : null}
          <Button type="submit" wide disabled={sending}>
            {sending ? "Yuborilmoqda…" : "Qayta taklif yuborish"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-bg flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-[40px]" aria-hidden>
        ⏳
      </p>
      <p className="mt-3 text-[18px] font-semibold text-ink">Javob kutilmoqda</p>
      <p className="mt-2 max-w-sm text-[14px] text-ink2">
        Taklif <span className="font-medium text-ink">{deal.invitation?.email || deal.counterparty}</span> manziliga
        yuborildi
        {theirRole ? (
          <>
            {" "}
            ({theirRole}). {meName}, siz {myRole.toLowerCase()} sifatida kutyapsiz.
          </>
        ) : (
          "."
        )}{" "}
        Qabul qilingach chat ochiladi.
      </p>
      <div className="mt-4">
        <KindBadge kind={deal.kind ?? "kelishuv"} />
      </div>
      {syncError ? (
        <p role="alert" className="mt-5 max-w-sm rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-left text-[13px] text-[#C4554D]">
          {syncError}
        </p>
      ) : null}
    </div>
  );
}
