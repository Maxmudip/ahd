import type { SupabaseClient } from "@supabase/supabase-js";
import { firstName, initialsOf } from "@/lib/chat-helpers";
import {
  formatUzDate,
  formatUzDateTime,
  type AgreementDocument,
  type ChatMessage,
  type Clause,
  type Deal,
  type DealInvitation,
  type DealKind,
  type DealStatus,
  type InitiatorRole,
  type InviteStatus,
  type MessageKind,
  type Party,
} from "@/lib/deals";
import {
  formatMoney,
  type Activity,
  type Contributor,
  type Currency,
  type Person,
  type PoolRequest,
  type PoolStatus,
  type RepaymentRow,
  type Schedule,
} from "@/lib/pool-qarz";
import { clock, dayLabel, daysUntil, relativeLabel, stampLabel } from "@/lib/time-labels";

/* -------------------------------------------------------------------------------------------
 * Database rows (see supabase/migrations/*.sql)
 * ----------------------------------------------------------------------------------------- */

type UserRow = { id: string; full_name: string; email: string | null; phone: string | null };
type DealRoomRow = {
  id: string;
  title: string;
  counterparty: string;
  kind: DealKind;
  status: DealStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  initiator_role?: InitiatorRole | null;
};
type InvitationRow = {
  id: string;
  deal_room_id: string;
  invited_email: string;
  invited_user_id: string | null;
  status: InviteStatus;
  created_at: string;
  responded_at: string | null;
};
type ParticipantRow = {
  id: string;
  deal_id: string;
  user_id: string | null;
  name: string;
  role: string;
  position: number;
  signed_at: string | null;
};
export type MessageRow = {
  id: string;
  deal_id: string;
  sender_id: string | null;
  author_name: string;
  kind: "text" | "ai" | "file" | "agreement" | "signature" | "system";
  body: string;
  created_at: string;
};
type AgreementRow = {
  id: string;
  deal_id: string;
  doc_number: string;
  title: string;
  subject: string;
  clauses: Clause[];
  issued_at: string;
  generated_at: string;
};
type PoolRow = {
  id: string;
  borrower_id: string;
  amount: number | string;
  currency: Currency;
  purpose: string;
  description: string;
  status: PoolStatus;
  min_contribute: number | string;
  repay_date: string;
  schedule: Schedule;
  repayments: RepaymentRow[];
  card_last4: string;
  invited_ids: string[];
  collect_until: string;
  created_at: string;
  updated_at: string;
};
type ContributionRow = {
  id: string;
  request_id: string;
  contributor_id: string;
  amount: number | string;
  created_at: string;
};

export type SessionUser = { id: string; name: string; email: string; phone: string };

export type AppData = { deals: Deal[]; pools: PoolRequest[]; contacts: Person[] };

/* -------------------------------------------------------------------------------------------
 * Errors
 * ----------------------------------------------------------------------------------------- */

type PgError = { code?: string; message: string };

/** Human readable (Uzbek) explanation of a Supabase / network error. */
export function explainError(error: unknown): string {
  const e = (error ?? {}) as Partial<PgError> & { details?: string; hint?: string };
  const text = `${e.message ?? ""} ${e.details ?? ""} ${e.hint ?? ""}`.toLowerCase();
  if (e.code === "PGRST205" || e.code === "42P01" || text.includes("deal_invitations")) {
    return "deal_invitations jadvali yo'q. Supabase SQL Editor'da supabase/migrations/20261006000000_deal_invitations.sql ni ishga tushiring.";
  }
  if (e.code === "PGRST204" || text.includes("initiator_role")) {
    return "deal_rooms.initiator_role ustuni yo'q. Shu SQL faylini (deal_invitations) ishga tushiring.";
  }
  if (e.code === "23514" || text.includes("deal_rooms_status_check")) {
    return "deal_rooms.status hali 'pending' qiymatini qabul qilmaydi. deal_invitations SQL ni ishga tushiring.";
  }
  if (e.code === "42501" || text.includes("row-level security")) {
    return e.message?.includes("imzoni") ? e.message : "Bu amal uchun ruxsat yo'q (RLS).";
  }
  if (text.includes("failed to fetch")) return "Internetga ulanib bo'lmadi.";
  const detail = [e.code, e.message, e.details].filter(Boolean).join(" · ");
  return detail || "Kutilmagan xatolik yuz berdi.";
}

function must<T>(result: { data: T | null; error: PgError | null }): T {
  if (result.error) throw result.error;
  return (result.data ?? ([] as unknown)) as T;
}

