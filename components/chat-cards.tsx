"use client";

import { FileText, Pin } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Bubble } from "@/components/chat-ui";
import { purposeClass } from "@/components/pool-status-badge";
import { ProgressBar } from "@/components/progress-bar";
import { initialsOf } from "@/lib/chat-helpers";
import type { Deal } from "@/lib/deals";
import { formatMoney, poolProgress, type PoolRequest } from "@/lib/pool-qarz";
import { labeledParties } from "@/lib/roles";

/** AI generated agreement, shown as a wide white card with a gold edge. */
export function AgreementCard({
  id,
  deal,
  time,
  onView,
  onSign,
  onRegenerate,
  regenerating = false,
}: {
  id: string;
  deal: Deal;
  time: string;
  onView: () => void;
  onSign: () => void;
  /** Throws the current agreement away and asks the AI for a new one. */
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  const agreement = deal.agreement;
  if (!agreement) return null;
  const first = agreement.clauses[0];
  const allSigned = agreement.parties.every((p) => p.signedAt);

  return (
    <Bubble id={id} side="them" name="Ahd AI" nameColor="#8A6B2E" time={time} wide accent>
      <div className="py-1">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#C9A84C]" />
          <p className="text-[15px] font-semibold">Kelishuv tayyorlandi</p>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] font-medium">{agreement.subject}</p>
        <p className="text-[12px] text-ink2">{agreement.id}</p>
        {first ? (
          <div className="mt-2 rounded-[8px] bg-wash px-2.5 py-2">
            <p className="line-clamp-3 text-[13px] leading-5 text-ink2">
              <span className="font-semibold text-ink">
                {first.number}.{first.title ? ` ${first.title}.` : ""}
              </span>{" "}
              {first.body}
            </p>
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onView}
            className="h-11 min-w-[88px] flex-1 rounded-[8px] md:h-9 border border-line text-[13.5px] font-medium text-otherink hover:bg-hov"
          >
            Ko&apos;rish
          </button>
          <button
            type="button"
            onClick={onSign}
            disabled={allSigned}
            className="h-11 min-w-[88px] flex-1 rounded-[8px] md:h-9 bg-btn text-[13.5px] font-medium text-btnink hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allSigned ? "Imzolangan ✓" : "Imzolash"}
          </button>
          {onRegenerate ? (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="h-11 min-w-[88px] flex-[1.3] rounded-[8px] border border-line text-[13px] font-medium text-ink2 hover:bg-hov disabled:cursor-not-allowed disabled:opacity-40 md:h-9"
            >
              {regenerating ? "Yaratilmoqda…" : "🔄 Qayta yaratish"}
            </button>
          ) : null}
        </div>
      </div>
    </Bubble>
  );
}

/** Shows who signed and who has not, with the next signature action. */
export function SignatureCard({
  id,
  deal,
  time,
  onSign,
}: {
  id: string;
  deal: Deal;
  time: string;
  onSign: () => void;
}) {
  const agreement = deal.agreement;
  if (!agreement) return null;
  const parties = labeledParties({
    createdBy: deal.createdBy,
    initiatorRole: deal.initiatorRole,
    parties: agreement.parties,
  });
  const next = parties.find((p) => !p.signedAt);

  return (
    <Bubble id={id} side="them" name="Ahd AI" nameColor="#8A6B2E" time={time} wide>
      <div className="py-1">
        <div className="flex items-center gap-2">
          <span className="text-[18px]" aria-hidden>
            {next ? "✍️" : "✅"}
          </span>
          <p className="text-[15px] font-semibold">{next ? "Imzo kutilmoqda" : "Barcha imzolar qo'yildi"}</p>
        </div>
        <ul className="mt-2 space-y-2">
          {parties.map((party) => (
            <li key={`${party.letter}-${party.name}`} className="flex items-center gap-2.5">
              <Avatar initials={initialsOf(party.name)} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium">{party.signedAs}</span>
                <span className="block text-[12px] text-ink2">Tomon {party.letter}</span>
              </span>
              {party.signedAt ? (
                <span className="text-right text-[12px] font-medium text-[#5A6B38]">
                  ✓ {party.signedAt}
                </span>
              ) : (
                <span className="rounded-full bg-[#F6EFD9] px-2 py-0.5 text-[12px] font-medium text-[#8A6B2E]">
                  Kutilmoqda
                </span>
              )}
            </li>
          ))}
        </ul>
        {next ? (
          <>
            <button
              type="button"
              onClick={onSign}
              className="mt-3 h-11 w-full rounded-[8px] md:h-9 bg-btn text-[13.5px] font-medium text-btnink hover:opacity-85"
            >
              Imzolash
            </button>
            <p className="mt-1 text-center text-[12px] text-ink2">{next.name} imzosi</p>
          </>
        ) : null}
      </div>
    </Bubble>
  );
}

/** Pool Qarz request as the first message of a group chat. */
export function PoolCardMessage({
  id,
  pool,
  canGive,
  onGive,
}: {
  id: string;
  pool: PoolRequest;
  canGive: boolean;
  onGive: () => void;
}) {
  const pct = poolProgress(pool);
  return (
    <Bubble id={id} side="them" name={pool.borrower.name} nameColor="#8F5430" wide accent>
      <div className="py-1">
        <div className="flex items-center gap-2">
          <span className="text-[18px]" aria-hidden>
            💰
          </span>
          <p className="text-[17px] font-semibold tracking-[-0.01em]">{formatMoney(pool.amount, pool.currency)}</p>
        </div>
        <span
          className={`mt-1.5 inline-flex rounded-[4px] px-1.5 py-0.5 text-[12px] font-medium ${purposeClass(pool.purpose)}`}
        >
          {pool.purpose}
        </span>
        <p className="mt-2 text-[13.5px] leading-5">{pool.description}</p>
        <div className="mt-3">
          <ProgressBar value={pct} />
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink2">
          {formatMoney(pool.collected, pool.currency)} / {formatMoney(pool.amount, pool.currency)} · {pct}%
        </p>
        {canGive ? (
          <button
            type="button"
            onClick={onGive}
            className="mt-3 h-11 w-full rounded-[8px] md:h-9 bg-btn text-[13.5px] font-medium text-btnink hover:opacity-85"
          >
            Qarz berish
          </button>
        ) : null}
      </div>
    </Bubble>
  );
}

/** Progress strip pinned at the top of a Pool Qarz group chat. */
export function PinnedProgress({ pool }: { pool: PoolRequest }) {
  const pct = poolProgress(pool);
  return (
    <div className="shrink-0 border-b border-line bg-panel px-4 py-2">
      <div className="flex items-center gap-2 text-[13px]">
        <Pin size={14} className="shrink-0 text-[#C9A84C]" />
        <span className="min-w-0 flex-1 truncate text-ink">
          <span className="font-semibold">{formatMoney(pool.collected, pool.currency)}</span>
          <span className="text-ink2"> / {formatMoney(pool.amount, pool.currency)}</span>
        </span>
        <span className="font-semibold text-ink">{pct}%</span>
        {pool.status === "collecting" ? <span className="text-ink2">⏱ {pool.daysLeft} kun</span> : null}
      </div>
      <div className="mt-1.5">
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}
