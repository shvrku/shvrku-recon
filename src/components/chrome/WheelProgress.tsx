"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";

const R = 12;
const C = 2 * Math.PI * R;

export function WheelProgress() {
  const progressRef = useRef<SVGCircleElement>(null);

  useLenis(({ progress }) => {
    const el = progressRef.current;
    if (!el) return;
    el.setAttribute("stroke-dashoffset", String(C * (1 - progress)));
  });

  return (
    <div
      className="chrome-burn pointer-events-none fixed right-0 bottom-0 z-30 flex items-center justify-center px-6 py-6 text-white lg:hidden"
      aria-hidden="true"
    >
      <svg width="24" height="24" viewBox="0 0 32 32">
        <circle
          r={R}
          cy="16"
          cx="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.22"
          transform="rotate(-90 16 16)"
        />
        <circle
          ref={progressRef}
          r={R}
          cy="16"
          cx="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={C}
          strokeDashoffset={C}
          transform="rotate(-90 16 16)"
        />
      </svg>
    </div>
  );
}
