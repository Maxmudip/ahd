"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-store";
import { Avatar } from "@/components/avatar";
import { freshId, markFresh } from "@/lib/chat-helpers";
import { formatUzDate } from "@/lib/deals";
import { Button } from "@/components/button";
import { PageFrame } from "@/components/page-frame";
import {
  formatAmountInput,
  formatMoney,
  parseAmountInput,
  type Currency,
  type PoolRequest,
  type Schedule,
} from "@/lib/pool-qarz";

const STEPS = ["Qarz ma'lumotlari", "Do'stlarni tanlash", "Kafolat", "Tasdiqlash"];

export default function CreatePoolRequestPage() {
  const router = useRouter();
  const { addPool, me, contacts: friends, refreshContacts } = useApp();
  const [step, setStep] = useState(0);
  const [amountRaw, setAmountRaw] = useState("");
  const [currency, setCurrency] = useState<Currency>("UZS");
  const [purpose, setPurpose] = useState("");
  const [repayDate, setRepayDate] = useState("");
  const [schedule, setSchedule] = useState<Schedule>("once");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sendAll, setSendAll] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState(me.name.toUpperCase());
  const [expiry, setExpiry] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const amount = parseAmountInput(amountRaw);
  useEffect(() => {
    void refreshContacts(); // pick up users who registered after this page was loaded
  }, [refreshContacts]);

  const invited = sendAll ? friends : friends.filter((f) => selected.includes(f.id));
  const last4 = cardNumber.replace(/\s/g, "").slice(-4) || "••••";

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(
      (f) => f.name.toLowerCase().includes(q) || f.phone.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [query, friends]);

  function toggleFriend(id: string) {
    setSendAll(false);
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : current.length >= 20 ? current : [...current, id],
    );
  }

  function next() {
    setError("");
    if (step === 0) {
      if (amount <= 0 || purpose.trim().length < 8) {
        setError("Summa va maqsadni to'liq kiriting (kamida 8 belgi).");
        return;
      }
      if (!repayDate) {
        setError("Qaytarish sanasini tanlang.");
        return;
      }
    }
    if (step === 1) {
      if (invited.length < 2) {
        setError("Kamida 2 ta do'st tanlang.");
        return;
      }
      if (invited.length > 20) {
        setError("Ko'pi bilan 20 ta do'st.");
        return;
      }
    }
    if (step === 2) {
      if (cardNumber.replace(/\s/g, "").length < 16 || !cardHolder.trim() || !expiry.includes("/")) {
        setError("Karta ma'lumotlarini to'ldiring.");
        return;
      }
      if (!agreed) {
        setError("Shartlarga rozilik belgilang.");
        return;
      }
    }
    if (step === 3) {
      const poolId = freshId();
      markFresh(`card-${poolId}`);
      const [ry, rm, rd] = repayDate.split("-").map(Number);
      const repayLabel = formatUzDate(new Date(ry, rm - 1, rd));
      const created: PoolRequest = {
        id: poolId,
        borrower: me,
        isMine: true,
        amount,
        collected: 0,
        currency,
        purpose: purpose.slice(0, 40) || "Yangi so'rov",
        description: purpose,
        daysLeft: 30,
        status: "collecting",
        contributors: [],
        invited,
        repayDate: repayLabel,
        repayIso: repayDate,
        schedule,
        repayments:
          schedule === "once"
            ? [{ date: repayLabel, amount, status: "pending" }]
            : [
                { date: repayLabel, amount: Math.round(amount / 2), status: "pending" },
                { date: repayLabel, amount: amount - Math.round(amount / 2), status: "pending" },
              ],
        activity: [{ id: `created-${poolId}`, text: "So'rov yaratildi", time: "Hozir" }],
        minContribute: Math.max(currency === "USD" ? 50 : 50_000, Math.round(amount * 0.05)),
        createdAt: "Hozir",
        cardLast4: last4,
      };
      addPool(created);
      router.push(`/dashboard/pool-qarz/${created.id}`);
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <PageFrame title="Yangi Pool Qarz" subtitle="Do'stlaringizdan birgalikda qarz yig'ing" back="/dashboard/pool-qarz">
      <ol className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? "font-medium text-ink" : "text-ink2"}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-[#C9A84C]" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div className="mt-8 max-w-[560px]">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <label className="text-[14px] text-ink2">
              Summa
              <input
                value={amountRaw}
                onChange={(e) => setAmountRaw(formatAmountInput(e.target.value))}
                inputMode="numeric"
                className="field mt-1.5"
              />
            </label>
            <fieldset>
              <legend className="text-[14px] text-ink2">Valyuta</legend>
              <div className="mt-1.5 flex gap-2">
                {(["UZS", "USD"] as const).map((c) => (
                  <Choice key={c} active={currency === c} onClick={() => setCurrency(c)}>
                    {c === "UZS" ? "so'm" : "USD"}
                  </Choice>
                ))}
              </div>
            </fieldset>
            <label className="text-[14px] text-ink2">
              Maqsad
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={4}
                placeholder="Masalan, tibbiy xarajat uchun..."
                className="field mt-1.5"
              />
            </label>
            <label className="text-[14px] text-ink2">
              Qaytarish sanasi
              <input
                type="date"
                value={repayDate}
                onChange={(e) => setRepayDate(e.target.value)}
                suppressHydrationWarning
                className="field mt-1.5"
              />
            </label>
            <fieldset>
              <legend className="text-[14px] text-ink2">To&apos;lov jadvali</legend>
              <div className="mt-1.5 flex gap-2">
                <Choice active={schedule === "once"} onClick={() => setSchedule("once")}>
                  Bir martalik
                </Choice>
                <Choice active={schedule === "monthly"} onClick={() => setSchedule("monthly")}>
                  Oylik bo&apos;lib
                </Choice>
              </div>
            </fieldset>
          </div>
        )}

        {step === 1 && (
          <div>
            <label className="flex min-h-11 items-center justify-between rounded-[4px] border border-line px-3 py-2.5 text-[14px] text-ink">
              <span>Hammaga yuborish</span>
              <input type="checkbox" checked={sendAll} onChange={(e) => setSendAll(e.target.checked)} />
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ism yoki telefon..."
              className="field mt-3"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {invited.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#F6EFD9] py-0.5 pr-1.5 pl-1 text-[13px] text-[#8A6B2E]"
                >
                  <Avatar initials={f.initials} size="sm" />
                  {f.name.split(" ")[0]}
                  {!sendAll ? (
                    <button type="button" onClick={() => toggleFriend(f.id)} className="text-[#8A6B2E] hover:text-ink">
                      ×
                    </button>
                  ) : null}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-ink2">{invited.length} / 20 tanlandi (min 2)</p>
            {friends.length < 2 ? (
              <p className="mt-2 rounded-[4px] bg-[#FBF3DB] px-3 py-2 text-[13px] text-[#37352F]">
                Pool Qarz uchun kamida 2 ta ro&apos;yxatdan o&apos;tgan foydalanuvchi kerak. Do&apos;stlaringizni Ahd&apos;ga taklif qiling.
              </p>
            ) : null}
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[4px] border border-line">
              {filteredFriends.map((f) => {
                const on = sendAll || selected.includes(f.id);
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => toggleFriend(f.id)}
                      className="flex min-h-12 w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-hov"
                    >
                      <Avatar initials={f.initials} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-medium text-ink">{f.name}</span>
                        <span className="block text-[13px] text-ink2">{f.phone}</span>
                      </span>
                      <span className={`text-[13px] ${on ? "text-ink" : "text-ink2"}`}>
                        {on ? "Tanlangan" : "Qo'shish"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <label className="text-[14px] text-ink2">
              Karta raqami
              <input
                value={cardNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setCardNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
                }}
                className="field mt-1.5 font-mono"
              />
              <span className="mt-1 block text-[13px] text-ink2">Ko&apos;rinishi: **** **** **** {last4}</span>
            </label>
            <label className="text-[14px] text-ink2">
              Karta egasi
              <input
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                className="field mt-1.5"
              />
            </label>
            <label className="text-[14px] text-ink2">
              Amal qilish muddati
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="field mt-1.5 max-w-[140px]"
              />
            </label>
            <div className="rounded-[4px] bg-[#FBF3DB] px-4 py-3 text-[14px] leading-6 text-[#37352F]">
              ⚠️ Belgilangan muddatda qaytarmasangiz, karta orqali avtomatik yechib olinadi
            </div>
            <label className="flex items-start gap-2 text-[14px] text-ink">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1"
              />
              Shartlarga roziman
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-[4px] border border-line p-5">
            <h2 className="text-[16px] font-semibold text-ink">Xulosa</h2>
            <dl className="mt-4">
              <Summary label="Jami">{formatMoney(amount, currency)}</Summary>
              <Summary label="Maqsad">{purpose || "—"}</Summary>
              <Summary label="Qaytarish">{repayDate}</Summary>
              <Summary label="Jadval">{schedule === "once" ? "Bir martalik" : "Oylik bo'lib"}</Summary>
              <Summary label="Karta">**** {last4}</Summary>
              <Summary label="Yuboruvchi">{me.name}</Summary>
            </dl>
            <p className="mt-5 text-[14px] font-medium text-ink">Taklif qilinganlar</p>
            <ul className="mt-2 space-y-1.5 text-[14px] text-ink2">
              {invited.map((f) => (
                <li key={f.id} className="flex items-center gap-2">
                  <Avatar initials={f.initials} size="sm" />
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error ? <p className="mt-4 rounded-[4px] bg-[#FDEBEC] px-3 py-2 text-[14px] text-[#C4554D]">{error}</p> : null}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="h-11 rounded-[4px] px-3 text-[14px] text-ink2 hover:bg-hov disabled:opacity-40 md:h-8"
          >
            Orqaga
          </button>
          <Button type="button" onClick={next}>
            {step === 3 ? "So'rov yuborish" : "Davom etish"}
          </Button>
        </div>
      </div>
    </PageFrame>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-[4px] px-4 text-[14px] md:h-8 md:px-3 ${
        active ? "bg-[#F6EFD9] font-medium text-[#8A6B2E]" : "text-ink2 hover:bg-hov"
      }`}
    >
      {children}
    </button>
  );
}

function Summary({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 text-[14px]">
      <dt className="text-ink2">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
