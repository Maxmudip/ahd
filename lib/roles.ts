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
