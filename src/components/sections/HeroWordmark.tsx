"use client";

import { useLayoutEffect, useRef } from "react";

export function HeroWordmark({ text }: { text: string }) {
  const wrap = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const measure = () => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().width;
    };

    const fit = () => {
      const parent = el.parentElement;
      if (!parent) return;
      const target = parent.clientWidth * 0.94;
      if (target <= 0) return;

      let lo = 8;
      let hi = Math.min(parent.clientWidth * 1.2, window.innerHeight * 0.4);
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        el.style.fontSize = `${mid}px`;
        if (measure() <= target) lo = mid;
        else hi = mid;
      }
      el.style.fontSize = `${lo}px`;
    };

    fit();
    void document.fonts.ready.then(fit);
    const ro = new ResizeObserver(fit);
    if (el.parentElement) ro.observe(el.parentElement);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [text]);

  return (
    <p
      ref={wrap}
      className="hero-wordmark select-none self-center text-center tracking-tight whitespace-nowrap"
      aria-hidden="true"
    >
      {text}
    </p>
  );
}
