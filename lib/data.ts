import type { SupabaseClient } from "@supabase/supabase-js";
import { initialsOf } from "@/lib/chat-helpers";
import {
  formatUzDate,
  formatUzDateTime,
  type AgreementDocument,
  type ChatMessage,
  type Clause,
  type Deal,
  type DealInvitation,
  type DealKind,
  type CompletionReason,
  type CompletionStatus,
  type DealStatus,
  type InitiatorRole,
  type InviteStatus,
  type MessageKind,
  type Party,
  type RatingReview,
} from "@/lib/deals";
import type { Person } from "@/lib/people";
import { clock, dayLabel, stampLabel } from "@/lib/time-labels";

/* -------------------------------------------------------------------------------------------
 * Database rows (see supabase/migrations/*.sql)
 * ----------------------------------------------------------------------------------------- */

type UserRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avg_rating?: number | string | null;
  total_deals?: number | null;
  total_ratings?: number | null;
};
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
  completion_reason?: CompletionReason | null;
  completion_requested_by?: string | null;
  completion_status?: CompletionStatus | null;
  completed_at?: string | null;
  disputed_at?: string | null;
  archived?: boolean;
};
type RatingRow = {
  id: string;
  deal_room_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
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
  kind: "text" | "ai" | "file" | "agreement" | "signature" | "system" | "completion" | "mojaro";
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

export type SessionUser = { id: string; name: string; email: string; phone: string };

export type AppData = {
  deals: Deal[];
  contacts: Person[];
  reviews: RatingReview[];
  meStats: { avgRating: number | null; totalDeals: number; totalRatings: number };
};

/* -------------------------------------------------------------------------------------------
 * Errors
 * ----------------------------------------------------------------------------------------- */

type PgError = { code?: string; message: string };

/** Human readable (Uzbek) explanation of a Supabase / network error. */
export function explainError(error: unknown): string {
  const e = (error ?? {}) as Partial<PgError> & { details?: string; hint?: string };
  const text = `${e.message ?? ""} ${e.details ?? ""} ${e.hint ?? ""}`.toLowerCase();
  if (text.includes("find_user_by_email") || text.includes("add_contact_pair")) {
    return "Kontakt qo'shish uchun supabase/migrations/20261006040000_add_contact_by_email.sql ni ishga tushiring.";
  }
  if ((e.code === "PGRST205" || e.code === "42P01") && text.includes("contacts")) {
    return "contacts jadvali yo'q. supabase/migrations/20261006030000_contacts.sql ni ishga tushiring.";
  }
  if (e.code === "PGRST205" || e.code === "42P01" || text.includes("deal_invitations")) {
    return "deal_invitations jadvali yo'q. Supabase SQL Editor'da supabase/migrations/20261006000000_deal_invitations.sql ni ishga tushiring.";
  }
  if (e.code === "PGRST204" || text.includes("initiator_role")) {
    return "deal_rooms.initiator_role ustuni yo'q. Shu SQL faylini (deal_invitations) ishga tushiring.";
  }
  if (text.includes("archived") && (e.code === "PGRST204" || e.code === "42703")) {
    return "deal_rooms.archived ustuni yo'q. supabase/migrations/20261006020000_deal_archive.sql ni ishga tushiring.";
  }
  if (e.code === "PGRST205" || e.code === "42P01" || text.includes("ratings")) {
    return "ratings jadvali yo'q. Supabase SQL Editor'da supabase/migrations/20261006010000_deal_close_ratings.sql ni ishga tushiring.";
  }
  if (e.code === "23514" && text.includes("messages_kind_check")) {
    return "messages.kind hali 'completion'/'mojaro' qabul qilmaydi. deal_close_ratings SQL ni ishga tushiring.";
  }
  if (e.code === "23514" || text.includes("deal_rooms_status_check")) {
    return "deal_rooms.status yangi qiymatlarni qabul qilmaydi. deal_invitations va deal_close_ratings SQL ni ishga tushiring.";
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
    avgRating: user.avg_rating == null || user.avg_rating === "" ? null : Number(user.avg_rating),
    totalDeals: user.total_deals ?? 0,
    totalRatings: user.total_ratings ?? 0,
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
    row.kind === "ai" ||
    row.kind === "file" ||
    row.kind === "agreement" ||
    row.kind === "signature" ||
    row.kind === "completion" ||
    row.kind === "mojaro"
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
  ratedByMe: boolean,
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
    completionReason: room.completion_reason ?? null,
    completionRequestedBy: room.completion_requested_by ?? null,
    completionStatus: room.completion_status ?? null,
    completedAt: room.completed_at ? formatUzDate(new Date(room.completed_at)) : null,
    disputedAt: room.disputed_at ? formatUzDate(new Date(room.disputed_at)) : null,
    ratedByMe,
    archived: Boolean(room.archived),
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

/** People in my contacts list — never the whole user directory. */
async function fetchOwnedContactUsers(sb: SupabaseClient, meId: string): Promise<UserRow[]> {
  const owned = await sb.from("contacts").select("contact_user_id").eq("user_id", meId);
  if (owned.error) {
    console.warn("[contacts] query failed:", owned.error.code, owned.error.message);
    return [];
  }
  const ids = [...new Set((owned.data ?? []).map((row) => row.contact_user_id as string).filter(Boolean))];
  if (ids.length === 0) return [];
  const profiles = await sb.from("users").select("*").in("id", ids);
  if (profiles.error) {
    console.warn("[contacts] profiles failed:", profiles.error.code, profiles.error.message);
    return [];
  }
  return (profiles.data ?? []) as UserRow[];
}

/** Everything the signed-in user can see (Row Level Security does the filtering). */
export async function fetchAppData(sb: SupabaseClient, me: SessionUser): Promise<AppData> {
  const [mine, contactUsers, rooms, participants, messages, agreements, invitations, ratings] = await Promise.all([
    sb.from("users").select("*").eq("id", me.id).then((r) => must<UserRow[]>(r)),
    fetchOwnedContactUsers(sb, me.id),
    sb.from("deal_rooms").select("*").order("updated_at", { ascending: false }).then((r) => must<DealRoomRow[]>(r)),
    sb.from("deal_participants").select("*").then((r) => must<ParticipantRow[]>(r)),
    fetchAllRows<MessageRow>((from, to) =>
      sb.from("messages").select("*").order("created_at", { ascending: true }).order("id").range(from, to),
    ),
    sb.from("agreements").select("*").then((r) => must<AgreementRow[]>(r)),
    sb.from("deal_invitations").select("*").order("created_at", { ascending: false }).then((r) => {
      // Missing table / RLS must not wipe the deal list — that was making new pending chats vanish.
      if (r.error) {
        console.warn("[fetchAppData] deal_invitations:", r.error.code, r.error.message);
        return [] as InvitationRow[];
      }
      return (r.data ?? []) as InvitationRow[];
    }),
    sb.from("ratings").select("*").order("created_at", { ascending: false }).then((r) => {
      if (r.error) {
        console.warn("[fetchAppData] ratings:", r.error.code, r.error.message);
        return [] as RatingRow[];
      }
      return (r.data ?? []) as RatingRow[];
    }),
  ]);

  const users = [...mine, ...contactUsers.filter((u) => u.id !== me.id)];
  const now = new Date();
  const people = new Map(users.map((u) => [u.id, personFromUser(u)]));
  const person = (id: string): Person => people.get(id) ?? { id, name: "Foydalanuvchi", phone: "", initials: "?" };

  const partsByDeal = groupBy(participants, (p) => p.deal_id);
  const msgsByDeal = groupBy(messages, (m) => m.deal_id);
  const agreementByDeal = new Map(agreements.map((a) => [a.deal_id, a]));
  const inviteByDeal = new Map<string, InvitationRow>();
  for (const inv of invitations) {
    const prev = inviteByDeal.get(inv.deal_room_id);
    if (!prev || inv.created_at > prev.created_at) inviteByDeal.set(inv.deal_room_id, inv);
  }

  const ratedDeals = new Set(ratings.filter((r) => r.rater_id === me.id).map((r) => r.deal_room_id));
  const meRow = users.find((u) => u.id === me.id);
  const mePerson = meRow ? personFromUser(meRow) : null;

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
        ratedDeals.has(room.id),
      ),
    ),
    contacts: contactUsers
      .filter((u) => u.id !== me.id)
      .map(personFromUser)
      .sort((a, b) => a.name.localeCompare(b.name)),
    reviews: ratings
      .filter((r) => r.rated_id === me.id)
      .map((r) => {
        const rater = person(r.rater_id);
        return {
          id: r.id,
          dealId: r.deal_room_id,
          raterId: r.rater_id,
          raterName: rater.name,
          rating: r.rating,
          comment: r.comment ?? "",
          createdAt: r.created_at,
          dateLabel: formatUzDate(new Date(r.created_at)),
        };
      }),
    meStats: {
      avgRating: mePerson?.avgRating ?? null,
      totalDeals: mePerson?.totalDeals ?? 0,
      totalRatings: mePerson?.totalRatings ?? 0,
    },
  };
}

