"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/lib/theme";
import { BootProvider } from "@/lib/boot";
import { PageTransitionProvider } from "@/lib/page-transition";
import { ScrollRoot } from "@/components/canvas/ScrollRoot";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { PixelCursor } from "@/components/effects/PixelCursor";
import { BootScreen } from "@/components/effects/BootScreen";
import { isLivePreviewPage, isMinimalChromePage } from "@/lib/routes";

const CanvasRoot = dynamic(
  () => import("@/components/canvas/CanvasRoot").then((m) => m.CanvasRoot),
  { ssr: false },
);

function EffectsLayer() {
  const pathname = usePathname();
  if (isMinimalChromePage(pathname)) return null;

  return (
    <>
      <CanvasRoot />
      <PixelCursor />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const livePreview = isLivePreviewPage(pathname);

  return (
    <ThemeProvider>
      <BootProvider>
        <PageTransitionProvider>
          {!livePreview ? <BootScreen /> : null}
          <ScrollRoot>
            <EffectsLayer />
            {!livePreview ? <SiteChrome /> : null}
            <div className="relative">{children}</div>
          </ScrollRoot>
        </PageTransitionProvider>
      </BootProvider>
    </ThemeProvider>
  );
}
