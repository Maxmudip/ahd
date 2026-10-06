"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, EllipsisVertical, Mic, Plus, X } from "lucide-react";
import { useApp } from "@/components/app-store";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { isFreshId } from "@/lib/chat-helpers";

export const R_OWN = "12px 0 12px 12px";
export const R_OTHER = "0 12px 12px 12px";

const delivered = new Set<string>();

/** Own messages show a single tick first, then flip to a double tick once "delivered". */
function useDelivered(id: string, own: boolean) {
  const [done, setDone] = useState(() => !own || !isFreshId(id) || delivered.has(id));
  useEffect(() => {
    if (done) {
      delivered.add(id);
      return;
    }
    const timer = window.setTimeout(() => {
      delivered.add(id);
      setDone(true);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [done, id]);
  return done;
}

export function useFresh(id: string) {
  const [fresh] = useState(() => isFreshId(id));
  return fresh;
}

export function Ticks({ done, tone = "own" }: { done: boolean; tone?: "own" | "other" }) {
  const muted = tone === "own" ? "text-white/60" : "text-ink2";
  if (!done) return <Check size={14} className={muted} aria-label="Yuborildi" />;
  return <CheckCheck size={15} className="text-[#C9A84C]" aria-label="O'qildi" />;
}

export function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-full bg-chip px-3 py-1 text-[12px] font-medium text-ink2 shadow-[0_1px_0.5px_rgba(0,0,0,0.06)]">
        {label}
      </span>
    </div>
  );
}

export function SystemMessage({ text, id }: { text: string; id: string }) {
  const fresh = useFresh(id);
  return (
    <div className="my-2 flex justify-center">
      <span
        className={`max-w-[85%] rounded-full bg-chip px-3 py-1 text-center text-[12.5px] text-ink2 ${fresh ? "bubble-in origin-own" : ""}`}
      >
        {text}
      </span>
    </div>
  );
}

export function Bubble({
  id,
  side,
  name,
  nameColor,
  role,
  time,
  wide = false,
  accent = false,
  children,
}: {
  id: string;
  side: "me" | "them";
  name?: string;
  nameColor?: string;
  /** Incoming only: shown under the sender name as "Name · Role". */
  role?: string;
  time?: string;
  wide?: boolean;
  accent?: boolean;
  children: ReactNode;
}) {
  const own = side === "me";
  const fresh = useFresh(id);
  const done = useDelivered(id, own);

  return (
    <div className={`flex w-full ${own ? "justify-end" : "justify-start"}`}>
      <div
        style={{
          borderRadius: own ? R_OWN : R_OTHER,
          ...(accent ? { borderLeft: "4px solid #C9A84C" } : null),
        }}
        className={`break-anywhere min-w-[72px] max-w-[80%] px-2.5 pt-1.5 pb-1 md:max-w-[65%] ${wide ? "w-full" : ""} ${
          own
            ? "ml-auto bg-own text-ownink"
            : "mr-auto border border-line bg-other text-otherink"
        } ${fresh ? `bubble-in ${own ? "origin-own" : "origin-them"}` : ""}`}
      >
        {!own && name ? (
          <div className="mb-0.5">
            <p className="text-[12.5px] font-semibold" style={{ color: nameColor }}>
              {name}
            </p>
            {role ? <p className="text-[11px] leading-tight text-ink2">{`${name} · ${role}`}</p> : null}
          </div>
        ) : null}
        {children}
        <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px]">
          {time ? <span className={own ? "text-white/60" : "text-ink2"}>{time}</span> : null}
          {own ? <Ticks done={done} /> : null}
        </div>
      </div>
    </div>
  );
}

export function TypingBubble({ label }: { label: string }) {
  return (
    <div className="flex w-full justify-start">
      <div
        style={{ borderRadius: R_OTHER }}
        className="bubble-in origin-them mr-auto max-w-[80%] border border-line bg-other px-3 py-2 text-otherink md:max-w-[65%]"
      >
        <p className="text-[12.5px] font-semibold text-[#8A6B2E]">Ahd AI</p>
        <div className="mt-1 flex items-center gap-2 text-[13px] text-ink2">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="typing-dot h-1.5 w-1.5 rounded-full bg-ink2"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
          {label}
        </div>
      </div>
    </div>
  );
}

