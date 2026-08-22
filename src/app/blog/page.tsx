import Link from "next/link";
import { getAllBlogIndexEntries } from "@/lib/blog";
import { formatBlogDate } from "@/lib/dates";
import { ReadingPageShell } from "@/components/blog/ReadingPageShell";

export default function BlogIndexPage() {
  const entries = getAllBlogIndexEntries();

  return (
    <ReadingPageShell>
      <main className="reading-page min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
        <div className="reading-content-pad mx-auto w-full max-w-[880px] pb-18 lg:pb-24">
          <Link
            href="/"
            className="hit-dash font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--fg-muted)]"
          >
            ← Home
          </Link>

          <header className="blog-header mt-8">
            <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-5xl">
              Blog
            </h1>
            <p className="mt-2 max-w-[48ch] text-base leading-relaxed text-[var(--fg-muted)]">
              Notes and case studies — write in{" "}
              <code className="font-mono text-[0.92em] text-[var(--fg-soft)]">
                content/blog/*.md
              </code>{" "}
              with frontmatter at the top.
            </p>
          </header>

          <ul className="mt-12 divide-y divide-[color:var(--line)]">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/blog/${entry.slug}`}
                  className="group block py-6 transition-opacity hover:opacity-80"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
                      {entry.title}
                    </h2>
                    <time
                      dateTime={entry.date}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--fg-muted)]"
                    >
                      {formatBlogDate(entry.date, "short")}
                    </time>
                  </div>
                  {entry.kind ? (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-muted)]">
                      {entry.kind}
                    </p>
                  ) : null}
                  <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-[var(--fg-muted)] lg:text-base">
                    {entry.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </ReadingPageShell>
  );
}
