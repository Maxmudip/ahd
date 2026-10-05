import { POOL_STATUS_LABEL, type PoolStatus } from "@/lib/pool-qarz";

const styles: Record<PoolStatus, string> = {
  collecting: "bg-[#F6EFD9] text-[#8A6B2E]",
  full: "bg-[#F6E6D8] text-[#8F5430]",
  completed: "bg-[#E8EEDC] text-[#5A6B38]",
};

export function PoolStatusBadge({ status }: { status: PoolStatus }) {
  return (
    <span className={`inline-flex items-center rounded-[3px] px-1.5 py-0.5 text-[12px] font-medium ${styles[status]}`}>
      {POOL_STATUS_LABEL[status]}
    </span>
  );
}

export function purposeClass(purpose: string) {
  const value = purpose.toLowerCase();
  if (value.includes("tibbiy")) return "bg-[#F6E4DC] text-[#8F4E3A]";
  if (value.includes("biznes")) return "bg-[#F6EFD9] text-[#8A6B2E]";
  if (value.includes("ta'lim") || value.includes("talim")) return "bg-[#E8EEDC] text-[#5A6B38]";
  if (value.includes("uy")) return "bg-[#F3E6D4] text-[#8A5A32]";
  return "bg-[#F5F4F0] text-[#6E6A62]";
}
