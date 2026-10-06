"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Archive, CalendarClock, Users } from "lucide-react";
import { useApp } from "@/components/app-store";
import { Avatar, GroupAvatar } from "@/components/avatar";
import { PinnedProgress, PoolCardMessage } from "@/components/chat-cards";
import {
  Bubble,
  ChatHeader,
  ChatInputBar,
  ChatThread,
  DateDivider,
  EmptyNote,
  IconButton,
  InfoDrawer,
  MenuButton,
  SystemMessage,
  type PillItem,
} from "@/components/chat-ui";
import { KindBadge } from "@/components/kind-badge";
import { PoolStatusBadge, purposeClass } from "@/components/pool-status-badge";
import { dayLabelFromRelative, firstName, freshId, isHourly, nameColor } from "@/lib/chat-helpers";
import {
  formatAmountInput,
  formatMoney,
  parseAmountInput,
  type Activity,
  type Contributor,
} from "@/lib/pool-qarz";

type Entry =
  | { type: "card"; id: string; day: string }
  | { type: "system"; id: string; day: string; text: string }
  | { type: "bubble"; id: string; day: string; text: string; name: string; side: "me" | "them"; time: string };

const CONTRIBUTION = /qo'shdi$/;

function toEntry(item: Activity): Entry {
  const day = dayLabelFromRelative(item.time);
  if (CONTRIBUTION.test(item.text)) {
    const name = item.text.split(" ")[0];
    return {
      type: "bubble",
      id: item.id,
      day,
      text: `${item.text} ✓`,
      name,
      side: item.mine ? "me" : "them",
      time: isHourly(item.time) ? item.time : "",
    };
  }
  return { type: "system", id: item.id, day, text: item.text };
}

