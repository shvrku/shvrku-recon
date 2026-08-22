"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";

type PhotoRevealProps = {
  children: React.ReactNode;
  className?: string;
  revealKey: string;
};

/** White veil fade on scroll — replays each time the image enters the viewport. */
export function PhotoReveal({ children, className, revealKey }: PhotoRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    const veil = veilRef.current;
    if (!el || !veil) return;

    const playIn = () => {
      tweenRef.current?.kill();
      if (prefersReducedMotion()) {
        gsap.set(veil, { opacity: 0 });
        return;
      }
      gsap.set(veil, { opacity: 1 });
      tweenRef.current = gsap.to(veil, {
        opacity: 0,
        duration: 1.15,
        ease: EASE.out,
      });
    };

    const playOut = () => {
      tweenRef.current?.kill();
      gsap.set(veil, { opacity: 1 });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) playIn();
        else playOut();
      },
      { threshold: 0, rootMargin: "80px 0px" },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      tweenRef.current?.kill();
    };
  }, [revealKey]);

  return (
    <div ref={ref} className={cn("photo-reveal", className)}>
      {children}
      <span ref={veilRef} className="photo-reveal__veil" aria-hidden />
    </div>
  );
}
