"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";

/** Fixed overlay badge pinned to a photo’s top-right, above WebGL, click-through. */
export function PhotoKindBadge({
  photoRef,
  kind,
}: {
  photoRef: RefObject<HTMLElement | null>;
  kind: string;
}) {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  // Mutate DOM (same pattern as WheelProgress) — never setState on scroll.
  const sync = () => {
    const photo = photoRef.current;
    const badge = badgeRef.current;
    if (!photo || !badge) return;
    const r = photo.getBoundingClientRect();
    const visible = r.width >= 2 && r.height >= 2;
    badge.style.visibility = visible ? "visible" : "hidden";
    if (!visible) return;
    badge.style.top = `${r.top}px`;
    badge.style.left = `${r.right}px`;
  };

  useLenis(() => {
    sync();
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    sync();
    const ro = new ResizeObserver(sync);
    if (photoRef.current) ro.observe(photoRef.current);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [mounted, photoRef]);

  if (!mounted) return null;

  return createPortal(
    <span
      ref={badgeRef}
      className="pointer-events-none fixed z-20 whitespace-nowrap bg-[var(--fg)] px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.14em] text-black uppercase"
      style={{
        top: 0,
        left: 0,
        transform: "translateX(-100%)",
        visibility: "hidden",
      }}
      aria-hidden="true"
    >
      {kind}
    </span>,
    document.body,
  );
}
