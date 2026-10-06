import type { DealKind, InitiatorRole } from "@/lib/deals";

export const ROLE_LABEL: Record<InitiatorRole, string> = {
  mijoz: "Mijoz",
  ijrochi: "Ijrochi",
  qarz_beruvchi: "Qarz beruvchi",
  qarz_oluvchi: "Qarz oluvchi",
};

export const COUNTERPART_ROLE: Record<InitiatorRole, InitiatorRole> = {
  mijoz: "ijrochi",
  ijrochi: "mijoz",
  qarz_beruvchi: "qarz_oluvchi",
  qarz_oluvchi: "qarz_beruvchi",
};

export const ROLES_FOR_KIND: Record<DealKind, { id: InitiatorRole; emoji: string; title: string; sub: string }[]> = {
  kelishuv: [
    { id: "mijoz", emoji: "💼", title: "Mijoz", sub: "Men xizmat yoki ish buyurtma qilaman" },
    { id: "ijrochi", emoji: "🔧", title: "Ijrochi", sub: "Men xizmat yoki ish bajaraman" },
  ],
  qarz: [
    { id: "qarz_beruvchi", emoji: "💰", title: "Qarz beruvchi", sub: "Men pul beraman" },
    { id: "qarz_oluvchi", emoji: "🤲", title: "Qarz oluvchi", sub: "Men pul olaman" },
  ],
};

export function rolesForKind(kind: DealKind) {
  return ROLES_FOR_KIND[kind];
}

export function isRoleForKind(kind: DealKind, role: InitiatorRole) {
  return ROLES_FOR_KIND[kind].some((r) => r.id === role);
}

export const ROLE_EMOJI: Record<InitiatorRole, string> = {
  mijoz: "💼",
  ijrochi: "🔧",
  qarz_beruvchi: "💰",
  qarz_oluvchi: "🤲",
};

export type RoleView = { id: InitiatorRole | null; label: string; emoji: string };

export type DealRoleSource = {
  createdBy?: string;
  initiatorRole?: InitiatorRole | null;
  counterparty?: string;
  parties: { name: string; role: string; userId?: string | null; signedAt?: string | null }[];
};

export type LabeledParty = {
  name: string;
  signedAt?: string | null;
  userId?: string | null;
  letter: string;
  role: RoleView;
  tomonLine: string;
  signedAs: string;
};

export function labeledParties(deal: DealRoleSource): LabeledParty[] {
  return deal.parties.map((party, index) => {
    const role = partyRole(deal, party, index);
    const letter = String.fromCharCode(65 + index);
    return {
      name: party.name,
      signedAt: party.signedAt,
      userId: party.userId,
      letter,
      role,
      tomonLine: `Tomon ${letter} — ${role.label}: ${party.name}`,
      signedAs: `${party.name} (${role.label})`,
    };
  });
}

const GENERIC_ROLE = /^(tomon\s*[ab]|tomon)$/i;

/** Maps a stored `deal_participants.role` (Uzbek label or id) to a display label + emoji. */
export function parseStoredRole(role: string | null | undefined): RoleView | null {
  const raw = role?.trim();
  if (!raw || GENERIC_ROLE.test(raw)) return null;
  const compact = raw.toLowerCase().replace(/\s+/g, "_");
  for (const id of Object.keys(ROLE_LABEL) as InitiatorRole[]) {
    if (id === compact || ROLE_LABEL[id].toLowerCase() === raw.toLowerCase()) {
      return { id, label: ROLE_LABEL[id], emoji: ROLE_EMOJI[id] };
    }
  }
  return { id: null, label: raw, emoji: "" };
}

/**
 * Role for one party: prefer `deal_participants.role`, then initiator_role + created_by
 * (so older rooms that still say "Tomon A" still show Mijoz / Ijrochi).
 */
export function partyRole(
  deal: DealRoleSource,
  party: { name: string; role: string; userId?: string | null },
  index: number,
): RoleView {
  const stored = parseStoredRole(party.role);
  if (stored) return stored;
  const initiator = deal.initiatorRole;
  if (initiator) {
    const isInitiator =
      (party.userId && deal.createdBy && party.userId === deal.createdBy) ||
      (!party.userId && index === 0 && !deal.parties.some((p) => p.userId && p.userId === deal.createdBy));
    const id = isInitiator ? initiator : COUNTERPART_ROLE[initiator];
    return { id, label: ROLE_LABEL[id], emoji: ROLE_EMOJI[id] };
  }
  return { id: null, label: party.role || "Tomon", emoji: "" };
}

export function roleForAuthor(deal: DealRoleSource, author: string): RoleView | null {
  const index = deal.parties.findIndex((p) => p.name === author);
  if (index < 0) return null;
  return partyRole(deal, deal.parties[index], index);
}

/** Header chips: "Siz: Mijoz 💼" for me, "Name: Ijrochi 🔧" for others. */
export function dealRolePills(deal: DealRoleSource, meId: string, meName: string): string[] {
  const pills = deal.parties.map((party, index) => {
    const role = partyRole(deal, party, index);
    const text = `${role.label}${role.emoji ? ` ${role.emoji}` : ""}`;
    const mine = party.userId === meId || (!party.userId && party.name === meName);
    return mine ? `Siz: ${text}` : `${party.name}: ${text}`;
  });
  if (pills.length >= 2 || !deal.initiatorRole) return pills;

  const missingId = deal.parties.some((p) => p.userId === deal.createdBy)
    ? COUNTERPART_ROLE[deal.initiatorRole]
    : deal.initiatorRole;
  const missing = `${ROLE_LABEL[missingId]}${ROLE_EMOJI[missingId] ? ` ${ROLE_EMOJI[missingId]}` : ""}`;
  const iAmListed = deal.parties.some((p) => p.userId === meId || (!p.userId && p.name === meName));
  if (!iAmListed) {
    pills.unshift(`Siz: ${missing}`);
  } else {
    pills.push(`${deal.counterparty?.trim() || "Qarshi tomon"}: ${missing}`);
  }
  return pills;
}
