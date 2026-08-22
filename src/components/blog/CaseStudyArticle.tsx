"use client";

import Link from "next/link";
import type { CaseStudy } from "@/lib/blog";
import { ScrambleText } from "@/components/chrome/ScrambleText";
import { BlogFooter } from "@/components/chrome/BlogFooter";
import { formatBlogDate } from "@/lib/dates";
import { pageCharacters } from "@/lib/page-characters";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { BlogPhoto } from "@/components/media/BlogPhoto";

type CaseStudyArticleProps = {
  study: CaseStudy;
};

export function CaseStudyArticle({ study }: CaseStudyArticleProps) {
  const metaKind = study.kind ?? "";
  const metaLine = [metaKind, study.year].filter(Boolean).join(" · ");

  const characters = pageCharacters(
    study.title,
    study.description,
    metaKind,
    study.year,
    study.role,
    study.content,
  );

  return (
    <main className="reading-page min-h-[140dvh] bg-[var(--bg)] text-[var(--fg)]">
      <article className="reading-content-pad mx-auto w-full max-w-[880px] pb-18 lg:pb-24">
        <Link
          href="/blog"
          className="hit-dash font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--fg-muted)]"
        >
          ← Blog
        </Link>

        <header className="mt-8 mb-4">
          <ScrambleText
            as="h1"
            delay={60}
            className="text-3xl leading-tight font-bold tracking-tight lg:text-5xl"
            text={study.title}
          />
          <p className="mt-1 font-mono text-sm tabular-nums text-[var(--fg-muted)] lg:text-base">
            <ScrambleText
              text={formatBlogDate(study.updated ?? study.date, "long")}
              delay={100}
            />
          </p>
          <div className="mt-2 border-b border-[color:var(--line)]" />
          {metaLine ? (
            <p className="pt-3 font-mono text-sm text-[var(--fg-muted)] lg:text-base">
              <ScrambleText delay={140} text={metaLine} />
            </p>
          ) : null}
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)] lg:text-base">
            <ScrambleText delay={180} text={study.role} />
          </p>
        </header>

        <p className="mt-8 max-w-[54ch] text-base leading-relaxed text-[var(--fg)]">
          {study.description}
        </p>

        {study.image ? (
          <div className="mt-10">
            <BlogPhoto
              src={study.image}
              alt={study.title}
              variant="hero"
              priority
            />
          </div>
        ) : null}

        {study.content ? (
          <div className="mt-10">
            <MarkdownContent content={study.content} />
          </div>
        ) : null}

        <BlogFooter updated={study.updated} characters={characters} />
      </article>
    </main>
  );
}
