"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Archive, Download, FileText, Paperclip, Sparkles, Users } from "lucide-react";
import { AgreementPaper } from "@/components/agreement-paper";
import { useApp } from "@/components/app-store";
import { MediatorTip, MediatorTyping, type MediatorTipData } from "@/components/ai-mediator";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { AgreementCard, SignatureCard } from "@/components/chat-cards";
import {
  Bubble,
  ChatHeader,
  ChatInputBar,
  DateDivider,
  EmptyNote,
  IconButton,
  InfoDrawer,
  MenuButton,
  RolePills,
  SystemMessage,
  TypingBubble,
  type PillItem,
} from "@/components/chat-ui";
import { DealGate } from "@/components/deal-invite";
import { KindBadge } from "@/components/kind-badge";
import { StatusBadge } from "@/components/status-badge";
import { formatFileSize, freshId, initialsOf, nameColor } from "@/lib/chat-helpers";
import { buildAgreementFromAiText } from "@/lib/agreement-text";
import { downloadAgreementPdf } from "@/lib/export-agreement-pdf";
import {
  STATUS_LABEL,
  formatUzDate,
  isDealActive,
  nowTime,
  type ChatMessage,
} from "@/lib/deals";
import { dealRolePills, labeledParties, partyRole, roleForAuthor } from "@/lib/roles";

type Busy = null | "generate" | "analyze";

function realLastId(messages: ChatMessage[]) {
  return [...messages].reverse().find((m) => m.side !== "system" && !m.kind)?.id ?? null;
}

