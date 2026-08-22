"use client";

import { useSyncExternalStore } from "react";
import { getPointerSnapshot, subscribePointer } from "@/lib/pointer-bus";

const empty = { clientX: 0, clientY: 0 };

export function PointerReadout() {
  const p = useSyncExternalStore(
    subscribePointer,
    getPointerSnapshot,
    () => empty as ReturnType<typeof getPointerSnapshot>,
  );
  const x = String(Math.round(p.clientX)).padStart(4, "0");
  const y = String(Math.round(p.clientY)).padStart(4, "0");
  return (
    <span className="inline-block min-w-[11ch] text-center tabular-nums tracking-wide">
      {x} X {y} Y
    </span>
  );
}
