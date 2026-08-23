"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { subscribeLenisScroll } from "@/lib/scroll-bus";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import {
  SIGNATURE_PATH,
  SIGNATURE_STROKE,
  SIGNATURE_VIEWBOX,
} from "@/components/effects/signature-path";

/** Real signature from /public/signature.svg — smoothed into one stroke, sticker tilt. */
export function SharkuSign({ draw }: { draw: boolean }) {
  const wrap = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const pathLen = useRef(0);
  const played = useRef(false);

  useLayoutEffect(() => {
    const p = path.current;
    if (!p) return;

    const len = p.getTotalLength();
    pathLen.current = len;
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
    p.style.opacity = "0";
    played.current = false;
    wrap.current?.classList.remove("svg-sign--drawn");
  }, []);

  useEffect(() => {
    if (!draw || played.current) return;
    const p = path.current;
    const wrapEl = wrap.current;
    if (!p || !wrapEl) return;

    played.current = true;
    const len = pathLen.current || p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;

    if (prefersReducedMotion()) {
      p.style.strokeDashoffset = "0";
      p.style.opacity = "1";
      wrapEl.classList.add("svg-sign--drawn");
      return;
    }

    gsap.to(p, {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 1.35,
      delay: 0.15,
      ease: EASE.inOut,
      onComplete: () => {
        wrapEl.classList.add("svg-sign--drawn");
      },
    });
  }, [draw]);

  return (
    <svg
      ref={wrap}
      viewBox={SIGNATURE_VIEWBOX}
      fill="none"
      className="svg-sign svg-sign--sticker pointer-events-none absolute z-10"
      aria-hidden="true"
    >
      <path
        ref={path}
        className="svg-sign__path"
        d={SIGNATURE_PATH}
        stroke="currentColor"
        strokeWidth={SIGNATURE_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SignatureBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function useSignatureDraw(
  trigger: "intersect" | "entry",
  anchorRef: RefObject<HTMLElement | null>,
  entryDelay = 0.45,
) {
  const [draw, setDraw] = useState(false);

  useEffect(() => {
    if (trigger === "entry") {
      if (prefersReducedMotion()) {
        setDraw(true);
        return;
      }
      const id = window.setTimeout(() => setDraw(true), entryDelay * 1000);
      return () => window.clearTimeout(id);
    }

    const anchor = anchorRef.current;
    if (!anchor) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setDraw(true);
      },
      { threshold: 0.25, rootMargin: "80px 0px" },
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, [trigger, anchorRef, entryDelay]);

  return draw;
}

function useSignatureBox(anchorRef: RefObject<HTMLElement | null>) {
  const [box, setBox] = useState<SignatureBox | null>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const update = () => {
      const rect = anchor.getBoundingClientRect();
      setBox({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(anchor);
    window.addEventListener("resize", update);
    const unsubScroll = subscribeLenisScroll(update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      unsubScroll();
    };
  }, [anchorRef]);

  return box;
}

/** Home portrait — portaled above WebGL, draws when scrolled into view. */
export function PortraitSignatureOverlay({
  anchorRef,
}: {
  anchorRef: RefObject<HTMLDivElement | null>;
}) {
  const box = useSignatureBox(anchorRef);
  const draw = useSignatureDraw("intersect", anchorRef);

  if (!box || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="svg-sign-ink pointer-events-none fixed z-[4] overflow-visible"
      style={{
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
      }}
    >
      <SharkuSign draw={draw} />
    </div>,
    document.body,
  );
}

/** About portrait — in-flow overlay, draws on page entry. */
export function PortraitSignatureInline({
  anchorRef,
  entryDelay = 0.45,
}: {
  anchorRef: RefObject<HTMLDivElement | null>;
  entryDelay?: number;
}) {
  const draw = useSignatureDraw("entry", anchorRef, entryDelay);

  return (
    <div className="svg-sign-ink pointer-events-none absolute inset-0 z-10 overflow-visible">
      <SharkuSign draw={draw} />
    </div>
  );
}