export default function DealChatPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { me, deals, hydrated, updateDeal, markRead, archived, toggleArchive, respondToInvite, resendInvite } = useApp();
  const deal = deals.find((d) => d.id === id) ?? null;

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [drawer, setDrawer] = useState<"doc" | "people" | null>(null);
  const [notice, setNotice] = useState("");
  const [genError, setGenError] = useState("");
  // AI Mediator: live-session tips only — kept out of deal.messages so they are never saved or counted.
  const [tips, setTips] = useState<(MediatorTipData & { dealId: string })[]>([]);
  const [mediating, setMediating] = useState<string | null>(null);
  const mediatingRef = useRef(false);
  const shownTips = useRef<Record<string, string[]>>({});
  const lastRealCount = useRef<{ id: string; count: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstScroll = useRef(true);

  useEffect(() => {
    markRead(id);
  }, [id, markRead]);

  const messageCount = deal?.messages.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: firstScroll.current ? "auto" : "smooth", block: "end" });
    firstScroll.current = false;
  }, [messageCount, busy, tips.length, mediating]);

  // Real chat messages only: people's text — no system notices, cards or AI replies.
  const realMessages = useMemo(
    () => deal?.messages.filter((m) => m.side !== "system" && !m.kind) ?? [],
    [deal],
  );
  const realCount = realMessages.length;
  const dealId = deal?.id ?? null;
  const dealStatus = deal?.status;

  // After every 3rd people-message (3, 6, 9 …) sent while this chat is open.
  useEffect(() => {
    if (!dealId) return;
    const prev = lastRealCount.current;
    lastRealCount.current = { id: dealId, count: realCount };
    // Opening a chat only records the current count so a reload does not fire immediately.
    if (!prev || prev.id !== dealId) {
      console.log("[ai-mediator] baseline", { dealId, realCount, status: dealStatus });
      return;
    }
    const crossed = Math.floor(realCount / 3) > Math.floor(prev.count / 3);
    if (!crossed || mediatingRef.current || !isDealActive(dealStatus ?? "pending")) {
      if (crossed) {
        console.warn("[ai-mediator] skipped", {
          realCount,
          prev: prev.count,
          mediating: mediatingRef.current,
          status: dealStatus,
        });
      }
      return;
    }

    console.log("[ai-mediator] calling /api/ai-mediator", { dealId, realCount });
    mediatingRef.current = true;
    const chat = realMessages.map((m) => ({ author: m.author, text: m.text, time: m.time }));
    const afterId = realMessages[realMessages.length - 1]?.id ?? null;
    const previousTips = shownTips.current[dealId] ?? [];
    queueMicrotask(() => setMediating(dealId));

    void (async () => {
      try {
        const response = await fetch("/api/ai-mediator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chat, previousTips }),
        });
        const data = (await response.json().catch(() => null)) as { suggestion?: string | null; error?: string } | null;
        console.log("[ai-mediator] response", response.status, data);
        if (!response.ok) throw new Error(data?.error ?? `HTTP ${response.status}`);
        const text = data?.suggestion?.trim();
        if (text) {
          shownTips.current[dealId] = [...previousTips, text];
          setTips((all) => [...all, { id: freshId(), dealId, afterId, text }]);
        } else {
          console.log("[ai-mediator] model said complete — no bubble");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "AI tavsiyasini olib bo'lmadi.";
        console.error("[ai-mediator]", message, error);
        flash(message);
      } finally {
        mediatingRef.current = false;
        setMediating(null);
      }
    })();
  }, [dealId, realCount, realMessages, dealStatus]);

  const canGenerate = useMemo(
    () => Boolean(deal?.messages.some((m) => m.side !== "system" && !m.kind)),
    [deal],
  );

  function flash(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function push(...messages: ChatMessage[]) {
    const stamp = `Bugun, ${nowTime()}`;
    updateDeal(id, (d) => ({ ...d, messages: [...d.messages, ...messages], updatedAt: stamp }), true);
  }

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!deal || !text) return;
    push({ id: freshId(), author: me.name, side: "me", text, time: nowTime(), day: "Bugun" });
    setDraft("");
    setPlusOpen(false);
    inputRef.current?.focus();
  }

  /** `regen`: replace the existing agreement in place — the panel is neither closed nor force-opened. */
  async function generate(regen = false) {
    if (!deal || busy || !canGenerate) return;
    setBusy("generate");
    setPlusOpen(false);
    setGenError("");
    if (!regen) setDrawer(null);

    try {
      // Everything the parties wrote (no system notices or cards) goes to Claude.
      const chat = deal.messages
        .filter((m) => m.side !== "system" && !m.kind && m.text.trim())
        .map((m) => ({ author: m.author, text: m.text, time: m.time }));
      const response = await fetch("/api/generate-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chat,
          title: deal.title,
          parties: labeledParties(deal).map((p) => ({ name: p.name, role: p.role.label })),
        }),
      });
      const data = (await response.json().catch(() => null)) as { agreement?: string; error?: string } | null;
      if (!response.ok || !data?.agreement) {
        throw new Error(data?.error ?? `Server xatosi (${response.status}).`);
      }
      const text = data.agreement;

      const sysId = freshId();
      const agreementId = freshId();
      const signatureId = freshId();
      const time = nowTime();
      // updateDeal also writes the agreement (clauses) and the new messages to Supabase.
      updateDeal(
        id,
        (d) => {
          const agreement = buildAgreementFromAiText(d, text);
          const base = d.messages.filter((m) => m.kind !== "agreement" && m.kind !== "signature");
          const added: ChatMessage[] = [
            { id: sysId, author: "Tizim", side: "system", text: "AI kelishuv qoralamasi tayyor.", time, day: "Bugun" },
            { id: agreementId, author: "Ahd AI", side: "them", kind: "agreement", text: "", time, day: "Bugun" },
            { id: signatureId, author: "Ahd AI", side: "them", kind: "signature", text: "", time, day: "Bugun" },
          ];
          return {
            ...d,
            agreement,
            parties: agreement.parties,
            status: "signing",
            messages: [...base, ...added],
            updatedAt: `Bugun, ${time}`,
          };
        },
        true,
      );
      if (!regen) setDrawer("doc");
    } catch (error) {
      // The previous agreement stays untouched when generation fails.
      const message = error instanceof Error ? error.message : "Kelishuvni yaratib bo'lmadi.";
      setGenError(message);
      flash(message);
    } finally {
      setBusy(null);
    }
  }

  function dismissTip(tipId: string) {
    setTips((all) => all.filter((tip) => tip.id !== tipId));
  }

  function regenerate() {
    if (!deal?.agreement || busy) return;
    const signed = deal.agreement.parties.some((p) => p.signedAt);
    if (signed && !window.confirm("Yangi kelishuv yaratilsa, qo'yilgan imzolar o'chiriladi. Davom etasizmi?")) return;
    void generate(true);
  }

  function analyze() {
    if (!deal || busy) return;
    setPlusOpen(false);
    setBusy("analyze");
    const facts = deal.messages
      .filter((m) => m.side !== "system" && !m.kind && /\d/.test(m.text))
      .slice(-5)
      .map((m) => `• ${m.text.length > 120 ? `${m.text.slice(0, 117)}…` : m.text}`);
    const text = facts.length
      ? `Aniqlangan shartlar:\n${facts.join("\n")}\n\nHujjatni tayyorlash uchun «Kelishuv yaratish»ni bosing.`
      : "Hozircha summa yoki muddat topilmadi. Chatda raqamli shartlarni yozing.";
    window.setTimeout(() => {
      push({ id: freshId(), author: "Ahd AI", side: "them", kind: "ai", text, time: nowTime(), day: "Bugun" });
      setBusy(null);
    }, 600);
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPlusOpen(false);
    push({
      id: freshId(),
      author: me.name,
      side: "me",
      kind: "file",
      text: `${file.name} (${formatFileSize(file.size)})`,
      time: nowTime(),
      day: "Bugun",
    });
  }

  function sign(partyName: string) {
    const target = deal?.agreement?.parties.find((p) => p.name === partyName && !p.signedAt);
    if (!target) return;
    // You can only sign for yourself; parties without an Ahd account are signed by a member of the room.
    if (target.userId && target.userId !== me.id) {
      flash(`Bu imzoni faqat ${target.name} qo'ya oladi.`);
      return;
    }
    const sysId = freshId();
    const dated = formatUzDate();
    const time = nowTime();
    updateDeal(
      id,
      (d) => {
        const agreement = d.agreement;
        if (!agreement) return d;
        const parties = agreement.parties.map((p) =>
          p.name === partyName && !p.signedAt ? { ...p, signedAt: dated } : p,
        );
        if (parties.every((p, i) => p.signedAt === agreement.parties[i].signedAt)) return d;
        const allSigned = parties.every((p) => p.signedAt);
        const system: ChatMessage = {
          id: sysId,
          author: "Tizim",
          side: "system",
          text: allSigned ? "Barcha tomonlar imzoladi ✅ Kelishuv yakunlandi." : `${partyName} imzoladi ✍️`,
          time,
          day: "Bugun",
        };
        return {
          ...d,
          parties,
          agreement: { ...agreement, parties },
          status: allSigned ? "completed" : "signing",
          messages: [...d.messages, system],
          updatedAt: `Bugun, ${time}`,
        };
      },
      true,
    );
  }

  function signNext() {
    const parties = deal?.agreement?.parties ?? [];
    const next = parties.find((p) => !p.signedAt && (!p.userId || p.userId === me.id));
    if (next) sign(next.name);
    else {
      const waiting = parties.find((p) => !p.signedAt);
      if (waiting) flash(`Keyingi imzo: ${waiting.name}.`);
    }
  }

  if (!hydrated && !deal) {
    return (
      <div className="chat-bg flex-1 space-y-3 p-6">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-16 w-80" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="chat-bg flex flex-1 flex-col items-center justify-center">
        <EmptyNote emoji="🔎">Suhbat topilmadi.</EmptyNote>
        <Link href="/dashboard" className="-mt-8 text-[14px] font-medium text-ink underline">
          Ro&apos;yxatga qaytish
        </Link>
      </div>
    );
  }

  const isArchived = archived.includes(deal.id);
  const kind = deal.kind ?? "kelishuv";
  const chatOpen = isDealActive(deal.status) && !deal.incomingInvite;

  if (!chatOpen) {
    return (
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          back="/dashboard"
          avatar={<Avatar initials={initialsOf(deal.counterparty)} size="hd" />}
          title={deal.title}
          subtitle={deal.counterparty}
          extra={<RolePills items={dealRolePills(deal, me.id, me.name)} />}
          center={<KindBadge kind={kind} />}
          actions={null}
        />
        <DealGate
          deal={deal}
          meName={me.name}
          onAccept={() => (deal.invitation ? respondToInvite(deal.invitation.id, true) : Promise.resolve())}
          onReject={() => (deal.invitation ? respondToInvite(deal.invitation.id, false) : Promise.resolve())}
          onResend={(email) => resendInvite(deal.id, email)}
        />
      </div>
    );
  }

  const plusItems: PillItem[] = [
    { label: "📄 Kelishuv yaratish", onClick: () => void generate(), disabled: !canGenerate || busy !== null },
    { label: "💰 Qarz so'rash", onClick: () => router.push("/dashboard/pool-qarz/create") },
    { label: "🤖 AI tahlil", onClick: analyze, disabled: busy !== null },
    { label: "📎 Fayl yuborish", onClick: () => fileRef.current?.click() },
  ];
  const quick: PillItem[] | undefined =
    !deal.agreement && canGenerate && !busy
      ? [{ label: "📄 Kelishuv yaratish", onClick: () => void generate() }]
      : undefined;

  // Tips whose anchor message no longer exists are shown at the end instead of vanishing.
  const messageIds = new Set(deal.messages.map((m) => m.id));
  const dealTips = tips
    .filter((tip) => tip.dealId === deal.id)
    .map((tip) => (tip.afterId && messageIds.has(tip.afterId) ? tip : { ...tip, afterId: realLastId(deal.messages) }));

  const items = deal.messages.map((message, index, all) => {
    const day = message.day ?? "Bugun";
    const prev = all[index - 1];
    return { message, day, showDay: !prev || (prev.day ?? "Bugun") !== day };
  });

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ChatHeader
        back="/dashboard"
        avatar={<Avatar initials={initialsOf(deal.counterparty)} size="hd" />}
        title={deal.title}
        subtitle={
          <>
            {deal.counterparty}
            <span className="lg:hidden">
              {" · "}
              <KindBadge kind={kind} size="sm" /> · {STATUS_LABEL[deal.status]}
            </span>
          </>
        }
        extra={<RolePills items={dealRolePills(deal, me.id, me.name)} />}
        center={
          <>
            <KindBadge kind={kind} />
            <StatusBadge status={deal.status} />
          </>
        }
        actions={
          <>
            <IconButton label="Hujjatni ko'rish" onClick={() => setDrawer("doc")}>
              <FileText size={20} />
            </IconButton>
            <IconButton label="Ishtirokchilar" onClick={() => setDrawer("people")}>
              <Users size={20} />
            </IconButton>
            <MenuButton
              items={[
                {
                  label: "PDF yuklash",
                  icon: <Download size={16} />,
                  disabled: !deal.agreement,
                  onClick: () => deal.agreement && void downloadAgreementPdf(deal.agreement, deal),
                },
                {
                  label: "AI kelishuv yaratish",
                  icon: <Sparkles size={16} />,
                  disabled: !canGenerate || busy !== null,
                  onClick: () => void generate(),
                },
                {
                  label: isArchived ? "Arxivdan chiqarish" : "Arxivlash",
                  icon: <Archive size={16} />,
                  onClick: () => {
                    toggleArchive(deal.id);
                    flash(isArchived ? "Arxivdan chiqarildi." : "Arxivga ko'chirildi.");
                  },
                },
              ]}
            />
          </>
        }
      />

      <div className="chat-bg min-h-0 flex-1 overflow-y-auto px-3 py-3 md:px-6">
        <div className="flex w-full flex-col gap-1.5">
          {items.map(({ message, day, showDay }) => (
            <div key={message.id} className="contents">
              {showDay ? <DateDivider label={day} /> : null}
              {renderMessage(message)}
              {dealTips
                .filter((tip) => tip.afterId === message.id)
                .map((tip) => (
                  <MediatorTip
                    key={tip.id}
                    tip={tip}
                    onDiscuss={() => {
                      dismissTip(tip.id);
                      inputRef.current?.focus();
                    }}
                    onIgnore={() => dismissTip(tip.id)}
                  />
                ))}
            </div>
          ))}
          {mediating === deal.id ? <MediatorTyping /> : null}
          {busy ? (
            <TypingBubble label={busy === "generate" ? "Kelishuv tayyorlanmoqda…" : "Tahlil qilinmoqda…"} />
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
      <ChatInputBar
        value={draft}
        onChange={setDraft}
        onSubmit={send}
        placeholder="Xabar yozing..."
        inputRef={inputRef}
        notice={notice}
        plus={{ open: plusOpen, onToggle: () => setPlusOpen((v) => !v), items: plusItems }}
        quick={quick}
      />

      <InfoDrawer open={drawer === "doc"} title="Hujjat" onClose={() => setDrawer(null)}>
        {deal.agreement ? (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <StatusBadge status={deal.status} />
              <Button variant="secondary" onClick={() => void downloadAgreementPdf(deal.agreement!, deal)} disabled={busy === "generate"}>
                <Download size={14} className="mr-1.5" />
                PDF yuklash
              </Button>
            </div>
            {busy === "generate" ? (
              <div role="status" aria-live="polite" className="rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                <p className="text-[14px] font-medium text-[#8A6B2E]">🤖 Kelishuv qayta yaratilmoqda…</p>
                <div className="mt-4 space-y-3">
                  <div className="skeleton h-7 w-2/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-11/12" />
                  <div className="skeleton h-4 w-4/5" />
                  <div className="skeleton mt-6 h-5 w-1/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              </div>
            ) : (
              <div data-theme="light" className="rounded-[10px] bg-white p-5 text-[#111] shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                <AgreementPaper agreement={deal.agreement} deal={deal} status={deal.status} onSign={sign} />
              </div>
            )}
            {genError && busy !== "generate" ? (
              <p role="alert" className="mt-3 rounded-[6px] bg-[#FDEBEC] px-3 py-2 text-[13px] text-[#C4554D]">
                {genError}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <p className="text-[32px]" aria-hidden>
              📄
            </p>
            <p className="mt-3 text-[16px] font-medium text-ink">Kelishuv yaratilmagan</p>
            <p className="mt-1 max-w-xs text-[14px] text-ink2">
              Chatda shartlarni yozing, so&apos;ng hujjatni AI orqali tuzing.
            </p>
            <Button
              variant="primary"
              className="mt-5"
              disabled={!canGenerate || busy !== null}
              onClick={() => {
                setDrawer(null);
                void generate();
              }}
            >
              AI kelishuv yaratish
            </Button>
          </div>
        )}
      </InfoDrawer>

      <InfoDrawer open={drawer === "people"} title="Ishtirokchilar" onClose={() => setDrawer(null)}>
        <ul className="py-2">
          {deal.parties.map((party, index) => {
            const role = partyRole(deal, party, index);
            return (
              <li key={`${party.role}-${party.name}`} className="flex min-h-12 items-center gap-3 px-4 py-2">
                <Avatar initials={initialsOf(party.name)} size="xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">{party.name}</span>
                  <span className="block text-[13px] text-ink2">
                    {role.emoji ? `${role.emoji} ` : ""}
                    {role.label}
                  </span>
                </span>
                {party.signedAt ? (
                  <span className="text-[12.5px] font-medium text-[#2E9E5B]">✓ {party.signedAt}</span>
                ) : (
                  <span className="rounded-full bg-[#F6EFD9] px-2 py-0.5 text-[12px] font-medium text-[#8A6B2E]">
                    Kutilmoqda
                  </span>
                )}
              </li>
            );
          })}
          <li className="flex min-h-12 items-center gap-3 px-4 py-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F6EFD9] text-[22px]">🤖</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-ink">Ahd AI</span>
              <span className="block text-[13px] text-ink2">Yordamchi</span>
            </span>
          </li>
        </ul>
      </InfoDrawer>
    </div>
  );

  function renderMessage(message: ChatMessage) {
    if (!deal) return null;
    if (message.side === "system") return <SystemMessage id={message.id} text={message.text} />;
    if (message.kind === "agreement") {
      return (
        <AgreementCard
          id={message.id}
          deal={deal}
          time={message.time}
          onView={() => setDrawer("doc")}
          onSign={signNext}
          onRegenerate={regenerate}
          regenerating={busy === "generate"}
        />
      );
    }
    if (message.kind === "signature") {
      return <SignatureCard id={message.id} deal={deal} time={message.time} onSign={signNext} />;
    }
    const side = message.side === "me" ? "me" : "them";
    const role = message.kind === "ai" ? undefined : roleForAuthor(deal, message.author)?.label;
    if (message.kind === "file") {
      return (
        <Bubble id={message.id} side={side} name={message.author} nameColor={nameColor(message.author)} role={role} time={message.time}>
          <div className="flex items-center gap-2.5 py-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-white/15 text-[#C9A84C]">
              <Paperclip size={18} />
            </span>
            <span className="min-w-0 break-anywhere text-[14px]">{message.text}</span>
          </div>
        </Bubble>
      );
    }
    return (
      <Bubble
        id={message.id}
        side={side}
        name={message.author}
        nameColor={message.kind === "ai" ? "#8A6B2E" : nameColor(message.author)}
        role={role}
        time={message.time}
      >
        <p className="text-[14.5px] leading-[1.4] break-anywhere whitespace-pre-wrap">
          {message.kind === "ai" ? "🤖 " : ""}
          {message.text}
        </p>
      </Bubble>
    );
  }
}
