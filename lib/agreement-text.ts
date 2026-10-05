import { buildAgreementFromDeal, type AgreementDocument, type Clause, type Deal } from "@/lib/deals";

const stripMarkdown = (line: string) =>
  line
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*|__/g, "")
    .trim();

/** A top-level clause heading: "1. TOMONLAR", "2) Предмет", "Статья 3." — but not sub-items like "1.1". */
const CLAUSE_HEAD = /^(?:#{1,6}\s*)?(?:\*\*)?\s*(\d{1,2})[.)]\s+(?!\d)(.+)$/;
const MAX_TITLE = 70;

/**
 * Splits the model's formatted text into the app's `Clause` structure (number / title / body), so the
 * existing agreement panel, PDF export and Supabase `agreements.clauses` column all keep working.
 */
export function parseAgreementText(text: string): { heading: string; preamble: string; clauses: Clause[] } {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const preambleLines: string[] = [];
  const clauses: Clause[] = [];
  let current: { number: string; head: string; body: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const head = stripMarkdown(current.head).replace(/[:：]\s*$/, "");
    // "1. PREDMET" has a separate title; "1. The Seller shall..." is a full sentence and stays in the body.
    const isTitle = head.length <= MAX_TITLE && !/[.!?]$/.test(head);
    const body = (isTitle ? current.body : [current.head, ...current.body]).join("\n").trim();
    clauses.push({ number: current.number, title: isTitle ? head : "", body: body || "[ANIQLANISHI KERAK]" });
    current = null;
  };

  for (const line of lines) {
    const match = line.match(CLAUSE_HEAD);
    if (match) {
      flush();
      current = { number: match[1], head: stripMarkdown(match[2]), body: [] };
    } else if (current) {
      current.body.push(line.replace(/\*\*|__/g, ""));
    } else {
      preambleLines.push(line);
    }
  }
  flush();

  const preamble = preambleLines.map(stripMarkdown).filter(Boolean);
  return { heading: preamble[0] ?? "", preamble: preamble.slice(1).join("\n"), clauses };
}

/** Builds an agreement from the model's text. Falls back to a single clause if no numbering was found. */
export function buildAgreementFromAiText(deal: Deal, text: string): AgreementDocument {
  const base = buildAgreementFromDeal(deal); // id, dates and unsigned parties
  const { heading, preamble, clauses } = parseAgreementText(text);
  const body = text.trim();

  return {
    ...base,
    title: (heading || base.title).slice(0, 120),
    subject: preamble || deal.title,
    clauses: clauses.length ? clauses : [{ number: "1", title: "", body }],
  };
}
