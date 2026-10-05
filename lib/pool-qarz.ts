export type Currency = "UZS" | "USD";
export type PoolStatus = "collecting" | "full" | "completed";
export type Schedule = "once" | "monthly";
export type RepaymentStatus = "pending" | "paid";
export type ContributionReturnStatus = "pending" | "returned" | "overdue";

export const POOL_STATUS_LABEL: Record<PoolStatus, string> = {
  collecting: "Yig'ilmoqda",
  full: "To'liq",
  completed: "Yakunlangan",
};

export const RETURN_STATUS_LABEL: Record<ContributionReturnStatus, string> = {
  pending: "Kutilmoqda",
  returned: "Qaytarildi",
  overdue: "Muddati o'tdi",
};

export type Person = {
  id: string;
  name: string;
  phone: string;
  initials: string;
};

export type Contributor = {
  id?: string;
  person: Person;
  amount: number;
  date: string;
  relative: string;
};

export type RepaymentRow = {
  date: string;
  amount: number;
  status: RepaymentStatus;
};

export type Activity = {
  id: string;
  text: string;
  time: string;
  /** True when the signed-in user did it (drives bubble side). */
  mine?: boolean;
};

export type PoolRequest = {
  id: string;
  borrower: Person;
  isMine: boolean;
  amount: number;
  collected: number;
  currency: Currency;
  purpose: string;
  description: string;
  daysLeft: number;
  /** Repay date has passed and the money is not returned yet. */
  repayOverdue?: boolean;
  status: PoolStatus;
  contributors: Contributor[];
  invited: Person[];
  repayDate: string;
  /** repayDate as YYYY-MM-DD (what the database stores). */
  repayIso: string;
  schedule: Schedule;
  repayments: RepaymentRow[];
  activity: Activity[];
  minContribute: number;
  createdAt: string;
  cardLast4: string;
};

export function formatMoney(amount: number, currency: Currency = "UZS") {
  const spaced = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return currency === "USD" ? `${spaced} USD` : `${spaced} so'm`;
}

export function formatAmountInput(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function parseAmountInput(raw: string) {
  return Number(raw.replace(/\s/g, "")) || 0;
}

export function poolProgress(pool: PoolRequest) {
  if (pool.amount <= 0) return 0;
  return Math.min(100, Math.round((pool.collected / pool.amount) * 100));
}

export function pendingFriendRequestCount(pools: PoolRequest[]) {
  return pools.filter((p) => !p.isMine && p.status === "collecting").length;
}

export type MyContribution = {
  poolId: string;
  borrower: Person;
  purpose: string;
  myAmount: number;
  currency: Currency;
  status: ContributionReturnStatus;
  expectedReturn: string;
};

export function myContributions(pools: PoolRequest[], meId: string): MyContribution[] {
  return pools.flatMap((pool) => {
    const mine = pool.contributors.filter((c) => c.person.id === meId);
    if (!mine.length || pool.isMine) return [];
    const status: ContributionReturnStatus =
      pool.status === "completed" ? "returned" : pool.repayOverdue ? "overdue" : "pending";
    return mine.map((c) => ({
      poolId: pool.id,
      borrower: pool.borrower,
      purpose: pool.purpose,
      myAmount: c.amount,
      currency: pool.currency,
      status,
      expectedReturn: pool.repayDate,
    }));
  });
}
