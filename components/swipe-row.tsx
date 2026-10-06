"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";

const BTN = 70;
const TRIGGER = 50;

type Drag = { x: number; y: number; tx: number; axis?: "h" | "v" };

/** Telegram-style swipe: left reveals actions, right does nothing, spring snap-back. */
export function SwipeRow({
  open,
  onOpenChange,
  leaving = false,
  archiveLabel = "Arxiv",
  canDelete = true,
  onArchive,
  onDelete,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaving?: boolean;
  archiveLabel?: string;
  canDelete?: boolean;
  onArchive: () => void;
  onDelete: () => void;
  children: ReactNode;
}) {
  const max = BTN * 2;
  const [tx, setTx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const txRef = useRef(0);
  const drag = useRef<Drag | null>(null);
  const moved = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const onOpenRef = useRef(onOpenChange);
  openRef.current = open;
  onOpenRef.current = onOpenChange;

  function setOffset(value: number) {
    txRef.current = value;
    setTx(value);
  }

  useEffect(() => {
    if (!dragging) setOffset(open ? -max : 0);
  }, [open, max, dragging]);

  function finish() {
    const s = drag.current;
    drag.current = null;
    setDragging(false);
    if (!s || s.axis !== "h") return;
    const offset = txRef.current;
    const traveled = Math.abs(offset - s.tx);
    if (traveled < TRIGGER) {
      setOffset(openRef.current ? -max : 0);
      return;
    }
    const shouldOpen = offset <= -TRIGGER;
    onOpenRef.current(shouldOpen);
    setOffset(shouldOpen ? -max : 0);
  }

  function shift(x: number, y: number) {
    const s = drag.current;
    if (!s) return false;
    const dx = x - s.x;
    const dy = y - s.y;
    if (!s.axis && Math.hypot(dx, dy) > 8) {
      s.axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (s.axis !== "h") return false;
    moved.current = true;
    setOffset(Math.min(0, Math.max(-max - 16, s.tx + dx)));
    return true;
  }

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onTouchStart = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      drag.current = { x: t.clientX, y: t.clientY, tx: txRef.current };
      moved.current = false;
      setDragging(true);
    };
    const onTouchMove = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      if (shift(t.clientX, t.clientY)) event.preventDefault();
    };
    const onTouchEnd = () => finish();

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [max]);

  function onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, tx: txRef.current };
    moved.current = false;
    setDragging(true);

    const onMove = (e: globalThis.MouseEvent) => {
      if (shift(e.clientX, e.clientY)) e.preventDefault();
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      finish();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div ref={rootRef} className={`relative overflow-hidden ${leaving ? "swipe-exit" : ""}`}>
      <div className="absolute inset-y-1 right-1 flex gap-1">
        <button
          type="button"
          onClick={onArchive}
          className="flex w-[70px] flex-col items-center justify-center rounded-[10px] bg-[#F59E0B] text-[12px] font-semibold text-white"
        >
          <span className="text-[18px] leading-none" aria-hidden>
            📦
          </span>
          <span className="mt-1">{archiveLabel}</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex w-[70px] flex-col items-center justify-center rounded-[10px] bg-[#EF4444] text-[12px] font-semibold text-white"
        >
          <span className="text-[18px] leading-none" aria-hidden>
            🗑️
          </span>
          <span className="mt-1">O&apos;chir</span>
        </button>
      </div>
      <div
        onMouseDown={onMouseDown}
        onClickCapture={(event) => {
          if (open || moved.current) {
            event.preventDefault();
            event.stopPropagation();
            if (open && !moved.current) onOpenChange(false);
          }
        }}
        style={{
          transform: `translate3d(${tx}px,0,0)`,
          transition: dragging ? "none" : "transform 0.38s cubic-bezier(0.22, 1.2, 0.36, 1)",
        }}
        className="relative z-[1] select-none bg-panel"
      >
        {children}
      </div>
    </div>
  );
}