/** Just the contact list (people you can start a chat with). */
export async function fetchContacts(sb: SupabaseClient, me: SessionUser): Promise<Person[]> {
  const users = await fetchOwnedContactUsers(sb, me.id);
  return users.filter((u) => u.id !== me.id).map(personFromUser).sort((a, b) => a.name.localeCompare(b.name));
}

type FoundUserRow = { id: string; full_name: string; email: string | null; phone: string | null };

/** Look up a registered user by exact email. Does not list the directory. */
export async function findUserByEmail(sb: SupabaseClient, email: string): Promise<Person | null> {
  const { data, error } = await sb.rpc("find_user_by_email", { p_email: email.trim().toLowerCase() });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as FoundUserRow | null;
  if (!row?.id) return null;
  return personFromUser({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
  });
}

/**
 * Adds a contact for the signed-in user and the reverse row so both lists update.
 * Own row: contacts.user_id = me, contacts.contact_user_id = them.
 */
export async function addContact(sb: SupabaseClient, meId: string, contactUserId: string) {
  if (meId === contactUserId) {
    throw new Error("O'zingizni kontaktga qo'sha olmaysiz.");
  }
  const own = await sb.from("contacts").insert({ user_id: meId, contact_user_id: contactUserId });
  if (own.error && own.error.code !== "23505") throw own.error;
  const reverse = await sb.rpc("add_contact_pair", { a: meId, b: contactUserId });
  if (reverse.error) throw reverse.error;
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

  const closeChanged =
    next.status !== prev.status ||
    next.completionReason !== prev.completionReason ||
    next.completionRequestedBy !== prev.completionRequestedBy ||
    next.completionStatus !== prev.completionStatus;
  if (closeChanged) {
    const room = await sb
      .from("deal_rooms")
      .update({
        status: next.status,
        completion_reason: next.completionReason ?? null,
        completion_requested_by: next.completionRequestedBy ?? null,
        completion_status: next.completionStatus ?? null,
        completed_at: next.status === "completed" && prev.status !== "completed" ? new Date().toISOString() : undefined,
        disputed_at: next.status === "disputed" && prev.status !== "disputed" ? new Date().toISOString() : undefined,
      })
      .eq("id", next.id);
    if (room.error) {
      console.warn("[saveDealChange] room close fields failed, status only:", room.error.message);
      check(await sb.from("deal_rooms").update({ status: next.status }).eq("id", next.id));
    }
  }

  if (Boolean(next.archived) !== Boolean(prev.archived)) {
    const archived = await sb.from("deal_rooms").update({ archived: Boolean(next.archived) }).eq("id", next.id);
    if (archived.error) {
      console.warn("[saveDealChange] archived column missing — run 20261006020000_deal_archive.sql");
    }
  }

  if (added.length) {
    const base = Date.now();
    check(await sb.from("messages").insert(added.map((m, i) => messageRow(m, next.id, me.id, new Date(base + i)))));
  }
}

export async function deleteDealRoom(sb: SupabaseClient, me: SessionUser, dealId: string) {
  const result = await sb.from("deal_rooms").delete().eq("id", dealId).eq("created_by", me.id);
  check(result);
}

export async function insertRating(
  sb: SupabaseClient,
  me: SessionUser,
  input: { dealId: string; ratedId: string; rating: number; comment: string },
) {
  check(
    await sb.from("ratings").insert({
      deal_room_id: input.dealId,
      rater_id: me.id,
      rated_id: input.ratedId,
      rating: input.rating,
      comment: input.comment.trim(),
    }),
  );
}
