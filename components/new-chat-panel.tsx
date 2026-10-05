"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Search } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useApp } from "@/components/app-store";
import { EmptyNote, IconButton } from "@/components/chat-ui";
import { freshId, initialsOf } from "@/lib/chat-helpers";
import { nowTime, type Deal, type DealKind, type InitiatorRole } from "@/lib/deals";
import { COUNTERPART_ROLE, ROLE_LABEL, isRoleForKind, rolesForKind } from "@/lib/roles";

type ChatType = DealKind | "pool";
type Step = "type" | "role" | "invite";

const TYPES: { id: ChatType; emoji: string; title: string; sub: string }[] = [
  { id: "kelishuv", emoji: "🤝", title: "Kelishuv", sub: "Shartnoma tuzish" },
  { id: "qarz", emoji: "💵", title: "Qarz", sub: "Ikki tomonlama" },
  { id: "pool", emoji: "👥", title: "Pool Qarz", sub: "Do'stlar bilan" },
];

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewChatPanel() {
  const router = useRouter();
  const { newChat, closeNewChat, addDeal, me, email: myEmail, contacts: people } = useApp();
  const open = newChat.open;

  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<ChatType>("kelishuv");
  const [role, setRole] = useState<InitiatorRole | null>(null);
  const [title, setTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("type");
      setType("kelishuv");
      setRole(null);
      setTitle("");
      setInviteEmail(newChat.seed.includes("@") ? newChat.seed : "");
      setPickedId(null);
      setQuery(newChat.seed.includes("@") ? "" : newChat.seed);
      setBusy(false);
    }
  }

  const dealKind: DealKind = type === "qarz" ? "qarz" : "kelishuv";
  const roles = type === "pool" ? [] : rolesForKind(dealKind);
  const theirRole = role ? COUNTERPART_ROLE[role] : null;

  const q = query.trim().toLowerCase();
  const contacts = useMemo(() => {
    const list = people.filter((p) => p.email && p.email.toLowerCase() !== myEmail.toLowerCase());
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        c.phone.toLowerCase().replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [people, q, myEmail]);

  const picked = people.find((c) => c.id === pickedId) ?? null;
  const email = (picked?.email || inviteEmail).trim().toLowerCase();
  const emailValid = EMAIL_OK.test(email) && email !== myEmail.toLowerCase();

  function pickType(id: ChatType) {
    setType(id);
    setRole(null);
  }

  function goNextFromType() {
    if (type === "pool") {
      closeNewChat();
      router.push("/dashboard/pool-qarz/create");
      return;
    }
    setStep("role");
  }

  function goNextFromRole() {
    if (!role || !isRoleForKind(dealKind, role)) return;
    setStep("invite");
  }

  function sendInvite() {
    if (!emailValid || !role || type === "pool" || busy) return;
    setBusy(true);
    const id = freshId();
    const stamp = nowTime();
    const label = type === "qarz" ? "Qarz" : "Kelishuv";
    const otherName = picked?.name || email;
    const deal: Deal = {
      id,
      title: title.trim() || `${label} — ${otherName}`,
      counterparty: otherName,
      kind: type,
      status: "pending",
      updatedAt: `Bugun, ${stamp}`,
      createdBy: me.id,
      initiatorRole: role,
      parties: [{ name: me.name, role: ROLE_LABEL[role], signedAt: null, userId: me.id }],
      messages: [
        {
          id: freshId(),
          author: "Tizim",
          side: "system",
          text: `${otherName} (${email}) ga taklif yuborildi. Qabul qilingach chat ochiladi.`,
          time: stamp,
          day: "Bugun",
        },
      ],
      agreement: null,
      invitation: {
        id: freshId(),
        email,
        userId: picked?.id ?? null,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
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
        <IconButton
          label="Orqaga"
          onClick={() => {
            if (step === "invite") setStep("role");
            else if (step === "role") setStep("type");
            else closeNewChat();
          }}
        >
          <ArrowLeft size={20} />
        </IconButton>
        <h2 className="text-[17px] font-semibold text-ink">
          {step === "type" ? "Yangi kelishuv" : step === "role" ? "Rolingiz" : "Ikkinchi tomonni taklif qiling"}
        </h2>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {step === "type" ? (
          <div className="grid grid-cols-3 gap-2 px-3 pt-3">
            {TYPES.map((item) => {
              const active = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pickType(item.id)}
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
        ) : null}

        {step === "type" && type === "pool" ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[32px]" aria-hidden>
              👥
            </p>
            <p className="mt-2 text-[14px] text-ink2">
              Do&apos;stlaringizni keyingi qadamda tanlaysiz: summa, maqsad va kafolat bilan guruh ochiladi.
            </p>
          </div>
        ) : null}

        {step === "role" ? (
          <div className="flex flex-col gap-3 px-3 pt-4">
            {roles.map((item) => {
              const active = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  aria-pressed={active}
                  className={`flex min-h-[88px] items-center gap-4 rounded-[12px] border px-4 py-4 text-left ${
                    active ? "border-[#111] bg-white shadow-[0_0_0_1px_#111]" : "border-line hover:bg-hov"
                  }`}
                >
                  <span className="text-[32px] leading-none" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold text-ink">{item.title}</span>
                    <span className="mt-0.5 block text-[13px] text-ink2">{item.sub}</span>
                  </span>
                  {active ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111] text-white">
                      <Check size={16} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-7 w-7 rounded-full border border-line" />
                  )}
                </button>
              );
            })}
          </div>
        ) : null}

        {step === "invite" && theirRole ? (
          <div className="px-3 pt-4">
            <p className="rounded-[10px] bg-wash px-3 py-2.5 text-[13.5px] text-ink2">
              Siz: <span className="font-semibold text-ink">{ROLE_LABEL[role!]}</span>
              {" · "}
              Ular: <span className="font-semibold text-ink">{ROLE_LABEL[theirRole]}</span>
            </p>
            <label className="mt-4 block text-[12px] font-medium text-ink2">
              Nomi (ixtiyoriy)
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === "qarz" ? "Masalan, Do'st qarzi" : "Masalan, Ofis ijarasi"}
                className="field mt-1"
              />
            </label>
            <label className="mt-3 block text-[12px] font-medium text-ink2">
              Email
              <input
                type="email"
                value={picked ? picked.email ?? inviteEmail : inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setPickedId(null);
                }}
                placeholder="ism@pochta.uz"
                className="field mt-1"
                autoComplete="email"
              />
            </label>
            {email && email === myEmail.toLowerCase() ? (
              <p className="mt-1 text-[12.5px] text-[#C4554D]">O&apos;zingizni taklif qila olmaysiz.</p>
            ) : null}

            <div className="mt-4">
              <label className="flex h-11 items-center gap-3 rounded-full bg-wash px-3.5 md:h-[35px] focus-within:shadow-[0_0_0_2px_rgba(201,168,76,0.55)]">
                <Search size={15} className="shrink-0 text-ink2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Kontaktlarni qidirish"
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink2"
                />
              </label>
            </div>
            <p className="px-1 pt-3 pb-1 text-[12px] font-medium tracking-[0.04em] text-ink2 uppercase">Kontaktlar</p>
            {contacts.map((c) => {
              const on = pickedId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setPickedId(on ? null : c.id);
                    setInviteEmail(on ? "" : (c.email ?? ""));
                  }}
                  className="flex h-14 w-full items-center gap-3 px-1 text-left hover:bg-hov"
                >
                  <Avatar initials={initialsOf(c.name)} size="xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">{c.name}</span>
                    <span className="block truncate text-[13px] text-ink2">{c.email}</span>
                  </span>
                  {on ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-btn text-btnink">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              );
            })}
            {contacts.length === 0 ? (
              <EmptyNote emoji="✉️">Email yozing yoki ro&apos;yxatdagi foydalanuvchini tanlang.</EmptyNote>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-line p-3">
        {step === "type" ? (
          <button
            type="button"
            onClick={goNextFromType}
            className="h-11 w-full rounded-full bg-btn text-[14px] font-semibold text-btnink hover:opacity-85"
          >
            Davom etish
          </button>
        ) : null}
        {step === "role" ? (
          <button
            type="button"
            onClick={goNextFromRole}
            disabled={!role}
            className="h-11 w-full rounded-full bg-btn text-[14px] font-semibold text-btnink hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Davom etish
          </button>
        ) : null}
        {step === "invite" ? (
          <button
            type="button"
            onClick={sendInvite}
            disabled={!emailValid || busy}
            className="h-11 w-full rounded-full bg-[#111] text-[14px] font-semibold text-white hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Taklif yuborish
          </button>
        ) : null}
      </div>
    </div>
  );
}
