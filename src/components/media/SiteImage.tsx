import Image, { type ImageProps } from "next/image";
import { IMAGE_QUALITY } from "@/lib/image";

type SiteImageProps = ImageProps & {
  priority?: boolean;
};

/**
 * Shared Next.js image wrapper — AVIF/WebP + responsive sizes via next.config.
 * Use this for every DOM photo so nothing bypasses the Vercel optimizer.
 */
export function SiteImage({
  priority,
  quality = IMAGE_QUALITY,
  loading,
  ...props
}: SiteImageProps) {
  return (
    <Image
      {...props}
      quality={quality}
      priority={priority}
      loading={loading ?? (priority ? undefined : "lazy")}
    />
  );
}
