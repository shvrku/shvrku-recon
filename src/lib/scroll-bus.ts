import type Lenis from "lenis";

export type ScrollSnapshot = {
  scrollTop: number;
  limit: number;
  progress: number;
  velocity: number;
  direction: number;
  viewportHeight: number;
};

const SERVER_SNAPSHOT: ScrollSnapshot = {
  scrollTop: 0,
  limit: 1,
  progress: 0,
  velocity: 0,
  direction: 0,
  viewportHeight: 1,
};

let snapshot: ScrollSnapshot = { ...SERVER_SNAPSHOT };
const listeners = new Set<() => void>();
let unbind: (() => void) | null = null;

export const bindLenisScrollBus = (lenis: Lenis | null) => {
  unbind?.();
  unbind = null;
  if (!lenis) return;

  const onScroll = () => {
    snapshot = {
      scrollTop: lenis.scroll,
      limit: lenis.limit || 1,
      progress: lenis.progress,
      velocity: lenis.velocity,
      direction: lenis.direction,
      viewportHeight:
        typeof window !== "undefined" ? window.innerHeight : 1,
    };
    for (const listener of listeners) listener();
  };

  lenis.on("scroll", onScroll);
  unbind = () => lenis.off("scroll", onScroll);
  onScroll();
};

export const getLenisScrollSnapshot = () => snapshot;
export const subscribeLenisScroll = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const SERVER_SCROLL_SNAPSHOT = SERVER_SNAPSHOT;
