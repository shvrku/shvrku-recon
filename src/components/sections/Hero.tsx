"use client";

import { site } from "@/lib/site";
import { ScrambleText } from "@/components/chrome/ScrambleText";
import { Atmosphere } from "@/components/effects/Atmosphere";
import { HeroWordmark } from "@/components/sections/HeroWordmark";

function GlobeMark() {
  return (
    <svg
      viewBox="0 0 57 25"
      fill="none"
      aria-hidden="true"
      className="mb-[1.85em] w-[3.7em] text-current"
    >
      <ellipse
        cx="28.5"
        cy="12.45"
        rx="28.14"
        ry="12.09"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <ellipse
        cx="28.5"
        cy="12.45"
        rx="16.6"
        ry="12.09"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <ellipse
        cx="28.5"
        cy="12.45"
        rx="9.75"
        ry="12.09"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <ellipse
        cx="28.5"
        cy="12.5"
        rx="28.14"
        ry="4.14"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      <path d="M0.36 12.5H56.64" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative h-dvh overflow-hidden">
      <div className="hero-stage absolute inset-0 flex flex-col">
        <Atmosphere />
        <div className="hero-stage-veil pointer-events-none absolute inset-x-0 bottom-0 z-[2]" />
        <div className="hero-stage-fade pointer-events-none absolute inset-x-0 bottom-0 z-[3]" />
        <div className="hero-fold-seam pointer-events-none absolute inset-x-0 bottom-0 z-[4]" aria-hidden="true" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pt-[5.25rem] pb-[1.15rem] sm:px-6 lg:px-8">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
            <div data-rise>
              <GlobeMark />
            </div>
            <h1
              data-rise
              className="hero-copy max-w-[15.8rem] text-balance font-medium"
            >
              <span className="block">
                <ScrambleText text={site.headline[0]} delay={120} />
              </span>
              <span className="block">
                <ScrambleText text={site.headline[1]} delay={180} />
              </span>
            </h1>
            <p
              data-rise
              className="hero-copy mt-[1.35em] max-w-[15.8rem] text-balance font-medium opacity-[0.62]"
            >
              <span className="block">
                <ScrambleText text={site.taglineLines[0]} delay={280} />
              </span>
              <span className="block">
                <ScrambleText text={site.taglineLines[1]} delay={340} />
              </span>
            </p>
          </div>

          <div data-rise>
            <HeroWordmark text={site.brand} />
          </div>
        </div>
      </div>
    </section>
  );
}
