"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { site } from "@/lib/site";
import { isReadingPage, showThemeToggle } from "@/lib/routes";
import { WORK_HREF, scrollToWork } from "@/lib/nav";
import {
  revealWorkPhotosWhenReady,
  setPhotoRevealSuppressed,
} from "@/lib/photo-reveal";
import { usePageTransition } from "@/lib/page-transition";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { ScrambleText } from "./ScrambleText";
import { ClockWeather } from "./ClockWeather";
import { PointerReadout } from "./PointerReadout";
import { Planet } from "./Planet";
import { CustomScrollbar } from "./CustomScrollbar";
import { WheelProgress } from "./WheelProgress";
import { MenuAtmosphere } from "@/components/effects/MenuAtmosphere";
import { BlogThemeToggle } from "./BlogThemeToggle";

export function SiteChrome() {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const { navigate } = usePageTransition();
  const reading = isReadingPage(pathname);
  const themeToggle = showThemeToggle(pathname);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
    };
  }, [menu, lenis]);

  useEffect(() => {
    const menuEl = menuRef.current;
    const nav = navRef.current;
    if (!menuEl || !nav) return;

    const links = gsap.utils.toArray<HTMLElement>(
      nav.querySelectorAll(".mobile-menu__link, .mobile-menu__mail"),
    );

    if (!menu) {
      gsap.killTweensOf(menuEl);
      if (links.length) gsap.killTweensOf(links);
      gsap.set(menuEl, { autoAlpha: 0 });
      if (links.length) gsap.set(links, { clearProps: "transform,opacity" });
      return;
    }

    if (prefersReducedMotion()) {
      gsap.set(menuEl, { autoAlpha: 1 });
      gsap.set(links, { autoAlpha: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      menuEl,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.4, ease: EASE.inOut },
    );
    gsap.fromTo(
      links,
      { y: "0.55em", autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.55,
        stagger: 0.05,
        delay: 0.05,
        ease: EASE.out,
      },
    );
  }, [menu]);

  const goWork = () => {
    if (pathname === "/") {
      setMenu(false);
      setPhotoRevealSuppressed(true);
      if (
        scrollToWork(lenis, () => {
          setPhotoRevealSuppressed(false);
          revealWorkPhotosWhenReady();
        })
      ) {
        return;
      }
      setPhotoRevealSuppressed(false);
    }
    navigate(WORK_HREF);
  };

  const goAbout = () => {
    navigate("/about");
  };

  const goBlog = () => {
    navigate("/blog");
  };

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      setMenu(false);
      return;
    }
    navigate("/");
  };

  return (
    <>
      {!reading ? <CustomScrollbar /> : null}
      {!reading ? <WheelProgress /> : null}

      <div
        ref={menuRef}
        className="mobile-menu md:hidden"
        data-open={menu ? "true" : "false"}
        aria-hidden={!menu}
      >
        <div className="mobile-menu__field">
          {menu ? <MenuAtmosphere /> : null}
        </div>
        <nav
          ref={navRef}
          className="mobile-menu__nav"
          aria-label="Mobile"
          inert={!menu ? true : undefined}
        >
          <button
            type="button"
            onClick={goWork}
            className="hit-dash mobile-menu__link"
          >
            <ScrambleText
              key="menu-work"
              text="WORK"
              delay={40}
              waitBoot={false}
            />
          </button>
          <button
            type="button"
            onClick={goAbout}
            className="hit-dash mobile-menu__link"
          >
            <ScrambleText
              key="menu-about"
              text="ABOUT"
              delay={80}
              waitBoot={false}
            />
          </button>
          <button
            type="button"
            onClick={goBlog}
            className="hit-dash mobile-menu__link"
          >
            BLOG
          </button>
          <a
            href={`mailto:${site.email}`}
            className="hit-dash mobile-menu__mail"
          >
            <ScrambleText
              key="menu-mail"
              text={site.email}
              delay={160}
              waitBoot={false}
            />
          </a>
          {themeToggle ? (
            <div className="mobile-menu__link">
              <BlogThemeToggle />
            </div>
          ) : null}
        </nav>
      </div>

      <header className="chrome-burn pointer-events-none fixed inset-0 z-50 flex flex-col justify-between font-mono text-[13px] uppercase tracking-[0.08em] text-white">
        <div className="site-chrome-pad flex items-start justify-between pt-5">
          <Link
            href="/"
            onClick={goHome}
            className="hit-dash pointer-events-auto font-sans text-[15px] font-bold tracking-tight normal-case"
          >
            <ScrambleText text={site.brandLong} delay={80} />
          </Link>
          <nav className="pointer-events-auto hidden items-center gap-4 md:flex">
            <button type="button" onClick={goWork} className="hit-dash">
              <ScrambleText text="WORK" delay={140} />
            </button>
            <button type="button" onClick={goAbout} className="hit-dash">
              <ScrambleText text="ABOUT" delay={160} />
            </button>
            <button type="button" onClick={goBlog} className="hit-dash normal-case">
              BLOG
            </button>
            {themeToggle ? <BlogThemeToggle /> : null}
          </nav>
          <button
            type="button"
            className="hit-dash pointer-events-auto flex min-h-6 min-w-6 flex-col items-end justify-center gap-1.5 md:hidden"
            onClick={() => setMenu((v) => !v)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            {menu ? (
              <span>CLOSE</span>
            ) : (
              <>
                <span className="block h-px w-6 bg-current" />
                <span className="block h-px w-6 bg-current" />
              </>
            )}
          </button>
        </div>

        <div className="site-chrome-pad relative flex items-end justify-between pb-5">
          <div className="pointer-events-none whitespace-nowrap">
            <ClockWeather />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center lg:flex">
            <PointerReadout />
          </div>
          <div className="pointer-events-none hidden whitespace-nowrap lg:block">
            <Planet />
          </div>
        </div>
      </header>
    </>
  );
}
