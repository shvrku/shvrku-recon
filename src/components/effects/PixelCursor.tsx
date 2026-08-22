"use client";

import { useEffect, useRef } from "react";
import { getPointerSnapshot } from "@/lib/pointer-bus";

const CELL = 16;
const COUNT = 14;
const TRAIL = "#e8e8e3";
const DAMP = 2;
const DESKTOP = "(pointer: fine) and (hover: hover) and (min-width: 1024px)";

function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function pointerInHero(clientX: number, clientY: number) {
  const hero = document.getElementById("hero");
  if (!hero) return false;
  const r = hero.getBoundingClientRect();
  return (
    clientX >= r.left &&
    clientX <= r.right &&
    clientY >= r.top &&
    clientY <= r.bottom
  );
}

export function PixelCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef(
    Array.from({ length: COUNT }, () => ({ x: -1, y: -1, strength: 0 })),
  );
  const lastCell = useRef({ x: -1, y: -1 });

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const desktop = mq.matches;
      const p = getPointerSnapshot();
      const inHero = p.inside && pointerInHero(p.clientX, p.clientY);
      const active = desktop && p.inside && !inHero;
      const cells = trail.current;

      const from = active ? 1 : 0;
      for (let i = from; i < COUNT; i++) {
        cells[i].strength = damp(cells[i].strength, 0, DAMP, dt);
      }

      if (active) {
        const cx = Math.floor(p.clientX / CELL);
        const cy = Math.floor(p.clientY / CELL);
        if (cx !== lastCell.current.x || cy !== lastCell.current.y) {
          for (let i = COUNT - 1; i > 0; i--) {
            cells[i].x = cells[i - 1].x;
            cells[i].y = cells[i - 1].y;
            cells[i].strength = cells[i - 1].strength;
          }
          lastCell.current.x = cx;
          lastCell.current.y = cy;
        }
        cells[0].x = cx;
        cells[0].y = cy;
        cells[0].strength = 1;
      } else {
        lastCell.current.x = -1;
        lastCell.current.y = -1;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = TRAIL;
      for (let i = COUNT - 1; i >= 0; i--) {
        const s = cells[i].strength;
        if (s < 0.02 || cells[i].x < 0) continue;
        ctx.globalAlpha = s;
        ctx.fillRect(cells[i].x * CELL, cells[i].y * CELL, CELL, CELL);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[70]"
      aria-hidden="true"
    />
  );
}
