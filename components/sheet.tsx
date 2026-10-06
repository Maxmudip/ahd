"use client";

import { useEffect, type ReactNode } from "react";

/** Mobile-first bottom sheet. Desktop keeps the same slide-up, just narrower. */
export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`absolute inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg rounded-t-[20px] bg-panel shadow-[0_-12px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:bottom-6 md:rounded-[16px] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" />
        {children}
      </div>
    </div>
  );
}

export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet open={open} title={title} onClose={onCancel}>
      <div className="px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <p className="text-[17px] font-semibold text-ink">{title}</p>
        <p className="mt-2 whitespace-pre-line text-[14.5px] leading-6 text-ink2">{body}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-[10px] border border-line text-[14px] font-medium text-ink hover:bg-hov"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 flex-1 rounded-[10px] bg-[#C4554D] text-[14px] font-semibold text-white hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
