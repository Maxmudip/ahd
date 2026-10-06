import { DEAL_KIND_LABEL, type DealKind } from "@/lib/deals";

export type ChatKind = DealKind;

const TONE: Record<ChatKind, string> = {
  kelishuv: "bg-wash text-ink2",
  qarz: "bg-[#F6EFD9] text-[#8A6B2E]",
};

/** Type of a chat: Kelishuv or Qarz. `size="sm"` is the compact chip used in lists. */
export function KindBadge({ kind, size = "md" }: { kind: ChatKind; size?: "sm" | "md" }) {
  return (
    <span
      data-kind={kind}
      className={`inline-flex shrink-0 items-center rounded-full font-medium whitespace-nowrap ${TONE[kind]} ${
        size === "sm" ? "px-1.5 py-px text-[10.5px]" : "px-2.5 py-0.5 text-[12px]"
      }`}
    >
      {DEAL_KIND_LABEL[kind]}
    </span>
  );
}
