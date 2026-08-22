import type Lenis from "lenis";

export const WORK_HREF = "/#work";

export function scrollToHash(
  hash: string,
  lenis?: Lenis | null,
  offset = -20,
  onComplete?: () => void,
) {
  if (!hash || hash === "#") return false;
  const el = document.querySelector(hash);
  if (!el) return false;

  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { offset, onComplete });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    onComplete?.();
  }
  return true;
}

export function scrollToWork(lenis?: Lenis | null, onComplete?: () => void) {
  return scrollToHash("#work", lenis, -20, onComplete);
}
