"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { portrait, site } from "@/lib/site";
import { registerDomTarget } from "@/lib/dom-targets";
import { usePhotoReveal } from "@/lib/photo-reveal";
import { SiteImage } from "@/components/media/SiteImage";
import {
  PortraitSignatureOverlay,
} from "@/components/effects/PortraitSignature";

export function Profile() {
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerDomTarget(portrait.slug, photoRef.current);
    return () => registerDomTarget(portrait.slug, null);
  }, []);

  usePhotoReveal(portrait.slug, photoRef);

  return (
    <section id="about" className="layout-grid py-18 lg:py-24 lg:pb-28">
      <div className="col-span-2 lg:col-span-1">
        <div className="relative aspect-square w-full overflow-visible">
          <div
            ref={photoRef}
            data-photo
            className="photo-field photo-field--gl relative aspect-square w-full overflow-hidden"
          >
            <SiteImage
              src={portrait.image}
              alt={site.fullName}
              fill
              className="photo-field__stand-in pointer-events-none object-cover opacity-0"
              sizes="(min-width: 1024px) 25vw, 80vw"
              priority
            />
          </div>
        </div>
      </div>
      <PortraitSignatureOverlay anchorRef={photoRef} />

      <div
        className="col-span-2 mt-10 flex flex-col justify-end gap-8 lg:col-span-2 lg:mt-0"
        data-rise
      >
        <p className="max-w-[22ch] text-[7vw] leading-[0.95] font-bold tracking-tight lg:text-[2.8vw]">
          {site.profileLead}
        </p>
        <p className="max-w-[46ch] font-mono text-sm leading-relaxed text-[var(--fg-muted)]">
          I&apos;m currently at{" "}
          <Link
            href="/blog/hinthar-sms"
            className="hit-dash text-[var(--fg)] underline"
          >
            Hinthar
          </Link>{" "}
          working on their{" "}
          <Link
            href="/blog/hinthar-sms"
            className="hit-dash text-[var(--fg)] underline"
          >
            School Management System
          </Link>
          , and previously shipped{" "}
          <Link
            href="/blog/shvrku-site"
            className="hit-dash text-[var(--fg)] underline"
          >
            shvrku-site
          </Link>{" "}
          under the{" "}
          <Link href="/blog/shvrku" className="hit-dash text-[var(--fg)] underline">
            SHVRKU
          </Link>{" "}
          identity.
        </p>
      </div>
    </section>
  );
}
