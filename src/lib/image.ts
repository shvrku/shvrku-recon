/** Build a Next.js optimizer URL for WebGL TextureLoader / manual fetches. */
export function optimizedImageSrc(
  src: string,
  width: number,
  quality = 85,
): string {
  if (!src.startsWith("/")) return src;
  const w = Math.max(16, Math.round(width));
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`;
}

/** Pick a sensible optimizer width from layout display size. */
export function photoOptimizerWidth(displayWidthPx: number) {
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 2;
  const raw = displayWidthPx * dpr;
  if (raw <= 640) return 640;
  if (raw <= 1080) return 1080;
  if (raw <= 1920) return 1920;
  return 3840;
}
