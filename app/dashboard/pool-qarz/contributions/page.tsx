"use client";

import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { useApp } from "@/components/app-store";
import { EmptyNote } from "@/components/chat-ui";
import { PageFrame } from "@/components/page-frame";
import {
  RETURN_STATUS_LABEL,
  formatMoney,
  myContributions,
  type ContributionReturnStatus,
} from "@/lib/pool-qarz";

const styles: Record<ContributionReturnStatus, string> = {
  pending: "bg-[#F6E6D8] text-[#8F5430]",
  returned: "bg-[#E8EEDC] text-[#5A6B38]",
  overdue: "bg-[#F6E4DC] text-[#8F4E3A]",
};

export default function ContributionsPage() {
  const { pools, me } = useApp();
  const items = myContributions(pools, me.id);

  return (
    <PageFrame title="Qo'shganlarim" subtitle="Qarz bergan pool so'rovlaringiz" back="/dashboard/pool-qarz">
      {items.length === 0 ? (
        <EmptyNote emoji="💸">Hali hech narsa qo&apos;shmagansiz.</EmptyNote>
      ) : (
        <ul className="-mx-2">
          {items.map((item, index) => (
            <li key={`${item.poolId}-${index}`}>
              <Link
                href={`/dashboard/pool-qarz/${item.poolId}`}
                className="flex items-center gap-3 rounded-[10px] px-2 py-3 hover:bg-hov"
              >
                <Avatar initials={item.borrower.initials} size="xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink">{item.borrower.name}</span>
                  <span className="block truncate text-[13px] text-ink2">
                    {item.purpose} · qaytish: {item.expectedReturn}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[14px] font-medium text-ink">{formatMoney(item.myAmount, item.currency)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-medium ${styles[item.status]}`}>
                    {RETURN_STATUS_LABEL[item.status]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageFrame>
  );
}
