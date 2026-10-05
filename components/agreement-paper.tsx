"use client";

import type { AgreementDocument, DealStatus, Party } from "@/lib/deals";
import { Button } from "@/components/button";
import { Mention } from "@/components/mention";
import { StatusBadge } from "@/components/status-badge";

export function AgreementPaper({
  agreement,
  status,
  onSign,
}: {
  agreement: AgreementDocument;
  status?: DealStatus;
  onSign?: (partyName: string) => void;
}) {
  return (
    <article className="mx-auto w-full max-w-[720px] pb-8">
      <div className="border-t border-[#E9E9E7]">
        <Property label="Sana" value={agreement.issuedAt} />
        <div className="flex min-h-9 items-center gap-3 border-b border-[#E9E9E7] py-2 text-[14px]">
          <span className="w-36 shrink-0 text-[#787774]">Holat</span>
          {status ? <StatusBadge status={status} /> : <span className="text-[#ACABA8]">—</span>}
        </div>
        <div className="flex min-h-9 items-center gap-3 border-b border-[#E9E9E7] py-2 text-[14px]">
          <span className="w-36 shrink-0 text-[#787774]">Ishtirokchilar</span>
          <span className="flex flex-wrap gap-1.5">
            {agreement.parties.map((party) => (
              <Mention key={`${party.role}-${party.name}`} name={party.name} />
            ))}
          </span>
        </div>
      </div>

      <h2 className="mt-8 text-[30px] font-semibold tracking-[-0.02em] text-[#111]">{agreement.title}</h2>
      <p className="mt-2 text-[16px] leading-7 whitespace-pre-line text-[#787774]">
        <Marked text={agreement.subject} />
      </p>

      {agreement.clauses.map((clause) => (
        <section key={clause.number} className="mt-8">
          <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-[#111]">
            {clause.number}.{clause.title ? ` ${clause.title}` : ""}
          </h3>
          <p className="mt-2 text-[16px] leading-[1.7] whitespace-pre-line text-[#37352F]">
            <Marked text={clause.body} />
          </p>
        </section>
      ))}

      <section className="mt-10 rounded-[4px] bg-[#F5F4F0] p-4">
        <p className="text-[14px] font-medium text-[#37352F]">✍️ Imzolar</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {agreement.parties.map((party) => (
            <SignatureBlock key={`${party.role}-${party.name}`} party={party} onSign={onSign} />
          ))}
        </div>
      </section>

      <p className="mt-8 text-[13px] text-[#ACABA8]">
        Ahd · tuzilgan: {agreement.generatedAt} · {agreement.id}
      </p>
    </article>
  );
}

/** Highlights the model's [TO BE CONFIRMED] markers so open points are easy to spot. */
function Marked({ text }: { text: string }) {
  return text.split(/(\[TO BE CONFIRMED\])/g).map((part, i) =>
    part === "[TO BE CONFIRMED]" ? (
      <mark key={i} className="rounded-[3px] bg-[#F6EFD9] px-1 text-[#8A6B2E]">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function Property({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-9 items-center gap-3 border-b border-[#E9E9E7] py-2 text-[14px]">
      <span className="w-36 shrink-0 text-[#787774]">{label}</span>
      <span className="text-[#37352F]">{value}</span>
    </div>
  );
}

function SignatureBlock({
  party,
  onSign,
}: {
  party: Party;
  onSign?: (partyName: string) => void;
}) {
  const signed = Boolean(party.signedAt);

  return (
    <div>
      <p className="text-[13px] text-[#787774]">{party.role}</p>
      {signed ? (
        <p className="font-signature mt-2 text-[28px] leading-none text-[#111]">{party.name}</p>
      ) : (
        <p className="mt-2 text-[14px] text-[#ACABA8]">Imzo kutilmoqda</p>
      )}
      <p className="mt-2 text-[14px] text-[#37352F]">{party.name}</p>
      {signed ? <p className="text-[13px] text-[#ACABA8]">{party.signedAt}</p> : null}
      {!signed && onSign ? (
        <Button variant="secondary" onClick={() => onSign(party.name)} className="mt-3">
          Imzolash
        </Button>
      ) : null}
    </div>
  );
}
