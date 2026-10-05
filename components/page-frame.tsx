"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/components/app-store";
import { IconButton } from "@/components/chat-ui";

/** Right-panel page (wizard, settings, lists) styled like a chat: header + patterned canvas + white card. */
export function PageFrame({
  title,
  subtitle,
  back = "/dashboard",
  showBack = true,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  /** Hide the mobile back arrow on screens reached from the bottom tab bar. */
  showBack?: boolean;
  children: ReactNode;
}) {
  const { goBack } = useApp();
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <header className="flex h-[60px] w-full shrink-0 items-center gap-1.5 border-b border-line bg-panel px-1.5 md:gap-2 md:px-5">
        {showBack ? (
          <IconButton label="Orqaga" onClick={() => goBack(back)} className="md:hidden">
            <ArrowLeft size={20} />
          </IconButton>
        ) : (
          <span className="w-2.5 md:hidden" />
        )}
        <div className="min-w-0">
          <h1 className="truncate text-[16px] font-semibold text-ink">{title}</h1>
          {subtitle ? <p className="truncate text-[12.5px] text-ink2">{subtitle}</p> : null}
        </div>
      </header>
      <div className="chat-bg min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <div className="break-anywhere mx-auto w-full max-w-[640px] rounded-[12px] bg-panel p-4 text-ink shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
