import gsap from "gsap";

export { gsap };

export const EASE = {
  out: "power3.out",
  inOut: "power3.inOut",
  expo: "expo.inOut",
} as const;

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function gsapToPromise(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
): Promise<void> {
  return new Promise((resolve) => {
    const { onComplete, ...rest } = vars;
    gsap.to(target, {
      ...rest,
      onComplete: () => {
        if (typeof onComplete === "function") onComplete();
        resolve();
      },
    });
  });
}

/** Shared ticker fan-out — one gsap.ticker drives many subscribers. */
const tickerSubs = new Set<(time: number) => void>();
let tickerBound = false;

function onGsapTick() {
  const time = performance.now();
  for (const sub of tickerSubs) sub(time);
}

export function subscribeGsapTick(cb: (time: number) => void) {
  tickerSubs.add(cb);
  if (!tickerBound) {
    gsap.ticker.add(onGsapTick);
    tickerBound = true;
  }
  return () => {
    tickerSubs.delete(cb);
    if (tickerSubs.size === 0 && tickerBound) {
      gsap.ticker.remove(onGsapTick);
      tickerBound = false;
    }
  };
}
