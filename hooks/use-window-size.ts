"use client";

import { useSyncExternalStore } from "react";

export const MOBILE_MAX_WIDTH = 768;

type Size = { width: number; height: number };

const SERVER_SIZE: Size = { width: 0, height: 0 };
let cached: Size = SERVER_SIZE;

function read(): Size {
  const width = Math.round(window.innerWidth);
  // visualViewport shrinks when the on-screen keyboard opens (iOS Safari does not resize the layout viewport).
  const height = Math.round(window.visualViewport?.height ?? window.innerHeight);
  if (cached.width !== width || cached.height !== height) cached = { width, height };
  return cached;
}

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);
  window.visualViewport?.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
    window.visualViewport?.removeEventListener("resize", onChange);
  };
}

/** Live viewport size. Returns 0x0 on the server and during hydration, so markup always matches. */
export function useWindowSize(): Size {
  return useSyncExternalStore(subscribe, read, () => SERVER_SIZE);
}

export function useIsMobile() {
  const { width } = useWindowSize();
  return width > 0 && width <= MOBILE_MAX_WIDTH;
}
