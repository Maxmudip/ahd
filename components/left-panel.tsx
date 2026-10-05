"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { CheckCheck, FileText, Paperclip, PenLine, Search, Settings, SquarePen, Wallet } from "lucide-react";
import { Avatar, GroupAvatar } from "@/components/avatar";
import { useApp, type ListTab } from "@/components/app-store";
import { EmptyNote, IconButton } from "@/components/chat-ui";
import { KindBadge, type ChatKind } from "@/components/kind-badge";
import { Logo } from "@/components/logo";
import { NewChatPanel } from "@/components/new-chat-panel";
import { initialsOf, listTime } from "@/lib/chat-helpers";
import type { Deal } from "@/lib/deals";
import type { PoolRequest } from "@/lib/pool-qarz";

type Row = {
  id: string;
  kind: "deal" | "pool";
  /** Chat type shown as a chip: Kelishuv, Qarz or Pool Qarz. */
  chatKind: ChatKind;
  href: string;
  avatar: ReactNode;
  name: string;
  time: string;
  preview: ReactNode;
  unread: number;
  hay: string;
};

const TABS: { id: ListTab; label: string }[] = [
  { id: "deals", label: "Kelishuvlar" },
  { id: "pools", label: "Pool Qarz" },
  { id: "archive", label: "Arxiv" },
];

function Preview({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

function dealPreview(deal: Deal): ReactNode {
  const last = deal.messages[deal.messages.length - 1];
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

function poolPreview(pool: PoolRequest): ReactNode {
  if (pool.status === "completed") {
    return (
      <Preview icon={<CheckCheck size={16} className="text-[#2E9E5B]" />}>
        <span className="text-[#2E9E5B]">Yakunlangan</span>
      </Preview>
    );
  }
  const last = pool.activity[0];
  const mark = last?.text.includes("qo'shdi") ? " ✓" : "";
  return <Preview icon={<Wallet size={14} />}>{`${last?.text ?? "So'rov yaratildi"}${mark}`}</Preview>;
}

export function LeftPanel() {
  const pathname = usePathname();
  const { me, deals, pools, unread, archived, openNewChat, listTab: tab, setListTab: setTab } = useApp();
  const [query, setQuery] = useState("");

  const rows = useMemo<Row[]>(() => {
    const dealRows: Row[] = deals.map((deal) => ({
      id: deal.id,
      kind: "deal",
      chatKind: deal.kind ?? "kelishuv",
      href: `/dashboard/deals/${deal.id}`,
      avatar: <Avatar initials={initialsOf(deal.counterparty)} size="xl" />,
      name: deal.title,
      time: listTime(deal.updatedAt),
      preview: dealPreview(deal),
      unread: unread[deal.id] ?? 0,
      hay: `${deal.title} ${deal.counterparty}`.toLowerCase(),
    }));
    const poolRows: Row[] = pools.map((pool) => {
      const second = pool.contributors[0]?.person ?? pool.invited[0] ?? pool.borrower;
      return {
        id: pool.id,
        kind: "pool",
        chatKind: "pool",
        href: `/dashboard/pool-qarz/${pool.id}`,
        avatar: <GroupAvatar initials={[pool.borrower.initials, second.initials]} />,
        name: pool.isMine ? `Mening so'rovim — ${pool.purpose}` : `${pool.borrower.name} — ${pool.purpose}`,
        time: pool.activity[0]?.time ?? "",
        preview: poolPreview(pool),
        unread: unread[pool.id] ?? 0,
        hay: `${pool.borrower.name} ${pool.purpose}`.toLowerCase(),
      };
    });
    if (tab === "deals") return dealRows.filter((r) => !archived.includes(r.id));
    if (tab === "pools") return poolRows.filter((r) => !archived.includes(r.id));
    return [...dealRows, ...poolRows].filter((r) => archived.includes(r.id));
  }, [deals, pools, unread, archived, tab]);

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

      <div className="flex shrink-0 gap-1.5 px-3 pb-2" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`relative h-7 rounded-full px-3 text-[13px] font-medium before:absolute before:inset-x-0 before:-inset-y-2 before:content-[''] ${
              tab === item.id ? "bg-btn text-btnink" : "bg-wash text-ink2 hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "pools" && !q ? (
          <Link
            href="/dashboard/pool-qarz/contributions"
            className={`flex h-14 items-center gap-3 px-3 ${
              pathname === "/dashboard/pool-qarz/contributions" ? "bg-sel" : "hover:bg-hov"
            }`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F6EFD9] text-[20px]">
              💸
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-ink">Qo&apos;shganlarim</span>
              <span className="block truncate text-[13px] text-ink2">Qarz bergan so&apos;rovlaringiz</span>
            </span>
          </Link>
        ) : null}

        {visible.map((row) => (
          <Link
            key={row.id}
            href={row.href}
            className={`flex h-[72px] items-center gap-3 px-3 ${pathname === row.href ? "bg-sel" : "hover:bg-hov"}`}
          >
            {row.avatar}
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-[15px] font-semibold text-ink">{row.name}</span>
                  <KindBadge kind={row.chatKind} size="sm" />
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
        ))}

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
          <p className="truncate text-[14px] font-semibold text-ink">{me.name}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-ink2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E9E5B]" />
            Onlayn
          </p>
        </div>
        <IconButton href="/dashboard/settings" label="Sozlamalar">
          <Settings size={20} />
        </IconButton>
      </footer>

      <NewChatPanel />
    </div>
  );
}
