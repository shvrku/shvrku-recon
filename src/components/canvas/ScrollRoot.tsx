"use client";

import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";
import { isReadingPage } from "@/lib/routes";
import { LenisScrollEnvBridge } from "./LenisScrollEnvBridge";
import { PointerEnvBridge } from "./PointerEnvBridge";

export function ScrollRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reading = isReadingPage(pathname);

  if (reading) {
    return (
      <>
        <PointerEnvBridge />
        <div className="reading-scroll no-scrollbar h-dvh overflow-y-auto overscroll-contain">
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <PointerEnvBridge />
      <ReactLenis
        className="no-scrollbar h-dvh overflow-y-auto overscroll-contain"
        options={{
          autoRaf: false,
          lerp: 0.075,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.15,
          syncTouch: true,
        }}
      >
        <LenisScrollEnvBridge />
        {children}
      </ReactLenis>
    </>
  );
}