export default function PoolChatPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { me, pools, hydrated, updatePool, markRead, archived, toggleArchive } = useApp();
  const pool = pools.find((p) => p.id === id) ?? null;

  const [amountRaw, setAmountRaw] = useState("");
  const [notice, setNotice] = useState("");
  const [drawer, setDrawer] = useState<"people" | "schedule" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    markRead(id);
  }, [id, markRead]);

  const activityCount = pool?.activity.length ?? 0;

  const entries = useMemo<Entry[]>(() => {
    if (!pool) return [];
    const timeline = [...pool.activity].reverse().map(toEntry);
    const createdIndex = timeline.findIndex((e) => e.type === "system" && e.text === "So'rov yaratildi");
    const card: Entry = {
      type: "card",
      id: `card-${pool.id}`,
      day: createdIndex >= 0 ? timeline[createdIndex].day : (timeline[0]?.day ?? "Bugun"),
    };
    const at = createdIndex >= 0 ? createdIndex + 1 : 0;
    return [...timeline.slice(0, at), card, ...timeline.slice(at)];
  }, [pool]);

  if (!hydrated && !pool) {
    return (
      <div className="chat-bg flex-1 space-y-3 p-6">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-24 w-80" />
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="chat-bg flex flex-1 flex-col items-center justify-center">
        <EmptyNote emoji="👥">So&apos;rov topilmadi.</EmptyNote>
        <Link href="/dashboard" className="-mt-8 text-[14px] font-medium text-ink underline">
          Ro&apos;yxatga qaytish
        </Link>
      </div>
    );
  }

  const current = pool;
  const remaining = Math.max(0, current.amount - current.collected);
  const canContribute = !current.isMine && current.status === "collecting";
  const isArchived = archived.includes(current.id);
  const second = current.contributors[0]?.person ?? current.invited[0] ?? current.borrower;
  const title = current.isMine
    ? `Mening so'rovim — ${current.purpose}`
    : `${current.borrower.name} — ${current.purpose}`;

  function contribute(event: FormEvent) {
    event.preventDefault();
    if (!canContribute) return;
    const value = parseAmountInput(amountRaw);
    if (value < current.minContribute) {
      setNotice(`Minimal summa: ${formatMoney(current.minContribute, current.currency)}`);
      return;
    }
    if (value > remaining) {
      setNotice(`Qolgan summa: ${formatMoney(remaining, current.currency)}`);
      return;
    }
    const contributionId = freshId();
    const entry: Contributor = { id: contributionId, person: me, amount: value, date: "Bugun", relative: "Hozir" };
    updatePool(
      id,
      (p) => {
        const collected = p.collected + value;
        const full = collected >= p.amount;
        const added: Activity[] = [
          {
            id: contributionId,
            text: `${firstName(me.name)} ${formatMoney(value, p.currency)} qo'shdi`,
            time: "Hozir",
            mine: true,
          },
        ];
        if (full) added.push({ id: `full-${p.id}`, text: "Maqsad yig'ildi! 🎉", time: "Hozir" });
        return {
          ...p,
          collected,
          status: full ? "full" : p.status,
          contributors: [entry, ...p.contributors],
          activity: [...added.reverse(), ...p.activity],
        };
      },
      true,
    );
    setAmountRaw("");
    setNotice("");
  }

  const quick: PillItem[] | undefined = canContribute
    ? [
        ...(remaining >= current.minContribute
          ? [
              {
                label: `Minimal: ${formatMoney(current.minContribute, current.currency)}`,
                onClick: () => setAmountRaw(formatAmountInput(String(current.minContribute))),
              },
            ]
          : []),
        {
          label: `Qolgan: ${formatMoney(remaining, current.currency)}`,
          onClick: () => setAmountRaw(formatAmountInput(String(remaining))),
        },
      ]
    : undefined;

  const placeholder = canContribute
    ? "Qo'shmoqchi bo'lgan summa..."
    : current.isMine
      ? "Bu sizning so'rovingiz — o'zingizga qo'sha olmaysiz"
      : "Yig'ish yopilgan";

  const people = [current.borrower, ...current.invited.filter((p) => p.id !== current.borrower.id)];
  const given = new Map<string, number>();
  for (const c of current.contributors) given.set(c.person.id, (given.get(c.person.id) ?? 0) + c.amount);

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ChatHeader
        back="/dashboard/pool-qarz"
        avatar={<GroupAvatar initials={[current.borrower.initials, second.initials]} size={40} />}
        title={title}
        subtitle={`Pool Qarz · ${people.length} ishtirokchi · ${current.contributors.length} ta qo'shgan`}
        center={
          <>
            <KindBadge kind="pool" />
            <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${purposeClass(current.purpose)}`}>
              {current.purpose}
            </span>
            <PoolStatusBadge status={current.status} />
          </>
        }
        actions={
          <>
            <IconButton label="Qaytarish jadvali" onClick={() => setDrawer("schedule")}>
              <CalendarClock size={20} />
            </IconButton>
            <IconButton label="Ishtirokchilar" onClick={() => setDrawer("people")}>
              <Users size={20} />
            </IconButton>
            <MenuButton
              items={[
                {
                  label: isArchived ? "Arxivdan chiqarish" : "Arxivlash",
                  icon: <Archive size={16} />,
                  onClick: () => {
                    toggleArchive(current.id);
                    setNotice(isArchived ? "Arxivdan chiqarildi." : "Arxivga ko'chirildi.");
                  },
                },
              ]}
            />
          </>
        }
      />

      <PinnedProgress pool={current} />

      <ChatThread
        key={current.id}
        scrollKey={`${id}:${activityCount}`}
        footer={
          <ChatInputBar
            value={amountRaw}
            onChange={(value) => {
              setAmountRaw(formatAmountInput(value));
              setNotice("");
            }}
            onSubmit={contribute}
            placeholder={placeholder}
            inputRef={inputRef}
            disabled={!canContribute}
            inputMode="numeric"
            notice={notice}
            quick={quick}
          />
        }
      >
        {entries.map((entry, index) => {
          const showDay = index === 0 || entries[index - 1].day !== entry.day;
          return (
            <div key={entry.id} className="contents">
              {showDay ? <DateDivider label={entry.day} /> : null}
              {entry.type === "card" ? (
                <PoolCardMessage
                  id={entry.id}
                  pool={current}
                  canGive={canContribute}
                  onGive={() => inputRef.current?.focus()}
                />
              ) : entry.type === "system" ? (
                <SystemMessage id={entry.id} text={entry.text} />
              ) : (
                <Bubble
                  id={entry.id}
                  side={entry.side}
                  name={entry.name}
                  nameColor={nameColor(entry.name)}
                  time={entry.time}
                >
                  <p className="text-[14.5px] leading-[1.4]">{entry.text}</p>
                </Bubble>
              )}
            </div>
          );
        })}
      </ChatThread>

      <InfoDrawer open={drawer === "people"} title="Ishtirokchilar" onClose={() => setDrawer(null)}>
        <ul className="py-2">
          {people.map((person) => {
            const amount = given.get(person.id);
            const owner = person.id === current.borrower.id;
            return (
              <li key={person.id} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar initials={person.initials} size="xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">
                    {person.id === me.id ? `${person.name} (Siz)` : person.name}
                  </span>
                  <span className="block text-[13px] text-ink2">{owner ? "So'rov egasi" : person.phone}</span>
                </span>
                {amount ? (
                  <span className="text-[12.5px] font-medium text-[#2E9E5B]">
                    ✓ {formatMoney(amount, current.currency)}
                  </span>
                ) : owner ? null : (
                  <span className="rounded-full bg-[#F6EFD9] px-2 py-0.5 text-[12px] font-medium text-[#8A6B2E]">
                    Taklif qilingan
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </InfoDrawer>

      <InfoDrawer open={drawer === "schedule"} title="Qaytarish jadvali" onClose={() => setDrawer(null)}>
        <div className="p-4">
          <dl className="rounded-[10px] bg-wash px-4 py-1">
            <Info label="Jami">{formatMoney(current.amount, current.currency)}</Info>
            <Info label="Minimal hissa">{formatMoney(current.minContribute, current.currency)}</Info>
            <Info label="Qaytarish">{current.repayDate}</Info>
            <Info label="Jadval">{current.schedule === "once" ? "Bir martalik" : "Oylik bo'lib"}</Info>
            <Info label="Yaratilgan">{current.createdAt}</Info>
          </dl>
          <ul className="mt-4 space-y-2">
            {current.repayments.map((row, i) => (
              <li
                key={`${row.date}-${i}`}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-line px-4 py-3"
              >
                <span>
                  <span className="block text-[14px] font-medium text-ink">{row.date}</span>
                  <span className="block text-[13px] text-ink2">{formatMoney(row.amount, current.currency)}</span>
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${
                    row.status === "paid" ? "bg-[#E8EEDC] text-[#5A6B38]" : "bg-[#F6E6D8] text-[#8F5430]"
                  }`}
                >
                  {row.status === "paid" ? "To'landi" : "Kutilmoqda"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] leading-5 text-ink2">
            Muddatda qaytarilmasa, summa karta (**** {current.cardLast4}) orqali avtomatik yechib olinadi.
          </p>
        </div>
      </InfoDrawer>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2.5 text-[14px] last:border-b-0">
      <dt className="text-ink2">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