/* -------------------------------------------------------------------------------------------
 * Mapping: rows -> UI models
 * ----------------------------------------------------------------------------------------- */

export function personFromUser(user: UserRow): Person {
  const name = user.full_name?.trim() || user.email?.split("@")[0] || "Foydalanuvchi";
  return {
    id: user.id,
    name,
    phone: user.phone || user.email || "",
    email: user.email ?? "",
    initials: initialsOf(name),
  };
}

export function personFromSession(user: SessionUser): Person {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone || user.email,
    email: user.email,
    initials: initialsOf(user.name),
  };
}

const num = (value: number | string) => Number(value) || 0;

/** "2026-12-15" (a date column) -> local Date. */
function parseDateOnly(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toDateOnly(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function mapMessage(row: MessageRow, meId: string, now = new Date()): ChatMessage {
  const at = new Date(row.created_at);
  const kind: MessageKind | undefined =
    row.kind === "ai" || row.kind === "file" || row.kind === "agreement" || row.kind === "signature"
      ? row.kind
      : undefined;
  return {
    id: row.id,
    author: row.author_name,
    side: row.kind === "system" ? "system" : row.sender_id === meId ? "me" : "them",
    text: row.body,
    time: clock(at),
    day: dayLabel(at, now),
    ...(kind ? { kind } : null),
  };
}

function mapParty(row: ParticipantRow): Party {
  return {
    name: row.name,
    role: row.role,
    signedAt: row.signed_at ? formatUzDate(new Date(row.signed_at)) : null,
    userId: row.user_id,
  };
}

function mapAgreement(row: AgreementRow, parties: Party[]): AgreementDocument {
  return {
    id: row.doc_number,
    title: row.title,
    subject: row.subject,
    issuedAt: formatUzDate(parseDateOnly(row.issued_at)),
    generatedAt: formatUzDateTime(new Date(row.generated_at)),
    parties,
    clauses: row.clauses ?? [],
  };
}

function mapInvitation(row: InvitationRow): DealInvitation {
  return {
    id: row.id,
    email: row.invited_email,
    userId: row.invited_user_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

function buildDeal(
  room: DealRoomRow,
  participants: ParticipantRow[],
  messages: MessageRow[],
  agreement: AgreementRow | undefined,
  invitation: InvitationRow | undefined,
  meId: string,
  meEmail: string,
  now: Date,
): Deal {
  const parties = [...participants].sort((a, b) => a.position - b.position).map(mapParty);
  const others = parties.filter((p) => p.userId !== meId).map((p) => p.name);
  const incoming =
    Boolean(invitation) &&
    invitation!.status === "pending" &&
    room.created_by !== meId &&
    (invitation!.invited_user_id === meId || invitation!.invited_email.toLowerCase() === meEmail.toLowerCase());
  return {
    id: room.id,
    title: room.title,
    counterparty: others.join(", ") || room.counterparty || invitation?.invited_email || "",
    kind: room.kind,
    status: room.status,
    updatedAt: stampLabel(new Date(room.updated_at), now),
    parties,
    messages: incoming ? [] : messages.map((m) => mapMessage(m, meId, now)),
    agreement: incoming ? null : agreement ? mapAgreement(agreement, parties) : null,
    createdBy: room.created_by,
    initiatorRole: room.initiator_role ?? null,
    invitation: invitation ? mapInvitation(invitation) : null,
    incomingInvite: incoming,
  };
}

function buildPool(
  row: PoolRow,
  contributions: ContributionRow[],
  person: (id: string) => Person,
  meId: string,
  now: Date,
): PoolRequest {
  const amount = num(row.amount);
  const sorted = [...contributions].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const contributors: Contributor[] = sorted.map((c) => {
    const at = new Date(c.created_at);
    return { id: c.id, person: person(c.contributor_id), amount: num(c.amount), date: formatUzDate(at), relative: relativeLabel(at, now) };
  });
  const collected = contributors.reduce((sum, c) => sum + c.amount, 0);
  const repayDay = parseDateOnly(row.repay_date);
  const repayEnd = new Date(repayDay.getFullYear(), repayDay.getMonth(), repayDay.getDate() + 1);

  const activity: Activity[] = contributors.map((c) => ({
    id: c.id as string,
    text: `${firstName(c.person.name)} ${formatMoney(c.amount, row.currency)} qo'shdi`,
    time: c.relative,
    mine: c.person.id === meId,
  }));
  if (collected >= amount && contributors[0]) {
    activity.unshift({ id: `full-${row.id}`, text: "Maqsad yig'ildi! 🎉", time: contributors[0].relative });
  }
  if (row.status === "completed") {
    activity.unshift({ id: `done-${row.id}`, text: "Qarz to'liq qaytarildi", time: relativeLabel(new Date(row.updated_at), now) });
  }
  activity.push({ id: `created-${row.id}`, text: "So'rov yaratildi", time: relativeLabel(new Date(row.created_at), now) });

  return {
    id: row.id,
    borrower: person(row.borrower_id),
    isMine: row.borrower_id === meId,
    amount,
    collected,
    currency: row.currency,
    purpose: row.purpose,
    description: row.description,
    daysLeft: row.status === "collecting" ? daysUntil(new Date(row.collect_until), now) : 0,
    repayOverdue: row.status !== "completed" && repayEnd.getTime() < now.getTime(),
    status: row.status,
    contributors,
    invited: (row.invited_ids ?? []).map(person),
    repayDate: formatUzDate(repayDay),
    repayIso: toDateOnly(repayDay),
    schedule: row.schedule,
    repayments: row.repayments ?? [],
    activity,
    minContribute: num(row.min_contribute),
    createdAt: formatUzDate(new Date(row.created_at)),
    cardLast4: row.card_last4,
  };
}

/* -------------------------------------------------------------------------------------------
 * Reading
 * ----------------------------------------------------------------------------------------- */

const PAGE = 1000;

/** PostgREST caps a response at 1000 rows; walk the pages. */
async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: PgError | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; from < PAGE * 20; from += PAGE) {
    const chunk = must(await page(from, from + PAGE - 1));
    rows.push(...chunk);
    if (chunk.length < PAGE) break;
  }
  return rows;
}

function groupBy<T>(rows: T[], key: (row: T) => string) {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = key(row);
    const list = map.get(k);
    if (list) list.push(row);
    else map.set(k, [row]);
  }
  return map;
}

/** Everything the signed-in user can see (Row Level Security does the filtering). */
export async function fetchAppData(sb: SupabaseClient, me: SessionUser): Promise<AppData> {
  const [users, rooms, participants, messages, agreements, pools, contributions, invitations] = await Promise.all([
    sb.from("users").select("id, full_name, email, phone").then((r) => must<UserRow[]>(r)),
    sb.from("deal_rooms").select("*").order("updated_at", { ascending: false }).then((r) => must<DealRoomRow[]>(r)),
    sb.from("deal_participants").select("*").then((r) => must<ParticipantRow[]>(r)),
    fetchAllRows<MessageRow>((from, to) =>
      sb.from("messages").select("*").order("created_at", { ascending: true }).order("id").range(from, to),
    ),
    sb.from("agreements").select("*").then((r) => must<AgreementRow[]>(r)),
    sb.from("pool_qarz_requests").select("*").order("updated_at", { ascending: false }).then((r) => must<PoolRow[]>(r)),
    fetchAllRows<ContributionRow>((from, to) =>
      sb.from("pool_qarz_contributions").select("*").order("created_at", { ascending: true }).order("id").range(from, to),
    ),
    sb.from("deal_invitations").select("*").order("created_at", { ascending: false }).then((r) => {
      // Missing table / RLS must not wipe the deal list — that was making new pending chats vanish.
      if (r.error) {
        console.warn("[fetchAppData] deal_invitations:", r.error.code, r.error.message);
        return [] as InvitationRow[];
      }
      return (r.data ?? []) as InvitationRow[];
    }),
  ]);

  const now = new Date();
  const people = new Map(users.map((u) => [u.id, personFromUser(u)]));
  const person = (id: string): Person => people.get(id) ?? { id, name: "Foydalanuvchi", phone: "", initials: "?" };

  const partsByDeal = groupBy(participants, (p) => p.deal_id);
  const msgsByDeal = groupBy(messages, (m) => m.deal_id);
  const agreementByDeal = new Map(agreements.map((a) => [a.deal_id, a]));
  const contribByPool = groupBy(contributions, (c) => c.request_id);
  const inviteByDeal = new Map<string, InvitationRow>();
  for (const inv of invitations) {
    const prev = inviteByDeal.get(inv.deal_room_id);
    if (!prev || inv.created_at > prev.created_at) inviteByDeal.set(inv.deal_room_id, inv);
  }

  return {
    deals: rooms.map((room) =>
      buildDeal(
        room,
        partsByDeal.get(room.id) ?? [],
        msgsByDeal.get(room.id) ?? [],
        agreementByDeal.get(room.id),
        inviteByDeal.get(room.id),
        me.id,
        me.email,
        now,
      ),
    ),
    pools: pools.map((row) => buildPool(row, contribByPool.get(row.id) ?? [], person, me.id, now)),
    contacts: users.filter((u) => u.id !== me.id).map(personFromUser).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** Just the contact list (people you can start a chat or a pool with). */
export async function fetchContacts(sb: SupabaseClient, me: SessionUser): Promise<Person[]> {
  const users = must<UserRow[]>(await sb.from("users").select("id, full_name, email, phone"));
  return users.filter((u) => u.id !== me.id).map(personFromUser).sort((a, b) => a.name.localeCompare(b.name));
}

/* -------------------------------------------------------------------------------------------
 * Writing — deals
 * ----------------------------------------------------------------------------------------- */

function messageRow(message: ChatMessage, dealId: string, meId: string, createdAt: Date) {
  return {
    id: message.id,
    deal_id: dealId,
    sender_id: message.side === "me" ? meId : null,
    author_name: message.author,
    kind: message.side === "system" ? "system" : (message.kind ?? "text"),
    body: message.text,
    created_at: createdAt.toISOString(),
  };
}

function check(result: { error: PgError | null }) {
  if (result.error) throw result.error;
}

/** Creates a deal room with its participants, first messages and (optionally) a pending invitation. */
export async function insertDeal(sb: SupabaseClient, me: SessionUser, deal: Deal) {
  const payload = {
    id: deal.id,
    title: deal.title,
    status: deal.status,
    initiatorRole: deal.initiatorRole ?? null,
    inviteEmail: deal.invitation?.email ?? null,
  };
  console.log("[insertDeal] start", payload);

  const roomFull = {
    id: deal.id,
    title: deal.title,
    counterparty: deal.counterparty,
    kind: deal.kind ?? "kelishuv",
    status: deal.status,
    created_by: me.id,
    initiator_role: deal.initiatorRole ?? null,
  };
  let room = await sb.from("deal_rooms").insert(roomFull);
  if (room.error) {
    console.error("[insertDeal] deal_rooms (full) failed:", room.error.code, room.error.message, room.error.details);
    // Schema not migrated yet: still persist the room so it does not vanish from the list.
    const fallbackStatus = deal.status === "pending" || deal.status === "rejected" ? "discussion" : deal.status;
    room = await sb.from("deal_rooms").insert({
      id: deal.id,
      title: deal.title,
      counterparty: deal.counterparty,
      kind: deal.kind ?? "kelishuv",
      status: fallbackStatus,
      created_by: me.id,
    });
    if (room.error) {
      console.error("[insertDeal] deal_rooms (fallback) failed:", room.error.code, room.error.message);
      throw room.error;
    }
    console.warn("[insertDeal] room saved without pending/initiator_role — run 20261006000000_deal_invitations.sql");
  } else {
    console.log("[insertDeal] deal_rooms saved", deal.id, deal.status);
  }

  const parts = await sb.from("deal_participants").insert(
    deal.parties.map((party, position) => ({
      deal_id: deal.id,
      user_id: party.userId ?? null,
      name: party.name,
      role: party.role,
      position,
      signed_at: null,
    })),
  );
  if (parts.error) {
    console.error("[insertDeal] participants failed:", parts.error);
    throw parts.error;
  }

  if (deal.messages.length) {
    const base = Date.now();
    const msgs = await sb
      .from("messages")
      .insert(deal.messages.map((m, i) => messageRow(m, deal.id, me.id, new Date(base + i))));
    if (msgs.error) {
      console.error("[insertDeal] messages failed:", msgs.error);
      throw msgs.error;
    }
  }

  if (deal.invitation) {
    const email = deal.invitation.email.trim().toLowerCase();
    const { data: match, error: lookupError } = await sb.from("users").select("id").ilike("email", email).maybeSingle();
    if (lookupError) console.warn("[insertDeal] email lookup:", lookupError.message);
    const inviteRow = {
      id: deal.invitation.id,
      deal_room_id: deal.id,
      invited_email: email,
      invited_user_id: match?.id ?? deal.invitation.userId ?? null,
      status: "pending" as const,
    };
    console.log("[insertDeal] writing invitation", inviteRow);
    const inv = await sb.from("deal_invitations").insert(inviteRow);
    if (inv.error) {
      console.error("[insertDeal] invitation failed:", inv.error.code, inv.error.message, inv.error.details);
      throw inv.error;
    }
    console.log("[insertDeal] invitation saved", email);
  }
}

/** Invitee accepts or rejects. The database function adds them as a participant on accept. */
export async function respondToInvitation(sb: SupabaseClient, invitationId: string, accept: boolean) {
  check(await sb.rpc("respond_to_deal_invitation", { p_invite: invitationId, p_accept: accept }));
}

/** After a rejection, the initiator can send the invite to a (possibly different) email. */
export async function resendInvitation(sb: SupabaseClient, dealId: string, email: string) {
  const trimmed = email.trim().toLowerCase();
  const { data: match } = await sb.from("users").select("id").ilike("email", trimmed).maybeSingle();
  check(await sb.from("deal_rooms").update({ status: "pending", counterparty: trimmed }).eq("id", dealId));
  check(
    await sb.from("deal_invitations").insert({
      deal_room_id: dealId,
      invited_email: trimmed,
      invited_user_id: match?.id ?? null,
      status: "pending",
    }),
  );
}

/** Persists the difference between two versions of one deal (new/removed messages, agreement, signatures, status). */
export async function saveDealChange(sb: SupabaseClient, me: SessionUser, prev: Deal, next: Deal) {
  const prevIds = new Set(prev.messages.map((m) => m.id));
  const nextIds = new Set(next.messages.map((m) => m.id));
  const removed = prev.messages.filter((m) => !nextIds.has(m.id)).map((m) => m.id);
  const added = next.messages.filter((m) => !prevIds.has(m.id));

  if (removed.length) check(await sb.from("messages").delete().in("id", removed));

  if (next.agreement) {
    const before = prev.agreement;
    const documentChanged =
      !before ||
      before.id !== next.agreement.id ||
      JSON.stringify(before.clauses) !== JSON.stringify(next.agreement.clauses);
    if (documentChanged) {
      check(
        await sb.from("agreements").upsert(
          {
            deal_id: next.id,
            doc_number: next.agreement.id,
            title: next.agreement.title,
            subject: next.agreement.subject,
            clauses: next.agreement.clauses,
            parties: next.agreement.parties.map(({ name, role, userId }) => ({ name, role, userId: userId ?? null })),
            issued_at: toDateOnly(new Date()),
            generated_at: new Date().toISOString(),
            created_by: me.id,
          },
          { onConflict: "deal_id" },
        ),
      );
    }
  }

  // Signatures: parties are stored in participant order, so the index is the participant position.
  for (let i = 0; i < next.parties.length; i += 1) {
    const was = Boolean(prev.parties[i]?.signedAt);
    const now = Boolean(next.parties[i].signedAt);
    if (was !== now) {
      check(
        await sb
          .from("deal_participants")
          .update({ signed_at: now ? new Date().toISOString() : null })
          .eq("deal_id", next.id)
          .eq("position", i),
      );
    }
  }

  if (next.status !== prev.status) {
    check(await sb.from("deal_rooms").update({ status: next.status }).eq("id", next.id));
  }

  if (added.length) {
    const base = Date.now();
    check(await sb.from("messages").insert(added.map((m, i) => messageRow(m, next.id, me.id, new Date(base + i)))));
  }
}

/* -------------------------------------------------------------------------------------------
 * Writing — Pool Qarz
 * ----------------------------------------------------------------------------------------- */

export async function insertPool(sb: SupabaseClient, me: SessionUser, pool: PoolRequest) {
  check(
    await sb.from("pool_qarz_requests").insert({
      id: pool.id,
      borrower_id: me.id,
      amount: pool.amount,
      currency: pool.currency,
      purpose: pool.purpose,
      description: pool.description,
      status: pool.status,
      min_contribute: pool.minContribute,
      repay_date: pool.repayIso,
      schedule: pool.schedule,
      repayments: pool.repayments,
      card_last4: pool.cardLast4,
      invited_ids: pool.invited.map((p) => p.id),
    }),
  );
}

/** Persists new contributions of the signed-in user. The database closes the request when it is full. */
export async function savePoolChange(sb: SupabaseClient, me: SessionUser, prev: PoolRequest, next: PoolRequest) {
  const known = new Set(prev.contributors.map((c) => c.id));
  const fresh = next.contributors.filter((c) => c.id && !known.has(c.id) && c.person.id === me.id);
  if (fresh.length) {
    check(
      await sb
        .from("pool_qarz_contributions")
        .insert(fresh.map((c) => ({ id: c.id, request_id: next.id, contributor_id: me.id, amount: c.amount }))),
    );
  }
}
