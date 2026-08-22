"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { Atmosphere } from "@/components/effects/Atmosphere";
import { HeroWordmark } from "@/components/sections/HeroWordmark";
import { Planet } from "@/components/chrome/Planet";
import { cn } from "@/lib/cn";

type PreviewMode = "og" | "favicon";

function LiveClockWeather() {
  const [clock, setClock] = useState("--:--");
  const [temp, setTemp] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: site.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const h = parts.find((p) => p.type === "hour")?.value ?? "--";
      const m = parts.find((p) => p.type === "minute")?.value ?? "--";
      setClock(`${h}:${m}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const { lat, lon } = site.weather;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`,
    )
      .then((r) => r.json())
      .then((d) => {
        const t = d?.current?.temperature_2m;
        if (typeof t === "number") setTemp(`${Math.round(t)}°C`);
      })
      .catch(() => {});
  }, []);

  return (
    <span className="inline-flex gap-2 tabular-nums tracking-wide">
      <span>
        {site.timezoneLabel} {clock}
      </span>
      {temp ? <span>{temp}</span> : null}
    </span>
  );
}

function OgLivePreview() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8">
        <HeroWordmark text={site.brand} />
      </div>
      <div className="chrome-burn pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-10 pb-8 font-mono text-[13px] uppercase tracking-[0.08em] text-white">
        <LiveClockWeather />
        <Planet />
      </div>
    </>
  );
}

function FaviconLivePreview() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-[18%]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.svg"
        alt=""
        className="h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );
}

const MODES: { id: PreviewMode; label: string; hint: string }[] = [
  {
    id: "og",
    label: "OG image",
    hint: "Screenshot · 1200×630 · save as public/og.png",
  },
  {
    id: "favicon",
    label: "Favicon",
    hint: "Screenshot · 512×512 · save as public/favicon.ico",
  },
];

export function LivePreviews() {
  const [mode, setMode] = useState<PreviewMode>("og");
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <div className="og-preview-page">
      <div
        className="mb-2 flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em]"
        role="tablist"
        aria-label="Preview mode"
      >
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            onClick={() => setMode(item.id)}
            className={cn(
              "hit-dash px-3 py-1.5 transition-colors",
              mode === item.id
                ? "bg-[var(--card)] text-[var(--fg)]"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "og-preview-frame",
          mode === "og" ? "og-preview-frame--og" : "og-preview-frame--icon",
        )}
      >
        <div className="hero-stage relative h-full w-full overflow-hidden">
          <Atmosphere crushBottom={false} />
          {mode === "og" ? <OgLivePreview /> : <FaviconLivePreview />}
        </div>
      </div>

      <p className="og-preview-hint font-mono text-[11px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
        {active.hint}
      </p>
    </div>
  );
}
