"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Keeps a chat transcript pinned to the last message — WhatsApp-style.
 * Scrolls the overflow container (never the document), so the input bar
 * and on-screen keyboard cannot cover the latest bubble.
 */
export function useChatScroll(scrollKey: unknown) {
  const listRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = listRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      return;
    }
    const previous = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    el.scrollTop = el.scrollHeight;
    el.style.scrollBehavior = previous;
  }, []);

  useEffect(() => {
    const smooth = !first.current;
    first.current = false;
    const frame = requestAnimationFrame(() => scrollToBottom(smooth));
    return () => cancelAnimationFrame(frame);
  }, [scrollKey, scrollToBottom]);

  useEffect(() => {
    const vv = window.visualViewport;
    const onViewport = () => scrollToBottom(false);
    vv?.addEventListener("resize", onViewport);
    vv?.addEventListener("scroll", onViewport);
    return () => {
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
    };
  }, [scrollToBottom]);

  return { listRef, scrollToBottom };
}
