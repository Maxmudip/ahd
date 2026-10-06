"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Sheet } from "@/components/sheet";
import type { CompletionReason, Deal } from "@/lib/deals";
import { COMPLETION_REASONS, decodeCompletion } from "@/lib/deals";

export function RatingStars({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5" role={onChange ? "radiogroup" : "img"} aria-label={`${value} yulduz`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role={onChange ? "radio" : undefined}
          aria-checked={onChange ? n === value : undefined}
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`leading-none ${onChange ? "active:scale-90" : "pointer-events-none"}`}
          style={{ fontSize: size, color: n <= value ? "#C9A84C" : "#D6D3CC" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function RatingBadge({ rating, className = "" }: { rating?: number | null; className?: string }) {
  if (rating == null || Number.isNaN(rating)) return null;
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-[#8A6B2E] ${className}`}>
      <span aria-hidden>⭐</span>
      {rating.toFixed(1)}
    </span>
  );
}

export function CloseDealSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (reason: CompletionReason) => void;
}) {
  return (
    <Sheet open={open} title="Kelishuvni tugatish" onClose={onClose}>
      <div className="px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <p className="text-[17px] font-semibold text-ink">Kelishuvni tugatish</p>
        <p className="mt-1 text-[13.5px] text-ink2">Sababni tanlang. Qarshi tomon tasdiqlashi kerak.</p>
        <ul className="mt-4 space-y-2">
          {COMPLETION_REASONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onPick(item.id)}
                className="flex w-full items-start gap-3 rounded-[12px] border border-line px-3 py-3 text-left hover:bg-hov"
              >
                <span className="text-[20px]" aria-hidden>
                  {item.emoji}
                </span>
                <span className="text-[14.5px] font-medium leading-5 text-ink">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}

export function CompletedSheet({
  open,
  deal,
  onRate,
  onHome,
  onClose,
}: {
  open: boolean;
  deal: Deal;
  onRate: () => void;
  onHome: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} title="Kelishuv yakunlandi" onClose={onClose}>
      <div className="px-5 pt-6 pb-[max(20px,env(safe-area-inset-bottom))] text-center">
        <p className="check-pop text-[56px] leading-none" aria-hidden>
          ✅
        </p>
        <p className="mt-3 text-[18px] font-semibold text-ink">Kelishuv muvaffaqiyatli yakunlandi!</p>
        <div className="mt-4 rounded-[10px] bg-wash px-3 py-3 text-left text-[13.5px] text-ink">
          <p className="font-semibold">{deal.title}</p>
          <p className="mt-1 text-ink2">{deal.parties.map((p) => p.name).join(" · ")}</p>
          {deal.completedAt ? <p className="mt-1 text-ink2">{deal.completedAt}</p> : null}
        </div>
        <Button wide className="mt-5" onClick={onRate}>
          Baholash
        </Button>
        <button type="button" onClick={onHome} className="mt-3 w-full py-2 text-[14px] text-ink2 hover:text-ink">
          Bosh sahifaga
        </button>
      </div>
    </Sheet>
  );
}

export function RatingSheet({
  open,
  name,
  onSubmit,
  onSkip,
}: {
  open: boolean;
  name: string;
  onSubmit: (rating: number, comment: string) => Promise<void> | void;
  onSkip: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!stars || busy) return;
    setBusy(true);
    try {
      await onSubmit(stars, comment);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} title={`${name}ni baholang`} onClose={onSkip}>
      <div className="px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
        <p className="text-center text-[18px] font-semibold text-ink">{name}ni baholang</p>
        <div className="mt-4">
          <RatingStars value={stars} onChange={setStars} size={36} />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Izoh qoldiring (ixtiyoriy)"
          rows={3}
          className="field mt-5 min-h-[88px] w-full resize-none rounded-[10px] px-3 py-2.5 text-[14.5px]"
        />
        <Button wide className="mt-4" disabled={!stars || busy} onClick={() => void send()}>
          {busy ? "Yuborilmoqda…" : "Baholashni yuborish"}
        </Button>
        <button type="button" onClick={onSkip} className="mt-3 w-full py-2 text-[14px] text-ink2 hover:text-ink">
          O&apos;tkazib yuborish
        </button>
      </div>
    </Sheet>
  );
}

export function CompletionCard({
  id,
  author,
  text,
  mine,
  pending,
  canRespond,
  time,
  onAccept,
  onReject,
}: {
  id: string;
  author: string;
  text: string;
  mine: boolean;
  pending: boolean;
  canRespond: boolean;
  time?: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  const parsed = decodeCompletion(text);
  const label = parsed?.label ?? text;
  return (
    <div id={id} className="mx-auto w-full max-w-[92%] rounded-[12px] border border-line bg-other px-3 py-2.5 text-otherink">
      <p className="text-[13.5px] leading-5">
        <span className="font-semibold">{author}</span> kelishuvni tugatishni taklif qildi:{" "}
        <span className="font-medium">{label}</span>
      </p>
      {pending && canRespond ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="h-11 flex-1 rounded-[8px] bg-btn text-[13.5px] font-semibold text-btnink hover:opacity-85 md:h-9"
          >
            Tasdiqlash
          </button>
          <button
            type="button"
            onClick={onReject}
            className="h-11 flex-1 rounded-[8px] border border-[#E8B4B0] text-[13.5px] font-semibold text-[#C4554D] hover:bg-[#FDEBEC] md:h-9"
          >
            Rad etish
          </button>
        </div>
      ) : (
        <p className="mt-2 text-[12.5px] text-ink2">
          {pending ? (mine ? "Javob kutilmoqda" : "Tasdiqlash kutilmoqda") : "Javob berildi"}
        </p>
      )}
      {time ? <p className="mt-1 text-right text-[11px] text-ink2">{time}</p> : null}
    </div>
  );
}

export function MojaroBubble({
  name,
  text,
  time,
  own,
}: {
  name: string;
  text: string;
  time?: string;
  own: boolean;
}) {
  return (
    <div className={`flex w-full ${own ? "justify-end" : "justify-start"}`}>
      <div
        style={{ borderLeft: own ? undefined : "3px solid #C4554D" }}
        className={`max-w-[80%] rounded-[12px] px-2.5 py-1.5 md:max-w-[65%] ${
          own ? "bg-[#3A1F1F] text-[#F8E8E8]" : "border border-[#E8B4B0] bg-[#FDEBEC] text-[#3B2F0B]"
        }`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.04em] opacity-70">Mojaro · pozitsiya</p>
        <p className="mt-0.5 text-[12.5px] font-semibold">{name}</p>
        <p className="mt-0.5 text-[14.5px] leading-[1.4] break-anywhere whitespace-pre-wrap">{text}</p>
        {time ? <p className={`mt-0.5 text-right text-[11px] ${own ? "text-white/50" : "text-[#8A6B2E]"}`}>{time}</p> : null}
      </div>
    </div>
  );
}
