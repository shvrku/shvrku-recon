"use client";

import { site } from "@/lib/site";
import { Atmosphere } from "@/components/effects/Atmosphere";

export function SiteFooter() {
  return (
    <footer
      data-rise
      className="disrupt-band relative isolate mt-8 min-h-[42vh] overflow-hidden bg-[var(--bg-hero)] lg:min-h-[48vh]"
    >
      <Atmosphere crushBottom={false} />
      <div className="relative z-10 flex min-h-[42vh] items-center justify-between gap-4 px-4 py-10 sm:gap-8 sm:px-6 lg:min-h-[48vh] lg:px-8 lg:py-12">
        <p className="shrink-0 select-none text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.8] tracking-tight text-[var(--fg-soft)] opacity-60">
          {site.brand}
        </p>
        <p className="whitespace-nowrap text-right font-sans text-[clamp(0.62rem,2.15vw,0.875rem)] leading-none text-[var(--fg)]">
          「{site.footerQuote}」
        </p>
      </div>
    </footer>
  );
}
