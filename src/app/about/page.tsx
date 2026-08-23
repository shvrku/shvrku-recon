"use client";

import { useRef } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { usePageTransition } from "@/lib/page-transition";
import { ScrambleText } from "@/components/chrome/ScrambleText";
import { BlogFooter } from "@/components/chrome/BlogFooter";
import { pageCharacters } from "@/lib/page-characters";
import { SiteImage } from "@/components/media/SiteImage";
import { PortraitSignatureInline } from "@/components/effects/PortraitSignature";

const ABOUT_UPDATED = "2026-08-23";

export default function AboutPage() {
  const { navigate } = usePageTransition();
  const photoRef = useRef<HTMLDivElement>(null);
  const characters = pageCharacters(
    site.fullName,
    site.role,
    site.profileLead,
    site.bio,
    site.email,
  );

  return (
    <main className="reading-page min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
      <article className="reading-content-pad mx-auto w-full max-w-[880px] pb-18 lg:pb-24">
        <button
          type="button"
          className="hit-dash font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--fg-muted)]"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>
        <Link href="/" className="sr-only">
          Home
        </Link>

        <header className="mt-8 mb-4">
          <ScrambleText
            as="h1"
            delay={60}
            className="text-3xl leading-tight font-bold tracking-tight lg:text-5xl"
            text={site.fullName}
          />
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)] lg:text-base">
            <ScrambleText text={site.role} delay={100} />
          </p>
        </header>

        <div className="relative mt-10 aspect-square w-full max-w-[420px] overflow-visible">
          <div
            ref={photoRef}
            className="relative aspect-square w-full overflow-hidden bg-[var(--bg-hero)]"
          >
            <SiteImage
              src="/images/portrait.png"
              alt={site.fullName}
              fill
              className="object-cover"
              sizes="(min-width: 880px) 420px, 80vw"
              priority
            />
          </div>
          <PortraitSignatureInline anchorRef={photoRef} entryDelay={0.5} />
        </div>

        <p className="mt-10 max-w-[42ch] text-[7vw] leading-[0.95] font-bold tracking-tight lg:text-[2rem]">
          {site.profileLead}
        </p>
        <p className="mt-6 max-w-[54ch] text-base leading-relaxed text-[var(--fg)]">
          {site.bio}
        </p>

        <p className="mt-8 max-w-[46ch] font-mono text-sm leading-relaxed text-[var(--fg-muted)]">
          I&apos;m currently at Hinthar on their{" "}
          <Link
            href="/blog/hinthar-sms"
            className="hit-dash text-[var(--fg)] underline"
          >
            School Management System
          </Link>
          , and previously shipped{" "}
          <Link href="/blog/shvrku-site" className="hit-dash text-[var(--fg)] underline">
            shvrku-site
          </Link>{" "}
          under the{" "}
          <Link href="/blog/shvrku" className="hit-dash text-[var(--fg)] underline">
            SHVRKU
          </Link>{" "}
          identity.
          <br />
          Also special credits to the AI models and especially to{" "}
          <Link href="https://haoqi.design/" className="hit-dash text-[var(--fg)] underline">
            Haoqi Design
          </Link>{" "}
          and <Link href="https://bymonolog.com/" className="hit-dash text-[var(--fg)] underline">
            Monolog
          </Link> for the inspiration for the website design.
        </p>

        <a
          href={`mailto:${site.email}`}
          className="hit-dash mt-10 inline-block font-mono text-sm underline decoration-[var(--fg-muted)] underline-offset-4"
        >
          {site.email}
        </a>

        <BlogFooter updated={ABOUT_UPDATED} characters={characters} />
      </article>
    </main>
  );
}
