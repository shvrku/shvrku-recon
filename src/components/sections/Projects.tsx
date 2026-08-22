"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { projects, projectHref, type SpotlightAlign, type SpotlightWidth } from "@/lib/site";
import { registerDomTarget } from "@/lib/dom-targets";
import { usePhotoReveal } from "@/lib/photo-reveal";
import { usePageTransition } from "@/lib/page-transition";
import { SiteImage } from "@/components/media/SiteImage";
import { cn } from "@/lib/cn";
import { ScrambleText } from "@/components/chrome/ScrambleText";
import { PhotoKindBadge } from "@/components/chrome/PhotoKindBadge";

function getColSpan(
  layout: (typeof projects)[number]["layout"],
  spotlightWidth: SpotlightWidth = "full",
  rowFill = false,
) {
  if (layout === "spotlight") {
    return spotlightWidth === "wide"
      ? "col-span-2 lg:col-span-9"
      : "col-span-2 lg:col-span-12";
  }

  return rowFill ? "col-span-1 lg:col-span-6" : "col-span-1 lg:col-span-4";
}

function getColStart(
  layout: (typeof projects)[number]["layout"],
  spotlightWidth: SpotlightWidth = "full",
  spotlightAlign: SpotlightAlign = "left",
) {
  if (layout !== "spotlight" || spotlightWidth !== "wide") return undefined;
  return spotlightAlign === "right" ? "lg:col-start-4" : "lg:col-start-1";
}

function getImageSizes(
  layout: (typeof projects)[number]["layout"],
  spotlightWidth: SpotlightWidth = "full",
  rowFill = false,
) {
  if (layout === "spotlight") {
    return spotlightWidth === "wide" ? "75vw" : "100vw";
  }

  if (rowFill) return "(min-width: 1024px) 50vw, 50vw";
  return "(min-width: 1024px) 33vw, 50vw";
}

function Card({
  slug,
  title,
  year,
  kind,
  layout,
  spotlightWidth = "full",
  spotlightAlign = "left",
  rowFill = false,
  image,
  external,
}: (typeof projects)[number]) {
  const ref = useRef<HTMLDivElement>(null);
  const { navigate } = usePageTransition();
  const spotlight = layout === "spotlight";
  const href = projectHref(slug);

  useEffect(() => {
    registerDomTarget(slug, ref.current);
    return () => registerDomTarget(slug, null);
  }, [slug]);

  usePhotoReveal(slug, ref);

  const onClick = (e: React.MouseEvent) => {
    if (external) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative mb-12 block",
        getColSpan(layout, spotlightWidth, rowFill),
        getColStart(layout, spotlightWidth, spotlightAlign),
      )}
    >
      <div className="relative mb-3">
        <div
          ref={ref}
          data-photo
          className="photo-field photo-field--gl relative w-full overflow-hidden"
          style={{ aspectRatio: spotlight ? "16 / 9" : "16 / 10" }}
        >
          <SiteImage
            src={image}
            alt={title}
            fill
            className="photo-field__stand-in pointer-events-none object-cover opacity-0"
            sizes={getImageSizes(layout, spotlightWidth, rowFill)}
          />
        </div>
        <PhotoKindBadge photoRef={ref} kind={kind} />
      </div>
      <div className="flex items-baseline justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.14em]">
        <ScrambleText inView className="min-w-0 opacity-70" text={title} />
        <ScrambleText
          inView
          delay={80}
          className="shrink-0 opacity-70"
          text={year}
        />
      </div>
    </Link>
  );
}

export function Projects() {
  return (
    <section id="work" className="py-18 lg:py-24">
      <div className="projects-grid">
        {projects.map((p) => (
          <Card key={p.slug} {...p} />
        ))}
      </div>
    </section>
  );
}
