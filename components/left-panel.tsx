"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCheck, FileText, Paperclip, PenLine, Search, Settings, SquarePen, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { useApp, type ListTab } from "@/components/app-store";
import { EmptyNote, IconButton } from "@/components/chat-ui";
import { InviteActions } from "@/components/deal-invite";
import { ConfirmSheet } from "@/components/sheet";
import { SwipeRow } from "@/components/swipe-row";
import { RatingBadge } from "@/components/deal-close";
import { KindBadge, type ChatKind } from "@/components/kind-badge";
import { Logo } from "@/components/logo";
import { NewChatPanel } from "@/components/new-chat-panel";
import { initialsOf, listTime } from "@/lib/chat-helpers";
import type { Deal } from "@/lib/deals";

type Row = {
  id: string;
  kind: "deal" | "invite";
  /** Chat type shown as a chip: Kelishuv or Qarz. */
  chatKind: ChatKind;
  href: string;
  avatar: ReactNode;
  name: string;
  time: string;
  preview: ReactNode;
  unread: number;
  hay: string;
  pending?: boolean;
  rejected?: boolean;
  inviteDeal?: Deal;
  rating?: number | null;
  canDelete?: boolean;
  archived?: boolean;
};

type NavItem =
  | { type: "tab"; id: ListTab; label: string }
  | { type: "link"; id: "contacts"; label: string; href: string };

const NAV: NavItem[] = [
  { type: "tab", id: "deals", label: "Kelishuvlar" },
  { type: "link", id: "contacts", label: "Kontaktlar", href: "/dashboard/contacts" },
  { type: "tab", id: "archive", label: "Arxiv" },
];

const tabClass = (on: boolean) =>
  `relative inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-medium before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] ${
    on ? "bg-btn text-btnink" : "bg-wash text-ink2 hover:text-ink"
  }`;

