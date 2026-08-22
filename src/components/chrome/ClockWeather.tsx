"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { ScrambleText } from "./ScrambleText";

export function ClockWeather() {
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
      {temp ? <ScrambleText text={temp} delay={80} /> : null}
    </span>
  );
}
