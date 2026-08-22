import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { BlogFooter } from "@/components/chrome/BlogFooter";
import { formatBlogDate } from "@/lib/dates";
import { pageCharacters } from "@/lib/page-characters";
import { MarkdownContent } from "@/components/blog/MarkdownContent";

type BlogArticleProps = {
  post: BlogPost;
  backHref?: string;
  backLabel?: string;
};

export function BlogArticle({
  post,
  backHref = "/blog",
  backLabel = "← Blog",
}: BlogArticleProps) {
  const characters = pageCharacters(
    post.title,
    post.description,
    post.kind ?? "",
    post.content,
  );

  return (
    <main className="reading-page min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
      <article className="reading-content-pad mx-auto w-full max-w-[880px] pb-18 lg:pb-24">
        <Link
          href={backHref}
          className="hit-dash font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--fg-muted)]"
        >
          {backLabel}
        </Link>

        <header className="blog-header mt-8">
          <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-2 font-mono text-sm tabular-nums text-[var(--fg-muted)] lg:text-base">
            {formatBlogDate(post.date, "long")}
          </p>
          <div className="blog-header__rule" />
          <p className="blog-header__description">{post.description}</p>
          {post.kind ? (
            <p className="mt-2 font-mono text-sm text-[var(--fg-muted)] lg:text-base">
              {post.kind}
            </p>
          ) : null}
        </header>

        <div className="mt-10">
          <MarkdownContent content={post.content} />
        </div>

        <BlogFooter updated={post.updated} characters={characters} plain />
      </article>
    </main>
  );
}
