"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type RefObject } from "react";

export const SIDEBAR_MIN = 240;
export const SIDEBAR_MAX = 480;
export const SIDEBAR_DEFAULT = 320;
const STORAGE_KEY = "ahd-sidebar-width";
const KEY_STEP = 16;

const clamp = (n: number) => Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, Math.round(n)));

/* ---- tiny external store so the saved width is read on the client without a hydration mismatch ---- */
let cached: number | null = null;
const listeners = new Set<() => void>();

function readSaved(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? clamp(n) : SIDEBAR_DEFAULT;
  } catch {
    return SIDEBAR_DEFAULT;
  }
}

function getSnapshot(): number {
  if (cached === null) cached = readSaved();
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function commitWidth(width: number) {
  cached = clamp(width);
  try {
    window.localStorage.setItem(STORAGE_KEY, String(cached));
  } catch {
    /* storage unavailable (private mode) – keep the in-memory width */
  }
  listeners.forEach((l) => l());
}

/** Persisted sidebar width in px. Renders the default on the server, the saved value on the client. */
export function useSidebarWidth(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => SIDEBAR_DEFAULT);
}

/**
 * Drag handle for the right edge of the sidebar (desktop only).
 * While dragging, the width is written straight to a CSS variable on the sidebar element
 * (one write per animation frame, no React re-renders); it is committed + saved on release.
 */
export function SidebarResizer({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const width = useSidebarWidth();
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startW: number; next: number; frame: number } | null>(null);

  const apply = (w: number) => targetRef.current?.style.setProperty("--sidebar-w", `${w}px`);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !targetRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const startW = targetRef.current.getBoundingClientRect().width;
    drag.current = { startX: e.clientX, startW, next: startW, frame: 0 };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    d.next = clamp(d.startW + e.clientX - d.startX);
    if (d.frame) return;
    d.frame = requestAnimationFrame(() => {
      d.frame = 0;
      apply(d.next);
    });
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d) return;
    if (d.frame) cancelAnimationFrame(d.frame);
    drag.current = null;
    apply(d.next);
    commitWidth(d.next);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    setDragging(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") commitWidth(width - KEY_STEP);
    else if (e.key === "ArrowRight") commitWidth(width + KEY_STEP);
    else if (e.key === "Home") commitWidth(SIDEBAR_MIN);
    else if (e.key === "End") commitWidth(SIDEBAR_MAX);
    else return;
    e.preventDefault();
    apply(cached ?? SIDEBAR_DEFAULT);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Panel kengligini o'zgartirish"
      aria-valuemin={SIDEBAR_MIN}
      aria-valuemax={SIDEBAR_MAX}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onKeyDown={onKeyDown}
      onDoubleClick={() => {
        commitWidth(SIDEBAR_DEFAULT);
        apply(SIDEBAR_DEFAULT);
      }}
      data-dragging={dragging ? "true" : "false"}
      className="group absolute inset-y-0 -right-[3px] z-30 hidden w-[7px] cursor-col-resize touch-none outline-none md:block"
    >
      <span
        className={`absolute inset-y-0 left-[2px] w-[3px] rounded-full transition-colors duration-100 group-hover:bg-[#c4c4c0] group-focus-visible:bg-[#c4c4c0] ${
          dragging ? "bg-[#a9a9a4]" : "bg-transparent"
        }`}
      />
    </div>
  );
}
