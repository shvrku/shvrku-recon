"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

const TRAVEL = 168;
const THUMB = 20;
const TRACK_TOP = 6;

function progressFromClientY(el: HTMLElement, clientY: number) {
  const rect = el.getBoundingClientRect();
  return Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
}

export function CustomScrollbar() {
  const thumbRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lenis = useLenis();

  useLenis(({ progress }) => {
    if (dragging.current) return;
    const thumb = thumbRef.current;
    if (!thumb) return;
    const y1 = TRACK_TOP + progress * (TRAVEL - THUMB);
    const y2 = y1 + THUMB;
    thumb.setAttribute("d", `M 16 ${y1} V ${y2}`);
  });

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !lenis) return;

    const scrollToY = (clientY: number) => {
      const t = progressFromClientY(el, clientY);
      const y1 = TRACK_TOP + t * (TRAVEL - THUMB);
      thumbRef.current?.setAttribute("d", `M 16 ${y1} V ${y1 + THUMB}`);
      lenis.scrollTo(t * lenis.limit, { immediate: true });
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging.current = true;
      el.setPointerCapture(e.pointerId);
      scrollToY(e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      scrollToY(e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [lenis]);

  return (
    <div
      ref={trackRef}
      className="chrome-burn pointer-events-auto fixed top-1/2 right-0 z-30 hidden h-50 w-14 -translate-y-1/2 cursor-grab px-3 text-white active:cursor-grabbing lg:block"
      role="scrollbar"
      aria-orientation="vertical"
      aria-label="Page scroll"
    >
      <svg width="32" height="200" viewBox="0 0 32 200" fill="none">
        <path
          d="M 16 6 V 194"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          ref={thumbRef}
          d="M 16 6 V 26"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
