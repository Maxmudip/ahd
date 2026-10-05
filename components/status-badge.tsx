import { STATUS_LABEL, type DealStatus } from "@/lib/deals";

const styles: Record<DealStatus, string> = {
  discussion: "bg-[#F6EFD9] text-[#8A6B2E]",
  signing: "bg-[#F6E6D8] text-[#8F5430]",
  completed: "bg-[#E8EEDC] text-[#5A6B38]",
  draft: "bg-[#F5F4F0] text-[#6E6A62]",
  pending: "bg-[#F6EFD9] text-[#8A6B2E]",
  rejected: "bg-[#FDEBEC] text-[#C4554D]",
};

export function StatusBadge({ status }: { status: DealStatus }) {
  return (
    <span className={`inline-flex items-center rounded-[3px] px-1.5 py-0.5 text-[12px] font-medium ${styles[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
