"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { useBoot } from "@/lib/boot";
import { useTheme } from "@/lib/theme";
import {
  dispatchSiteEnter,
  runHomeStaggerUnderCover,
} from "@/lib/home-stagger";
import { overlayColorForPath } from "@/lib/transition-colors";

type PageTransitionContextValue = {
  navigate: (href: string) => void;
  transitioning: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigate: () => {},
  transitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

function isInternalHref(href: string) {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("#")) return false;
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function hrefKey(href: string) {
  const url = new URL(href, window.location.origin);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready: bootReady } = useBoot();
  const { theme: userTheme } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);
  const awaitingReveal = useRef(false);
  const busy = useRef(false);
  const pendingPath = useRef("/");

  const reveal = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) {
      busy.current = false;
      setTransitioning(false);
      awaitingReveal.current = false;
      return;
    }

    const goingHome =
      pendingPath.current === "/" || pendingPath.current === "";

    if (goingHome) {
      runHomeStaggerUnderCover();
    }

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.45,
      ease: EASE.inOut,
      onComplete: () => {
        gsap.set(overlay, { pointerEvents: "none" });
        busy.current = false;
        setTransitioning(false);
        awaitingReveal.current = false;
        dispatchSiteEnter(pendingPath.current);
      },
    });
  }, []);

  useEffect(() => {
    if (!awaitingReveal.current) return;
    reveal();
  }, [pathname, reveal]);

  const navigate = useCallback(
    (href: string) => {
      if (busy.current || !bootReady) return;

      const currentKey = hrefKey(
        `${pathname}${typeof window !== "undefined" ? window.location.search : ""}${typeof window !== "undefined" ? window.location.hash : ""}`,
      );
      const targetKey = hrefKey(href);
      if (targetKey === currentKey) return;

      const url = new URL(href, window.location.origin);
      pendingPath.current = url.pathname;
      const overlayColor = overlayColorForPath(url.pathname, userTheme);

      if (prefersReducedMotion()) {
        router.push(href);
        dispatchSiteEnter(url.pathname);
        return;
      }

      const overlay = overlayRef.current;
      if (!overlay) {
        router.push(href);
        dispatchSiteEnter(url.pathname);
        return;
      }

      busy.current = true;
      setTransitioning(true);
      awaitingReveal.current = true;

      gsap.set(overlay, {
        pointerEvents: "all",
        backgroundColor: overlayColor,
      });
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.32,
        ease: EASE.inOut,
        onComplete: () => {
          router.push(href);
        },
      });
    },
    [pathname, router, bootReady, userTheme],
  );

  useEffect(() => {
    const overlay = overlayRef.current;
    if (overlay) gsap.set(overlay, { opacity: 0, backgroundColor: "#000000" });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!bootReady || e.defaultPrevented || busy.current) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || !isInternalHref(href)) return;

      e.preventDefault();
      navigate(href);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate, bootReady]);

  return (
    <PageTransitionContext.Provider value={{ navigate, transitioning }}>
      {children}
      <div
        ref={overlayRef}
        className="page-transition"
        aria-hidden="true"
        data-active={transitioning ? "true" : "false"}
      />
    </PageTransitionContext.Provider>
  );
}
