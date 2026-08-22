"use client";

import { useEffect, useRef } from "react";

function makeGrainUrl(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 60 + Math.random() * 160;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

/** Hero-like grey mist + grain + soft blurs — no liquid WebGL. */
export function MenuAtmosphere({ frost = false }: { frost?: boolean }) {
  const grainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (grainRef.current && !grainRef.current.style.backgroundImage) {
      grainRef.current.style.backgroundImage = `url(${makeGrainUrl()})`;
    }
  }, []);

  return (
    <div
      className={frost ? "menu-atmosphere menu-atmosphere--frost" : "menu-atmosphere"}
      aria-hidden="true"
    >
      <div className="menu-atmosphere__base" />
      <div className="menu-atmosphere__mist" />
      <div className="menu-atmosphere__bloom menu-atmosphere__bloom--a" />
      <div className="menu-atmosphere__bloom menu-atmosphere__bloom--b" />
      <div className="menu-atmosphere__bloom menu-atmosphere__bloom--c" />
      <div className="menu-atmosphere__veil" />
      <div ref={grainRef} className="hero-grain menu-atmosphere__grain" />
    </div>
  );
}
