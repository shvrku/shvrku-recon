"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { SiteImage } from "@/components/media/SiteImage";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type PhotoLightboxProps = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

const VEIL_BLUR = "blur(40px) saturate(1.25)";
const VEIL_CLEAR = "blur(0px) saturate(1)";

export function PhotoLightbox({ src, alt, open, onClose }: PhotoLightboxProps) {
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const closingRef = useRef(false);
  const enteredRef = useRef(false);

  const animateIn = useCallback(() => {
    const root = rootRef.current;
    const veil = veilRef.current;
    const content = contentRef.current;
    if (!root || !veil || !content) return;
    gsap.killTweensOf([root, veil, content]);

    if (prefersReducedMotion()) {
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(veil, {
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: VEIL_BLUR,
        webkitBackdropFilter: VEIL_BLUR,
      });
      gsap.set(content, { autoAlpha: 1 });
      return;
    }

    // Keep veil opacity at 1 so backdrop-filter frost stays alive; fade bg alpha + content.
    gsap.set(root, { autoAlpha: 1 });
    gsap.set(veil, {
      backgroundColor: "rgba(0,0,0,0)",
      autoAlpha: 1,
      backdropFilter: VEIL_BLUR,
      webkitBackdropFilter: VEIL_BLUR,
    });
    gsap.set(content, { autoAlpha: 0 });
    gsap.to(veil, {
      backgroundColor: "rgba(0,0,0,0.45)",
      duration: 0.35,
      ease: "power2.out",
    });
    gsap.to(content, {
      autoAlpha: 1,
      duration: 0.35,
      ease: "power2.out",
      delay: 0.04,
    });
  }, []);

  const animateOut = useCallback(() => {
    return new Promise<void>((resolve) => {
      const root = rootRef.current;
      const veil = veilRef.current;
      const content = contentRef.current;
      if (!root || !veil || !content || prefersReducedMotion()) {
        resolve();
        return;
      }
      gsap.killTweensOf([root, veil, content]);
      // Collapse blur with the tint — leaving full frost then unmounting caused a snap flash.
      gsap.to(content, {
        autoAlpha: 0,
        duration: 0.16,
        ease: "power2.out",
      });
      gsap.to(veil, {
        backgroundColor: "rgba(0,0,0,0)",
        backdropFilter: VEIL_CLEAR,
        webkitBackdropFilter: VEIL_CLEAR,
        duration: 0.22,
        ease: "power2.in",
      });
      gsap.to(root, {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => resolve(),
      });
    });
  }, []);

  useEffect(() => {
    if (open) {
      if (!mounted) {
        closingRef.current = false;
        enteredRef.current = false;
        setMounted(true);
      }
      return;
    }
    if (!mounted || closingRef.current) return;
    closingRef.current = true;
    void animateOut().then(() => {
      setMounted(false);
      closingRef.current = false;
      enteredRef.current = false;
    });
  }, [open, mounted, animateOut]);

  useLayoutEffect(() => {
    if (!mounted || !open || enteredRef.current) return;
    enteredRef.current = true;
    animateIn();
  }, [mounted, open, animateIn]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, onClose]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="photo-lightbox fixed inset-0 z-[100] flex items-center justify-center p-6"
      onClick={onClose}
    >
      {/* Frost stays at full opacity on open — only tint alpha animates (opacity would kill blur). */}
      <div
        ref={veilRef}
        className="photo-lightbox__veil absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0)",
          backdropFilter: VEIL_BLUR,
          WebkitBackdropFilter: VEIL_BLUR,
        }}
      />
      <p id={titleId} className="sr-only">
        {alt || "Photo"}
      </p>
      <div
        ref={contentRef}
        className="photo-lightbox__stage relative z-10 flex max-h-[min(90dvh,920px)] max-w-[min(92vw,1100px)] flex-col items-center gap-5 opacity-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- original ratio, no radius */}
        <img
          src={src}
          alt={alt}
          className="photo-lightbox__img max-h-[min(78dvh,820px)] max-w-full object-contain"
          draggable={false}
        />
        <button
          type="button"
          aria-label="Close photo"
          onClick={onClose}
          className="hit-dash flex h-9 w-9 shrink-0 items-center justify-center bg-transparent text-[var(--fg)]"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}

type BlogPhotoProps = {
  src: string;
  alt?: string;
  /** hero = 16:9 crop; inline = natural aspect, no crop */
  variant?: "hero" | "inline";
  priority?: boolean;
  className?: string;
};

export function BlogPhoto({
  src,
  alt = "",
  variant = "inline",
  priority,
  className,
}: BlogPhotoProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `View photo: ${alt}` : "View photo"}
        className={cn(
          "blog-photo group block w-full cursor-zoom-in overflow-hidden border-0 bg-[var(--bg-hero)] p-0 text-left",
          variant === "hero"
            ? "blog-photo--hero relative aspect-[16/9]"
            : "blog-photo--inline",
          className,
        )}
      >
        {variant === "hero" ? (
          <SiteImage
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover transition-opacity duration-300 group-hover:opacity-95"
            sizes="(min-width: 880px) 880px, 100vw"
          />
        ) : (
          <SiteImage
            src={src}
            alt={alt}
            width={2400}
            height={1600}
            priority={priority}
            sizes="(min-width: 880px) 880px, 100vw"
            className="h-auto w-full object-contain transition-opacity duration-300 group-hover:opacity-95"
            style={{ width: "100%", height: "auto" }}
          />
        )}
      </button>
      <PhotoLightbox src={src} alt={alt} open={open} onClose={close} />
    </>
  );
}
