"use client";

import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";

const BTN = 80;

/** iOS Mail / Messages swipe: drag left to reveal archive + delete. */
export function SwipeRow({
  open,
  onOpenChange,
  archiveLabel,
  canDelete,
  onArchive,
  onDelete,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archiveLabel: string;
  canDelete: boolean;
  onArchive: () => void;
  onDelete: () => void;
  children: ReactNode;
}) {
  const max = canDelete ? BTN * 2 : BTN;
  const [tx, setTx] = useState(0);
  const start = useRef<{ x: number; y: number; tx: number; axis?: "h" | "v" } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    setTx(open ? -max : 0);
  }, [open, max]);

  function down(event: PointerEvent<HTMLDivElement>) {
    start.current = { x: event.clientX, y: event.clientY, tx };
    dragged.current = false;
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    const dx = event.clientX - s.x;
    const dy = event.clientY - s.y;
    if (!s.axis && Math.hypot(dx, dy) > 6) {
      s.axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (s.axis !== "h") return;
    event.preventDefault();
    dragged.current = true;
    const next = Math.min(0, Math.max(-max, s.tx + dx));
    setTx(next);
  }

  function up() {
    const s = start.current;
    start.current = null;
    if (!s || s.axis !== "h") return;
    const shouldOpen = Math.abs(tx) > max * 0.45;
    onOpenChange(shouldOpen);
    setTx(shouldOpen ? -max : 0);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex">
        <button
          type="button"
          onClick={onArchive}
          className="flex w-20 flex-col items-center justify-center bg-[#E8B84A] text-[12px] font-semibold text-[#3B2F0B]"
        >
          📦
          <span className="mt-0.5">{archiveLabel}</span>
        </button>
        {canDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="flex w-20 flex-col items-center justify-center bg-[#C4554D] text-[12px] font-semibold text-white"
          >
            🗑️
            <span className="mt-0.5">O&apos;chirish</span>
          </button>
        ) : null}
      </div>
      <div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(event) => {
          if (open || dragged.current) {
            event.preventDefault();
            event.stopPropagation();
            if (open && !dragged.current) onOpenChange(false);
          }
        }}
        style={{ transform: `translate3d(${tx}px,0,0)`, touchAction: "pan-y" }}
        className="relative z-[1] bg-panel transition-transform duration-150 ease-out"
      >
        {children}
      </div>
    </div>
  );
}
