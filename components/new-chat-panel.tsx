"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Search, Smartphone } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useApp } from "@/components/app-store";
import { EmptyNote, IconButton } from "@/components/chat-ui";
import { freshId, initialsOf } from "@/lib/chat-helpers";
import { nowTime, type Deal, type DealKind } from "@/lib/deals";

type ChatType = DealKind | "pool";

type Contact = { id: string; name: string; sub: string };

/** Picked when the user types a name that is not a registered user (a company, a person without an account). */
const CUSTOM_ID = "custom";

const TYPES: { id: ChatType; emoji: string; title: string; sub: string }[] = [
  { id: "kelishuv", emoji: "🤝", title: "Kelishuv", sub: "Shartnoma tuzish" },
  { id: "qarz", emoji: "💵", title: "Qarz", sub: "Ikki tomonlama" },
  { id: "pool", emoji: "👥", title: "Pool Qarz", sub: "Do'stlar bilan" },
];

export function NewChatPanel() {
  const router = useRouter();
  const { newChat, closeNewChat, addDeal, me, contacts: people } = useApp();
  const open = newChat.open;

  const [type, setType] = useState<ChatType>("kelishuv");
  const [query, setQuery] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [wasOpen, setWasOpen] = useState(false);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setType("kelishuv");
      setQuery(newChat.seed);
      setPickedId(null);
      setTitle("");
      setPhoneOpen(false);
      setPhone("");
    }
  }

  const all = useMemo<Contact[]>(() => people.map((p) => ({ id: p.id, name: p.name, sub: p.phone })), [people]);
  const q = query.trim().toLowerCase();
  const contacts = q
    ? all.filter((c) => c.name.toLowerCase().includes(q) || c.sub.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, "")))
    : all;
  const picked = all.find((c) => c.id === pickedId) ?? null;
  const phoneValid = phone.replace(/\D/g, "").length >= 9;
  const customName = query.trim();
  const customPicked = pickedId === CUSTOM_ID && customName.length > 0;
  const counterparty = phoneValid ? phone.trim() : customPicked ? customName : (picked?.name ?? "");
  const canStart = type === "pool" || counterparty.length > 0;

  function start() {
    if (!canStart) return;
    if (type === "pool") {
      closeNewChat();
      router.push("/dashboard/pool-qarz/create");
      return;
    }
    const id = freshId();
    const label = type === "qarz" ? "Qarz" : "Kelishuv";
    const stamp = nowTime();
    const deal: Deal = {
      id,
      title: title.trim() || `${label} — ${counterparty}`,
      counterparty,
      kind: type,
      status: "discussion",
      updatedAt: `Bugun, ${stamp}`,
      parties: [
        { name: me.name, role: "Tomon A", signedAt: null, userId: me.id },
        // A registered user gets the room too; a company or phone number stays an external party.
        { name: counterparty, role: "Tomon B", signedAt: null, userId: phoneValid || customPicked ? null : (picked?.id ?? null) },
      ],
      messages: [
        {
          id: freshId(),
          author: "Tizim",
          side: "system",
          text: "Deal room ochildi. Shartlarni yozing, keyin AI hujjat tuzadi.",
          time: stamp,
          day: "Bugun",
        },
      ],
      agreement: null,
    };
    addDeal(deal);
    closeNewChat();
    router.push(`/dashboard/deals/${id}`);
  }

  return (
    <div
      inert={!open}
      aria-hidden={!open}
      className={`absolute inset-0 z-30 flex flex-col bg-panel transition-transform duration-200 ${
        open ? "translate-x-0" : "pointer-events-none -translate-x-full"
      }`}
    >
      <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-line px-2">
        <IconButton label="Orqaga" onClick={closeNewChat}>
          <ArrowLeft size={20} />
        </IconButton>
        <h2 className="text-[17px] font-semibold text-ink">Yangi kelishuv</h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 px-3 pt-3">
          {TYPES.map((item) => {
            const active = type === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                aria-pressed={active}
                className={`flex flex-col items-center rounded-[12px] border px-1.5 py-3 text-center ${
                  active ? "border-[#C9A84C] bg-sel" : "border-line hover:bg-hov"
                }`}
              >
                <span className="text-[26px] leading-none" aria-hidden>
                  {item.emoji}
                </span>
                <span className="mt-2 text-[13px] font-semibold text-ink">{item.title}</span>
                <span className="mt-0.5 text-[11px] leading-tight text-ink2">{item.sub}</span>
              </button>
            );
          })}
        </div>

        {type === "pool" ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[32px]" aria-hidden>
              👥
            </p>
            <p className="mt-2 text-[14px] text-ink2">
              Do&apos;stlaringizni keyingi qadamda tanlaysiz: summa, maqsad va kafolat bilan guruh ochiladi.
            </p>
          </div>
        ) : (
          <>
            <div className="px-3 pt-3">
              <label className="block text-[12px] font-medium text-ink2">
                Nomi (ixtiyoriy)
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === "qarz" ? "Masalan, Do'st qarzi" : "Masalan, Ofis ijarasi"}
                  className="field mt-1"
                />
              </label>
            </div>

            <div className="px-3 pt-3">
              <label className="flex h-11 items-center gap-3 rounded-full md:h-[35px] bg-wash px-3.5 focus-within:shadow-[0_0_0_2px_rgba(201,168,76,0.55)]">
                <Search size={15} className="shrink-0 text-ink2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Kontaktlarni qidirish"
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink2"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setPhoneOpen((v) => !v)}
              aria-expanded={phoneOpen}
              className="mt-1 flex h-14 w-full items-center gap-3 px-3 text-left hover:bg-hov"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C9A84C] text-[#111]">
                <Smartphone size={20} />
              </span>
              <span className="text-[14.5px] font-medium text-ink">Telefon raqam orqali taklif</span>
            </button>
            {phoneOpen ? (
              <div className="pill-up px-3 pb-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s()-]/g, ""))}
                  inputMode="tel"
                  placeholder="+998 90 123 45 67"
                  className="field"
                />
                <p className="mt-1 text-[12px] text-ink2">
                  {phoneValid ? "✓ Raqam qabul qilindi" : "Kamida 9 ta raqam kiriting"}
                </p>
              </div>
            ) : null}

            <p className="px-4 pt-3 pb-1 text-[12px] font-medium tracking-[0.04em] text-ink2 uppercase">Kontaktlar</p>
            {contacts.map((c) => {
              const on = pickedId === c.id && !phoneValid;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setPickedId(on ? null : c.id);
                    setPhone("");
                  }}
                  className="flex h-14 w-full items-center gap-3 px-3 text-left hover:bg-hov"
                >
                  <Avatar initials={initialsOf(c.name)} size="xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">{c.name}</span>
                    <span className="block truncate text-[13px] text-ink2">{c.sub}</span>
                  </span>
                  {on ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-btn text-btnink">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              );
            })}
            {q ? (
              <button
                type="button"
                onClick={() => {
                  setPickedId(customPicked ? null : CUSTOM_ID);
                  setPhone("");
                }}
                className="flex h-14 w-full items-center gap-3 px-3 text-left hover:bg-hov"
              >
                <Avatar initials={initialsOf(customName)} size="xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">&ldquo;{customName}&rdquo;</span>
                  <span className="block truncate text-[13px] text-ink2">Kompaniya yoki akkauntsiz shaxs sifatida qo&apos;shish</span>
                </span>
                {customPicked && !phoneValid ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-btn text-btnink">
                    <Check size={14} strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            ) : null}
            {all.length === 0 && !q ? (
              <EmptyNote emoji="👋">Hali boshqa foydalanuvchi yo&apos;q. Nom yozing yoki telefon raqam bilan taklif qiling.</EmptyNote>
            ) : null}
            {all.length > 0 && contacts.length === 0 && !q ? <EmptyNote emoji="🔎">Kontakt topilmadi.</EmptyNote> : null}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-line p-3">
        {type !== "pool" && counterparty ? (
          <p className="mb-2 truncate text-center text-[12.5px] text-ink2">
            Qarshi tomon: <span className="font-semibold text-ink">{counterparty}</span>
          </p>
        ) : null}
        <button
          type="button"
          onClick={start}
          disabled={!canStart}
          className="h-11 w-full rounded-full bg-btn text-[14px] font-semibold text-btnink hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Boshlash
        </button>
      </div>
    </div>
  );
}
