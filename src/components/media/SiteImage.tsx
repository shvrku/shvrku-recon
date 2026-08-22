import Image, { type ImageProps } from "next/image";

type SiteImageProps = ImageProps & {
  priority?: boolean;
};

/** Shared defaults — lazy unless above-the-fold, WebP/AVIF via next.config. */
export function SiteImage({ priority, quality = 85, loading, ...props }: SiteImageProps) {
  return (
    <Image
      {...props}
      quality={quality}
      priority={priority}
      loading={loading ?? (priority ? undefined : "lazy")}
    />
  );
}
