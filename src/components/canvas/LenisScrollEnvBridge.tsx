"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";
import { bindLenisScrollBus } from "@/lib/scroll-bus";
import { scrollToHash } from "@/lib/nav";
import {
  revealWorkPhotosWhenReady,
  setPhotoRevealSuppressed,
} from "@/lib/photo-reveal";

function finishHashScroll(hash: string) {
  setPhotoRevealSuppressed(false);
  if (hash === "#work") {
    requestAnimationFrame(revealWorkPhotosWhenReady);
  }
}

function scrollToCurrentHash(lenis: Lenis) {
  const hash = window.location.hash;

  if (!hash || hash === "#") {
    lenis.scrollTo(0, { immediate: true });
    return;
  }

  setPhotoRevealSuppressed(true);
  const scrolled = scrollToHash(hash, lenis, -20, () => finishHashScroll(hash));
  if (!scrolled) {
    setPhotoRevealSuppressed(false);
    lenis.scrollTo(0, { immediate: true });
  }
}

export function LenisScrollEnvBridge() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    bindLenisScrollBus(lenis ?? null);
    return () => bindLenisScrollBus(null);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;

    let id = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;

    const id = requestAnimationFrame(() => {
      lenis.resize();
      scrollToCurrentHash(lenis);
    });

    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  useEffect(() => {
    if (!lenis) return;

    const onHashChange = () => scrollToCurrentHash(lenis);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [lenis]);

  return null;
}