function Preview({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

function dealPreview(deal: Deal): ReactNode {
  if (deal.incomingInvite) {
    return <Preview>📨 Taklif — qabul qiling yoki rad eting</Preview>;
  }
  if (deal.status === "pending") {
    return (
      <Preview>
        <span className="text-[#8A6B2E]">⏳ Javob kutilmoqda</span>
      </Preview>
    );
  }
  if (deal.status === "rejected") {
    return (
      <Preview>
        <span className="text-[#C4554D]">Taklif rad etildi</span>
      </Preview>
    );
  }
  const last = deal.messages[deal.messages.length - 1];
  if (deal.status === "disputed") {
    return (
      <Preview>
        <span className="text-[#C4554D]">⚠️ Mojaro</span>
      </Preview>
    );
  }
  if (deal.status === "completed") {
    return (
      <Preview icon={<CheckCheck size={16} className="text-[#2E9E5B]" />}>
        <span className="text-[#2E9E5B]">Yakunlangan</span>
      </Preview>
    );
  }
  if (deal.status === "signing") {
    return (
      <Preview icon={<PenLine size={14} className="text-[#C9A84C]" />}>Imzolash kutilmoqda</Preview>
    );
  }
  if (!last) return <Preview icon={<FileText size={14} />}>Qoralama</Preview>;
  if (last.kind === "agreement") return <Preview icon={<FileText size={14} />}>Kelishuv tayyorlandi</Preview>;
  if (last.kind === "file") return <Preview icon={<Paperclip size={14} />}>{last.text}</Preview>;
  if (last.side === "me") {
    return <Preview icon={<CheckCheck size={16} className="text-[#C9A84C]" />}>{last.text}</Preview>;
  }
  return <Preview>{last.text}</Preview>;
}

export function LeftPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const { me, deals, contacts, unread, archived, openNewChat, listTab: tab, setListTab: setTab, incomingInvites, respondToInvite, toggleArchive, deleteDeal } = useApp();
  const onContacts = pathname.startsWith("/dashboard/contacts");
  const [query, setQuery] = useState("");
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: string; text: string; undo?: () => void } | null>(null);
  const toastTimer = useRef<number>(0);

  useEffect(() => {
    if (!swipeId) return;
    const close = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[data-swipe-row="${swipeId}"]`)) return;
      setSwipeId(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [swipeId]);

  function flashToast(next: { id: string; text: string; undo?: () => void }) {
    window.clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }

  function runLeave(id: string, after: () => void) {
    setSwipeId(null);
    setLeaving(id);
    window.setTimeout(() => {
      after();
      setLeaving((current) => (current === id ? null : current));
    }, 280);
  }

  const rows = useMemo<Row[]>(() => {
    const dealRows: Row[] = deals
      .filter((deal) => !deal.incomingInvite)
      .map((deal) => {
        const otherId = deal.parties.find((p) => p.userId && p.userId !== me.id)?.userId;
        return {
          id: deal.id,
          kind: "deal" as const,
          chatKind: deal.kind ?? "kelishuv",
          href: `/dashboard/deals/${deal.id}`,
          avatar: <Avatar initials={initialsOf(deal.counterparty)} size="xl" />,
          name: deal.title,
          time: listTime(deal.updatedAt),
          preview: dealPreview(deal),
          unread: unread[deal.id] ?? 0,
          hay: `${deal.title} ${deal.counterparty}`.toLowerCase(),
          pending: deal.status === "pending",
          rejected: deal.status === "rejected",
          rating: otherId ? contacts.find((c) => c.id === otherId)?.avgRating ?? null : null,
          canDelete: deal.createdBy === me.id,
          archived: Boolean(deal.archived),
        };
      });
    const inviteRows: Row[] = incomingInvites.map((deal) => ({
      id: deal.id,
      kind: "invite",
      chatKind: deal.kind ?? "kelishuv",
      href: `/dashboard/deals/${deal.id}`,
      avatar: <Avatar initials={initialsOf(deal.parties[0]?.name || deal.counterparty)} size="xl" />,
      name: deal.parties.find((p) => p.userId === deal.createdBy)?.name || deal.title,
      time: listTime(deal.updatedAt),
      preview: dealPreview(deal),
      unread: 0,
      hay: `${deal.title} ${deal.counterparty}`.toLowerCase(),
      inviteDeal: deal,
    }));
    if (tab === "archive") return dealRows.filter((r) => archived.includes(r.id));
    return [...inviteRows, ...dealRows].filter((r) => !archived.includes(r.id));
  }, [deals, unread, archived, tab, incomingInvites, contacts, me.id]);

  const q = query.trim().toLowerCase();
  const visible = q ? rows.filter((r) => r.hay.includes(q)) : rows;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-panel text-ink">
      <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-line pr-2 pl-4">
        <Logo href="/dashboard" />
        <div className="flex items-center">
          <IconButton label="Yangi kelishuv" onClick={() => openNewChat()}>
            <SquarePen size={20} />
          </IconButton>
        </div>
      </header>

      <div className="shrink-0 px-3 pt-2.5 pb-2">
        <label className="flex h-11 items-center gap-3 rounded-full md:h-[35px] bg-wash px-3.5 focus-within:shadow-[0_0_0_2px_rgba(201,168,76,0.55)]">
          <Search size={15} className="shrink-0 text-ink2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidirish yoki yangi boshlash"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink2"
          />
        </label>
      </div>

      <div className="flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-2" role="tablist">
        {NAV.map((item) =>
          item.type === "link" ? (
            <Link
              key={item.id}
              href={item.href}
              role="tab"
              aria-selected={onContacts}
              className={tabClass(onContacts)}
            >
              <Users size={13} />
              {item.label}
            </Link>
          ) : (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={!onContacts && tab === item.id}
              onClick={() => {
                setTab(item.id);
                if (onContacts) router.push("/dashboard");
              }}
              className={tabClass(!onContacts && tab === item.id)}
            >
              {item.label}
              {item.id === "deals" && incomingInvites.length > 0 ? (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9A84C] px-1 text-[10px] font-semibold text-[#111]">
                  {incomingInvites.length}
                </span>
              ) : null}
            </button>
          ),
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visible.map((row) =>
          row.kind === "invite" && row.inviteDeal ? (
            <div
              key={row.id}
              className="border-l-[3px] border-l-[#C9A84C] bg-[#FFFBEB] px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                {row.avatar}
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[15px] font-semibold text-ink">{row.name}</span>
                      <span className="shrink-0 rounded-[3px] bg-[#C9A84C] px-1.5 py-px text-[10.5px] font-semibold text-[#111]">
                        📨 Taklif
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] text-ink2">{row.time}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink2">
                    <KindBadge kind={row.chatKind} size="sm" />
                    <span className="truncate">{row.inviteDeal.title}</span>
                  </span>
                </span>
              </div>
              <div className="mt-2 pl-[60px]">
                <InviteActions
                  onAccept={() => row.inviteDeal?.invitation && void respondToInvite(row.inviteDeal.invitation.id, true)}
                  onReject={() => row.inviteDeal?.invitation && void respondToInvite(row.inviteDeal.invitation.id, false)}
                />
              </div>
            </div>
          ) : (
            <SwipeableChatRow
              key={row.id}
              row={row}
              active={pathname === row.href}
              swipeOpen={swipeId === row.id}
              leaving={leaving === row.id}
              onSwipeOpen={(open) => setSwipeId(open ? row.id : null)}
              archiveLabel="Arxiv"
              onArchive={() => {
                const wasArchived = Boolean(row.archived);
                runLeave(row.id, () => {
                  toggleArchive(row.id);
                  flashToast({
                    id: row.id,
                    text: wasArchived ? "Arxivdan chiqarildi ✓" : "Arxivlandi ✓",
                    undo: () => toggleArchive(row.id),
                  });
                });
              }}
              onDelete={() => {
                setSwipeId(null);
                if (!row.canDelete) {
                  flashToast({ id: row.id, text: "O'chirish faqat muallifga ruxsat." });
                  return;
                }
                setDeleteId(row.id);
              }}
            />
          ),
        )}

        {visible.length === 0 ? (
          <EmptyNote emoji={tab === "archive" ? "🗂️" : "💬"}>
            {q ? "Hech narsa topilmadi." : tab === "archive" ? "Arxiv bo'sh." : "Hali suhbatlar yo'q."}
          </EmptyNote>
        ) : null}

        {q ? (
          <button
            type="button"
            onClick={() => openNewChat(query.trim())}
            className="flex h-14 w-full items-center gap-3 px-3 text-left hover:bg-hov"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-btn text-btnink">
              <SquarePen size={20} />
            </span>
            <span className="min-w-0 truncate text-[14px] text-ink">
              <span className="font-semibold">&ldquo;{query.trim()}&rdquo;</span> bilan yangi boshlash
            </span>
          </button>
        ) : null}
      </div>

      <footer className="hidden h-[60px] shrink-0 items-center gap-3 border-t border-line px-3 md:flex">
        <Avatar initials={me.initials} size="hd" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-ink">
            {me.name}
            <RatingBadge rating={me.avgRating} />
          </p>
          <p className="flex items-center gap-1.5 text-[12px] text-ink2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E9E5B]" />
            Onlayn
          </p>
        </div>
        <IconButton href="/dashboard/contacts" label="Kontaktlar">
          <UserPlus size={20} />
        </IconButton>
        <IconButton href="/dashboard/settings" label="Sozlamalar">
          <Settings size={20} />
        </IconButton>
      </footer>

      <NewChatPanel />
      <ConfirmSheet
        open={Boolean(deleteId)}
        title="O'chirishni tasdiqlaysizmi?"
        body="Bu amalni qaytarib bo'lmaydi."
        confirmLabel="Ha, o'chirish"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          const id = deleteId;
          setDeleteId(null);
          if (id) runLeave(id, () => void deleteDeal(id));
        }}
      />
      {toast ? (
        <div
          role="status"
          className="toast-in absolute bottom-[72px] left-3 right-3 z-50 flex items-center gap-3 rounded-[12px] bg-[#111] px-3 py-2.5 text-[13.5px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:bottom-16"
        >
          <span className="min-w-0 flex-1">{toast.text}</span>
          {toast.undo ? (
            <button
              type="button"
              onClick={() => {
                toast.undo?.();
                window.clearTimeout(toastTimer.current);
                setToast(null);
              }}
              className="shrink-0 text-[13px] font-semibold text-[#F59E0B]"
            >
              Bekor qilish
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ChatRowLink({
  row,
  active,
}: {
  row: Row;
  active: boolean;
}) {
  return (
    <Link
      href={row.href}
      className={`flex min-h-[72px] items-center gap-3 px-3 ${
        row.pending ? "border-l-[3px] border-l-[#C9A84C] bg-[#FFFBEB]" : ""
      } ${row.rejected ? "border-l-[3px] border-l-[#E8B4B0]" : ""} ${active ? "bg-sel" : "hover:bg-hov"}`}
    >
      {row.avatar}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold text-ink">{row.name}</span>
            <RatingBadge rating={row.rating} />
            <KindBadge kind={row.chatKind} size="sm" />
            {row.pending ? (
              <span className="shrink-0 rounded-[3px] bg-[#F6EFD9] px-1.5 py-px text-[10.5px] font-medium text-[#8A6B2E]">
                ⏳ Javob kutilmoqda
              </span>
            ) : null}
          </span>
          <span className={`shrink-0 text-[12px] ${row.unread ? "font-semibold text-ink" : "text-ink2"}`}>
            {row.time}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className="flex min-w-0 flex-1 text-[13.5px] text-ink2">{row.preview}</span>
          {row.unread > 0 ? (
            <span
              aria-label={`${row.unread} ta o'qilmagan`}
              className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-badge px-1.5 text-[11px] font-semibold text-badgeink"
            >
              {row.unread}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

function SwipeableChatRow({
  row,
  active,
  swipeOpen,
  leaving,
  onSwipeOpen,
  archiveLabel,
  onArchive,
  onDelete,
}: {
  row: Row;
  active: boolean;
  swipeOpen: boolean;
  leaving: boolean;
  onSwipeOpen: (open: boolean) => void;
  archiveLabel: string;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const card = <ChatRowLink row={row} active={active} />;
  if (row.kind !== "deal") return card;
  return (
    <div data-swipe-row={row.id}>
      <SwipeRow
        open={swipeOpen}
        leaving={leaving}
        onOpenChange={onSwipeOpen}
        archiveLabel={archiveLabel}
        canDelete={Boolean(row.canDelete)}
        onArchive={onArchive}
        onDelete={onDelete}
      >
        {card}
      </SwipeRow>
    </div>
  );
}