export function IconButton({
  children,
  label,
  onClick,
  href,
  className = "",
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
}) {
  const cls = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink2 hover:bg-hov hover:text-ink disabled:opacity-40 md:h-10 md:w-10 ${className}`;
  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function ChatHeader({
  back,
  avatar,
  title,
  subtitle,
  extra,
  center,
  actions,
}: {
  back: string;
  avatar: ReactNode;
  title: string;
  subtitle?: ReactNode;
  /** Second row under the title (roles, etc.). */
  extra?: ReactNode;
  center?: ReactNode;
  actions: ReactNode;
}) {
  const { goBack } = useApp();
  return (
    <header className="w-full min-w-0 shrink-0 border-b border-line bg-panel">
      <div className="flex h-[60px] items-center gap-1.5 px-1.5 md:gap-2 md:px-4">
        <IconButton label="Orqaga" onClick={() => goBack(back)} className="md:hidden">
          <ArrowLeft size={20} />
        </IconButton>
        {avatar}
        <div className="min-w-0 flex-1 lg:max-w-[30%] lg:flex-none">
          <h1 className="truncate text-[15px] font-semibold text-ink">{title}</h1>
          {subtitle ? <p className="truncate text-[12.5px] text-ink2">{subtitle}</p> : null}
        </div>
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex">{center}</div>
        <div className="ml-auto flex items-center lg:ml-0">{actions}</div>
      </div>
      {extra ? <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2 md:px-4">{extra}</div> : null}
    </header>
  );
}

export function RolePills({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <>
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex max-w-full items-center truncate rounded-full bg-wash px-2 py-0.5 text-[12px] text-ink2"
        >
          {item}
        </span>
      ))}
    </>
  );
}

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
};

export function MenuButton({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <IconButton label="Qo'shimcha" onClick={() => setOpen((v) => !v)}>
        <EllipsisVertical size={20} />
      </IconButton>
      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="pill-up absolute top-11 right-0 z-50 w-60 overflow-hidden rounded-[10px] border border-line bg-panel py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.16)]"
          >
            {items.map((item) => (
              <button
                key={item.label}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`flex h-11 w-full items-center gap-3 px-4 text-left text-[14px] hover:bg-hov md:h-10 disabled:opacity-40 disabled:hover:bg-transparent ${
                  item.danger ? "text-[#C4554D]" : "text-ink"
                }`}
              >
                <span className="text-ink2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function InfoDrawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={`absolute inset-0 z-20 bg-black/25 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        inert={!open}
        aria-hidden={!open}
        aria-label={title}
        className={`absolute inset-y-0 right-0 z-30 flex w-full flex-col bg-panel shadow-[-8px_0_30px_rgba(0,0,0,0.14)] transition-transform duration-200 sm:w-[460px] ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-line px-2">
          <IconButton label="Yopish" onClick={onClose}>
            <X size={20} />
          </IconButton>
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{open ? children : null}</div>
      </aside>
    </>
  );
}

export type PillItem = { label: string; onClick: () => void; disabled?: boolean };

/** Scrollable transcript + fixed input. Last message stays above the composer. */
export function ChatThread({
  children,
  footer,
  scrollKey,
}: {
  children: ReactNode;
  footer: ReactNode;
  scrollKey: unknown;
}) {
  const { listRef, scrollToBottom } = useChatScroll(scrollKey);
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(96);

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const sync = () => setBarH(Math.max(80, el.offsetHeight));
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const onFocus = () => scrollToBottom(true);
    bar.addEventListener("focusin", onFocus);
    return () => bar.removeEventListener("focusin", onFocus);
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom(true);
  }, [barH, scrollToBottom]);

  return (
    <>
      <div
        ref={listRef}
        className="chat-bg min-h-0 flex-1 overflow-y-auto scroll-smooth overscroll-contain px-3 pt-3 md:px-6"
        style={{ paddingBottom: barH, WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex w-full flex-col gap-1.5">{children}</div>
      </div>
      <div ref={barRef} className="absolute inset-x-0 bottom-0 z-10">
        {footer}
      </div>
    </>
  );
}

export function ChatInputBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  inputRef,
  disabled,
  inputMode,
  plus,
  quick,
  notice,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  placeholder: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  inputMode?: "text" | "numeric";
  plus?: { open: boolean; onToggle: () => void; items: PillItem[] };
  quick?: PillItem[];
  notice?: string;
}) {
  const typing = value.trim().length > 0;
  return (
    <div className="w-full shrink-0 border-t border-line bg-panel pb-[env(safe-area-inset-bottom)]">
      {notice ? (
        <p className="pill-up px-4 pt-2 text-[12.5px] text-ink2" role="status">
          {notice}
        </p>
      ) : null}
      {plus?.open || (quick && quick.length) ? (
        <div className="flex flex-wrap gap-2 px-3 pt-2.5 md:px-4">
          {(plus?.open ? plus.items : (quick ?? [])).map((pill, i) => (
            <button
              key={pill.label}
              type="button"
              disabled={pill.disabled}
              onClick={pill.onClick}
              style={{ animationDelay: `${i * 35}ms` }}
              className="pill-up h-11 rounded-full border border-line bg-panel px-4 text-[13.5px] text-ink shadow-sm hover:bg-hov disabled:opacity-40 md:h-8 md:px-3 md:text-[13px]"
            >
              {pill.label}
            </button>
          ))}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="flex min-h-[60px] w-full items-center gap-2 px-2 py-2 md:px-4">
        {plus ? (
          <button
            type="button"
            aria-label="Biriktirish"
            aria-expanded={plus.open}
            onClick={plus.onToggle}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wash text-ink2 hover:text-ink md:h-10 md:w-10"
          >
            <Plus size={22} className={`transition-transform duration-200 ${plus.open ? "rotate-45" : ""}`} />
          </button>
        ) : null}
        <input
          ref={inputRef}
          value={value}
          disabled={disabled}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 min-w-0 flex-1 rounded-full bg-wash px-4 text-[15px] md:h-10 text-ink outline-none placeholder:text-ink2 focus:shadow-[0_0_0_2px_rgba(201,168,76,0.55)] disabled:opacity-60"
        />
        {typing ? (
          <button
            type="submit"
            aria-label="Yuborish"
            className="bubble-in inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-btn text-btnink hover:opacity-85 md:h-10 md:w-10"
          >
            <ArrowRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Ovozli xabar"
            title="Ovozli xabar tez orada"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink2 hover:bg-hov hover:text-ink md:h-10 md:w-10"
          >
            <Mic size={20} />
          </button>
        )}
      </form>
    </div>
  );
}

export function EmptyNote({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[32px]" aria-hidden>
        {emoji}
      </p>
      <p className="mt-2 text-[14px] text-ink2">{children}</p>
    </div>
  );
}
