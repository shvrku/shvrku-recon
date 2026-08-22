import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { getDomTarget } from "@/lib/dom-targets";
import { projects } from "@/lib/site";

const progress = new Map<string, number>();
const activeTweens = new Map<string, gsap.core.Tween>();
const listeners = new Set<() => void>();
let suppressReveal = false;

const emit = () => {
  for (const listener of listeners) listener();
};

export function getPhotoRevealProgress(slug: string) {
  return progress.get(slug) ?? 0;
}

export function setPhotoRevealProgress(slug: string, value: number) {
  const next = Math.max(0, Math.min(1, value));
  if (progress.get(slug) === next) return;
  progress.set(slug, next);
  emit();
}

export function subscribePhotoReveal(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPhotoRevealSuppressed(value: boolean) {
  suppressReveal = value;
}

const REVEAL_DURATION = 1.15;

function cancelRevealAnimation(slug: string) {
  const tween = activeTweens.get(slug);
  if (tween) tween.kill();
  activeTweens.delete(slug);
}

function resetReveal(slug: string) {
  cancelRevealAnimation(slug);
  setPhotoRevealProgress(slug, 0);
}

function animateReveal(slug: string) {
  if (suppressReveal) return;

  cancelRevealAnimation(slug);
  setPhotoRevealProgress(slug, 0);
  const proxy = { v: 0 };

  const tween = gsap.to(proxy, {
    v: 1,
    duration: REVEAL_DURATION,
    ease: "power3.out",
    onUpdate: () => setPhotoRevealProgress(slug, proxy.v),
    onComplete: () => {
      activeTweens.delete(slug);
    },
  });

  activeTweens.set(slug, tween);
}

export function revealPhotoImmediate(slug: string) {
  cancelRevealAnimation(slug);
  setPhotoRevealProgress(slug, 1);
}

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight + 80 && rect.bottom > -80;
}

/** Snap visible project photos after a programmatic scroll to #work. */
export function revealVisibleProjectPhotos() {
  for (const { slug } of projects) {
    const target = getDomTarget(slug);
    if (target && isInViewport(target.el)) {
      revealPhotoImmediate(slug);
    }
  }
}

/** Retry until work-section targets exist (route + scroll can beat hydration). */
export function revealWorkPhotosWhenReady() {
  revealVisibleProjectPhotos();
  const pending = projects.some((p) => {
    const target = getDomTarget(p.slug);
    return (
      target &&
      isInViewport(target.el) &&
      getPhotoRevealProgress(p.slug) < 1
    );
  });
  if (pending) requestAnimationFrame(revealWorkPhotosWhenReady);
}

export function usePhotoReveal(
  slug: string,
  ref: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          animateReveal(slug);
        } else {
          resetReveal(slug);
        }
      },
      { threshold: 0, rootMargin: "80px 0px" },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      resetReveal(slug);
    };
  }, [slug, ref]);
}
