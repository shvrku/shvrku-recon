import { portrait, projects, type Project } from "@/lib/site";

/**
 * Widths Next.js accepts for `/_next/image` (union of imageSizes + deviceSizes).
 * Keep in sync with next.config.ts → images.
 */
export const OPTIMIZER_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 3840,
] as const;

/** Default quality — must be listed in next.config.ts → images.qualities. */
export const IMAGE_QUALITY = 85;

export function snapOptimizerWidth(width: number) {
  const w = Math.max(16, Math.round(width));
  for (const size of OPTIMIZER_WIDTHS) {
    if (size >= w) return size;
  }
  return OPTIMIZER_WIDTHS[OPTIMIZER_WIDTHS.length - 1];
}

/** Build a Next.js optimizer URL for WebGL TextureLoader / manual fetches. */
export function optimizedImageSrc(
  src: string,
  width: number,
  quality = IMAGE_QUALITY,
): string {
  if (!src.startsWith("/")) return src;
  const w = snapOptimizerWidth(width);
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`;
}

/** Pick a sensible optimizer width from layout display size (includes DPR). */
export function photoOptimizerWidth(displayWidthPx: number) {
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 2;
  return snapOptimizerWidth(displayWidthPx * dpr);
}

/** Estimate on-screen width (CSS px) for a project / portrait photo. */
export function estimatePhotoDisplayWidth(
  slug: string,
  viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280,
): number {
  if (slug === portrait.slug) {
    return viewportWidth >= 1024 ? viewportWidth * 0.25 : viewportWidth * 0.8;
  }

  const project = projects.find((p) => p.slug === slug) as Project | undefined;
  if (!project) return viewportWidth;

  if (project.layout === "spotlight") {
    return project.spotlightWidth === "wide"
      ? viewportWidth * 0.75
      : viewportWidth;
  }

  if (project.rowFill) {
    return viewportWidth * 0.5;
  }

  return viewportWidth >= 1024 ? viewportWidth / 3 : viewportWidth * 0.5;
}

/** Optimizer width ready for TextureLoader for a given photo slug. */
export function textureOptimizerWidth(slug: string) {
  return photoOptimizerWidth(estimatePhotoDisplayWidth(slug));
}
