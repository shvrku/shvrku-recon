import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";

export function runHomeStagger(scope?: ParentNode | null) {
  const root = scope ?? document;
  const items = gsap.utils.toArray<HTMLElement>("[data-rise]", root);
  if (!items.length) return;

  gsap.killTweensOf(items);

  if (prefersReducedMotion()) {
    gsap.set(items, { y: 0, opacity: 1, clearProps: "transform,opacity" });
    return;
  }

  gsap.set(items, { y: 56, opacity: 0 });
  gsap.to(items, {
    y: 0,
    opacity: 1,
    duration: 0.95,
    stagger: 0.11,
    ease: EASE.out,
    clearProps: "transform",
  });
}

export function dispatchSiteEnter(pathname: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("site:enter", { detail: { pathname } }),
  );
}

/** Run while boot/transition overlay still covers the page — avoids visible flicker. */
export function runHomeStaggerUnderCover() {
  const root = document.querySelector(".home-enter");
  if (!root) return;
  runHomeStagger(root);
}
