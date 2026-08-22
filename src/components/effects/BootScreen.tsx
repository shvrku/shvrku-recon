"use client";

import { useEffect, useRef, useState } from "react";
import { useBoot } from "@/lib/boot";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import {
  dispatchSiteEnter,
  runHomeStaggerUnderCover,
} from "@/lib/home-stagger";

/** Healthy boot usually finishes in ~3–4s; offer reload if it stalls longer. */
const BOOT_RELOAD_MS = 6000;

export function BootScreen() {
  const { ready, progress, stage, logs, debug } = useBoot();
  const screenRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const readyOnMount = useRef(ready);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (ready) {
      setShowReload(false);
      return;
    }

    const id = window.setTimeout(() => setShowReload(true), BOOT_RELOAD_MS);
    return () => window.clearTimeout(id);
  }, [ready]);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    gsap.to(fill, {
      scaleX: Math.max(0.04, progress),
      duration: 0.45,
      ease: EASE.inOut,
      overwrite: "auto",
    });
  }, [progress]);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    if (ready) {
      if (readyOnMount.current) {
        gsap.set(screen, { autoAlpha: 0, pointerEvents: "none" });
        dispatchSiteEnter(window.location.pathname);
        return;
      }

      if (prefersReducedMotion()) {
        gsap.set(screen, { autoAlpha: 0, pointerEvents: "none" });
        dispatchSiteEnter(window.location.pathname);
        return;
      }

      gsap.to(screen, {
        autoAlpha: 0,
        duration: 0.55,
        ease: EASE.inOut,
        pointerEvents: "none",
        onStart: () => {
          if (window.location.pathname === "/") {
            runHomeStaggerUnderCover();
          }
        },
        onComplete: () => {
          dispatchSiteEnter(window.location.pathname);
        },
      });
    } else {
      gsap.set(screen, { autoAlpha: 1, pointerEvents: "all" });
    }
  }, [ready]);

  return (
    <>
      <div
        ref={screenRef}
        className="boot-screen"
        aria-hidden={ready}
        aria-busy={!ready}
      >
        <div className="boot-stack">
          {showReload && !ready ? (
            <button
              type="button"
              className="boot-reload hit-dash"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          ) : null}
          <div
            className="boot-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div ref={fillRef} className="boot-bar__fill" style={{ transform: "scaleX(0.04)" }} />
          </div>
        </div>
      </div>

      {debug ? (
        <aside className="boot-debug" aria-live="polite">
          <div className="boot-debug__head">
            BOOT LOG <span>SHIFT+D</span>
          </div>
          <div className="boot-debug__stage">stage: {stage}</div>
          <div className="boot-debug__stage">
            progress: {(progress * 100).toFixed(0)}%
          </div>
          <ul className="boot-debug__list">
            {logs.map((entry, i) => (
              <li key={`${entry.stage}-${i}`}>
                <span>{(entry.t / 1000).toFixed(2)}s</span> {entry.stage}
                {entry.detail ? ` — ${entry.detail}` : ""}
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </>
  );
}
