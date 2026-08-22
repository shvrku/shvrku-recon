"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { usePageTransition } from "@/lib/page-transition";
import { ScrambleText } from "@/components/chrome/ScrambleText";
import { BlogFooter } from "@/components/chrome/BlogFooter";
import { pageCharacters } from "@/lib/page-characters";
import { SiteImage } from "@/components/media/SiteImage";

const ABOUT_UPDATED = "2026-08-22";

export default function AboutPage() {
  const { navigate } = usePageTransition();
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

        <div className="relative mt-10 aspect-square w-full max-w-[420px] overflow-hidden bg-[var(--bg-hero)]">
          <SiteImage
            src="/images/portrait.png"
            alt={site.fullName}
            fill
            className="object-cover"
            sizes="(min-width: 880px) 420px, 80vw"
            priority
          />
        </div>

        <p className="mt-10 max-w-[42ch] text-[7vw] leading-[0.95] font-bold tracking-tight lg:text-[2rem]">
          {site.profileLead}
        </p>
        <p className="mt-6 max-w-[54ch] text-base leading-relaxed text-[var(--fg)]">
          {site.bio}
        </p>

        <p className="mt-8 max-w-[46ch] font-mono text-sm leading-relaxed text-[var(--fg-muted)]">
          I&apos;m building{" "}
          <Link href="/blog/helix" className="hit-dash text-[var(--fg)] underline">
            Helix
          </Link>
          , and previously worked on{" "}
          <Link href="/blog/drift" className="hit-dash text-[var(--fg)] underline">
            Drift
          </Link>
          ,{" "}
          <Link href="/blog/lattice" className="hit-dash text-[var(--fg)] underline">
            Lattice
          </Link>
          , and{" "}
          <Link href="/blog/umbra" className="hit-dash text-[var(--fg)] underline">
            Umbra
          </Link>
          .
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
