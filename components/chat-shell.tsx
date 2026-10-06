"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useApp } from "@/components/app-store";
import { InviteActions } from "@/components/deal-invite";
import { LeftPanel } from "@/components/left-panel";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { SidebarResizer, useSidebarWidth } from "@/components/sidebar-resizer";
import { useIsMobile, useWindowSize } from "@/hooks/use-window-size";

/**
 * Full-screen two-panel messaging layout.
 * Desktop (>= 769px): list (resizable, 240-480px, default 320) beside the chat.
 * Mobile (<= 768px): list and chat are stacked full-screen layers. Opening a chat slides it in from the
 * right, going back slides it out to the right. The bottom tab bar shows on list/profile screens only.
 */
export function ChatShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, closing, syncError, dismissSyncError, incomingInvites, respondToInvite } = useApp();
  const banner = incomingInvites[0] ?? null;
  const from = banner?.parties.find((p) => p.userId === banner.createdBy)?.name || banner?.title || "";
  const { height, offsetTop } = useWindowSize();
  const isMobile = useIsMobile();
  const sidebarWidth = useSidebarWidth();
  const asideRef = useRef<HTMLElement>(null);

  const isList = pathname === "/dashboard" || pathname === "/dashboard/pool-qarz";
  const showTabs = isList || pathname.startsWith("/dashboard/settings");
  const chatOpen = !isList && !closing;

  // Pin the shell to the visual viewport so the input bar stays above the keyboard.
  useEffect(() => {
    if (isMobile) window.scrollTo(0, 0);
  }, [isMobile, height, offsetTop]);

  return (
    <div
      data-theme={theme}
      className="flex h-dvh w-full max-w-full flex-col overflow-hidden bg-chat text-ink"
      style={
        isMobile && height > 0
          ? { position: "fixed", top: offsetTop, left: 0, right: 0, height }
          : undefined
      }
    >
      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        <aside
          ref={asideRef}
          style={{ "--sidebar-w": `${sidebarWidth}px` } as CSSProperties}
          data-hidden={chatOpen ? "true" : "false"}
          className="m-aside absolute inset-0 z-0 flex w-full shrink-0 flex-col border-line bg-panel md:relative md:z-auto md:w-[var(--sidebar-w)] md:border-r"
        >
          <LeftPanel />
          <SidebarResizer targetRef={asideRef} />
        </aside>
        <main
          data-open={chatOpen ? "true" : "false"}
          className="m-main absolute inset-0 z-10 flex min-w-0 flex-col bg-chat md:static md:z-auto md:flex-1 md:shadow-none"
        >
          <div key={pathname} className="panel-slide relative flex min-h-0 w-full min-w-0 flex-1 flex-col">
            {children}
          </div>
        </main>
      </div>
      {banner && !syncError ? (
        <div
          role="status"
          className="fixed top-3 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-[10px] border border-[#E6D9AE] bg-[#FFFBEB] px-4 py-3 text-[#3B2F0B] shadow-[0_6px_24px_rgba(0,0,0,0.12)]"
        >
          <p className="text-[13.5px] leading-5">
            <span className="font-semibold">{from}</span> sizni kelishuvga taklif qildi
            {banner.title ? <span className="text-[#7A6A3A]"> — {banner.title}</span> : null}
          </p>
          <div className="mt-2.5">
            <InviteActions
              onAccept={() => banner.invitation && respondToInvite(banner.invitation.id, true)}
              onReject={() => banner.invitation && respondToInvite(banner.invitation.id, false)}
            />
          </div>
        </div>
      ) : null}
      {syncError ? (
        <div
          role="alert"
          className="fixed top-3 left-1/2 z-50 flex w-[min(92vw,520px)] -translate-x-1/2 items-start gap-3 rounded-[10px] bg-[#C4554D] px-4 py-3 text-[13.5px] leading-5 text-white shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
        >
          <span className="min-w-0 flex-1 break-anywhere">{syncError}</span>
          <button type="button" onClick={dismissSyncError} aria-label="Yopish" className="shrink-0 font-semibold hover:opacity-80">
            ✕
          </button>
        </div>
      ) : null}
      {showTabs ? <MobileTabBar /> : null}
    </div>
  );
}
