"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { portrait, site } from "@/lib/site";
import { registerDomTarget } from "@/lib/dom-targets";
import { subscribeLenisScroll } from "@/lib/scroll-bus";
import { usePhotoReveal } from "@/lib/photo-reveal";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { SiteImage } from "@/components/media/SiteImage";
import {
  SIGNATURE_PATH,
  SIGNATURE_STROKE,
  SIGNATURE_VIEWBOX,
} from "@/components/effects/signature-path";

/** Real signature from /public/signature.svg — smoothed into one stroke, sticker tilt. */
function SharkuSign({ draw }: { draw: boolean }) {
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

/** Portaled above the WebGL canvas — Lenis transform traps in-flow z-index. */
function PortraitSignatureOverlay({
  anchorRef,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [box, setBox] = useState<SignatureBox | null>(null);
  const [draw, setDraw] = useState(false);

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

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setDraw(true);
      },
      { threshold: 0.25, rootMargin: "80px 0px" },
    );
    io.observe(anchor);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      unsubScroll();
      io.disconnect();
    };
  }, [anchorRef]);

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

export function Profile() {
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerDomTarget(portrait.slug, photoRef.current);
    return () => registerDomTarget(portrait.slug, null);
  }, []);

  usePhotoReveal(portrait.slug, photoRef);

  return (
    <section id="about" className="layout-grid py-18 lg:py-24 lg:pb-28">
      <div className="col-span-2 lg:col-span-1">
        <div className="relative aspect-square w-full overflow-visible">
          <div
            ref={photoRef}
            data-photo
            className="relative aspect-square w-full overflow-hidden bg-[var(--bg-hero)]"
          >
            <SiteImage
              src={portrait.image}
              alt={site.fullName}
              fill
              className="pointer-events-none object-cover opacity-0"
              sizes="(min-width: 1024px) 25vw, 80vw"
              priority
            />
          </div>
        </div>
      </div>
      <PortraitSignatureOverlay anchorRef={photoRef} />

      <div
        className="col-span-2 mt-10 flex flex-col justify-end gap-8 lg:col-span-2 lg:mt-0"
        data-rise
      >
        <p className="max-w-[22ch] text-[7vw] leading-[0.95] font-bold tracking-tight lg:text-[2.8vw]">
          {site.profileLead}
        </p>
        <p className="max-w-[46ch] font-mono text-sm leading-relaxed text-[var(--fg-muted)]">
          I&apos;m currently at{" "}
          <Link href="/blog/helix" className="hit-dash text-[var(--fg)] underline">
            Hinthar
          </Link>{" "}
          working on their {" "}
          <Link href="/blog/helix" className="hit-dash text-[var(--fg)] underline">
          School Management System, 
          </Link>{" "}
          and previously worked on my own personal projects to sharpen my skills and quality of work.
        </p>
      </div>
    </section>
  );
}
