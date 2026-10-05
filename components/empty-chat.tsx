"use client";

import { Lock, SquarePen } from "lucide-react";
import { useApp } from "@/components/app-store";
import { OliveBranch } from "@/components/logo";

/** Right-panel empty state shown until a chat is opened. */
export function EmptyChat() {
  const { openNewChat } = useApp();
  return (
    <div className="chat-bg flex h-full flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-panel shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <OliveBranch className="h-14 w-14 text-[#C9A84C]" />
      </div>
      <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.02em] text-ink">Kelishuvingizni boshlang</h1>
      <p className="mt-2 max-w-sm text-[15px] leading-6 text-ink2">
        Chap tomondan suhbatni tanlang yoki yangi kelishuv oching. Shartlarni yozing, AI hujjatni tayyorlaydi.
      </p>
      <button
        type="button"
        onClick={() => openNewChat()}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-btn px-5 text-[14px] font-semibold text-btnink hover:opacity-85"
      >
        <SquarePen size={16} />
        Yangi kelishuv
      </button>
      <p className="absolute bottom-6 flex items-center gap-1.5 text-[12.5px] text-ink2">
        <Lock size={13} />
        Xabarlar va hujjatlar himoyalangan
      </p>
    </div>
  );
}
