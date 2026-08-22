"use client";

import { useEffect } from "react";
import { bindPointerBus } from "@/lib/pointer-bus";

/** Pointer tracking for chrome readout — runs on every route (including reading pages). */
export function PointerEnvBridge() {
  useEffect(() => bindPointerBus(), []);
  return null;
}
