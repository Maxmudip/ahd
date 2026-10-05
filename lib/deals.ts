export type DealStatus = "draft" | "pending" | "rejected" | "discussion" | "signing" | "completed";

export type InitiatorRole = "mijoz" | "ijrochi" | "qarz_beruvchi" | "qarz_oluvchi";

export type InviteStatus = "pending" | "accepted" | "rejected";

export type DealInvitation = {
  id: string;
  email: string;
  userId: string | null;
  status: InviteStatus;
  createdAt: string;
};

/** Chat is open for both parties. Pending/rejected invitations have no chat. */
export function isDealActive(status: DealStatus) {
  return status === "discussion" || status === "signing" || status === "completed";
}

export type Party = {
  name: string;
  role: string;
  signedAt: string | null;
  /** Ahd user behind this party; null for external parties (company / phone without an account). */
  userId?: string | null;
};

export type MessageKind = "agreement" | "signature" | "file" | "ai";

export type ChatMessage = {
  id: string;
  author: string;
  side: "me" | "them" | "system";
  text: string;
  time: string;
  /** Special card types rendered inside the chat. */
  kind?: MessageKind;
  /** Day label used for date dividers ("Bugun", "Kecha", "12-sent"). */
  day?: string;
};

export type DealKind = "kelishuv" | "qarz";

export const DEAL_KIND_LABEL: Record<DealKind, string> = {
  kelishuv: "Kelishuv",
  qarz: "Qarz",
};

export type Clause = {
  number: string;
  title: string;
  body: string;
};

export type AgreementDocument = {
  id: string;
  title: string;
  subject: string;
  issuedAt: string;
  generatedAt: string;
  parties: Party[];
  clauses: Clause[];
};

export type Deal = {
  id: string;
  title: string;
  counterparty: string;
  kind?: DealKind;
  status: DealStatus;
  updatedAt: string;
  parties: Party[];
  messages: ChatMessage[];
  agreement: AgreementDocument | null;
  createdBy?: string;
  initiatorRole?: InitiatorRole | null;
  invitation?: DealInvitation | null;
  /** True when this row is an incoming invite the signed-in user has not answered yet. */
  incomingInvite?: boolean;
};

export const STATUS_LABEL: Record<DealStatus, string> = {
  draft: "Qoralama",
  pending: "Kutilmoqda",
  rejected: "Rad etildi",
  discussion: "Muhokama",
  signing: "Imzolash",
  completed: "Yakunlangan",
};

const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

export function formatUzDate(date = new Date()) {
  return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function nowTime(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatUzDateTime(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${formatUzDate(date)}, ${hh}:${mm}`;
}

export function documentIdForDeal(dealId: string) {
  const digits = dealId.replace(/\D/g, "");
  const serial = (digits.slice(-4) || "0001").padStart(4, "0");
  return `AHD-${new Date().getFullYear()}-${serial}`;
}

export function buildAgreementFromDeal(deal: Deal): AgreementDocument {
  const now = new Date();
  const parties = deal.parties.map((p) => ({ ...p, signedAt: null }));

  return {
    id: documentIdForDeal(deal.id),
    title: "KELISHUV SHARTNOMASI",
    subject: deal.title,
    issuedAt: formatUzDate(now),
    generatedAt: formatUzDateTime(now),
    parties,
    clauses: [
      {
        number: "1",
        title: "Tomonlar",
        body: `Ushbu shartnoma ${parties.map((p) => `${p.role} ${p.name}`).join(" va ")} o'rtasida tuziladi. Tomonlar o'z huquqiy vakolatlarini tasdiqlaydilar.`,
      },
      {
        number: "2",
        title: "Predmet",
        body: `Tomonlar "${deal.title}" bo'yicha o'zaro majburiyatlarni chat muhokamasi asosida belgiladilar. Ushbu hujjat muzokara natijasini rasmiylashtiradi.`,
      },
      {
        number: "3",
        title: "Kelishilgan shartlar",
        body: "Shartlar muhokama jarayonida aniqlashtiriladi va tomonlarning yozma roziligi bilan kiritiladi. [ANIQLANISHI KERAK]",
      },
      {
        number: "4",
        title: "Imzo va kuchga kirish",
        body: "Hujjat tomonlarning raqamli imzosi qo'yilgan kundan kuchga kiradi. Har bir tomon mustaqil ravishda imzolaydi.",
      },
      {
        number: "5",
        title: "Yakuniy qoidalar",
        body: "Nizolar muzokara yo'li bilan hal etiladi. Hujjat Ahd platformasida tuzilgan qoralama hisoblanadi va yuridik maslahat o'rnini bosmaydi.",
      },
    ],
  };
}
