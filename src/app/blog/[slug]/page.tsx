import { notFound } from "next/navigation";
import {
  getAllContentSlugs,
  getBlogPost,
  getCaseStudy,
} from "@/lib/blog";
import { BlogArticle } from "@/components/blog/BlogArticle";
import { CaseStudyArticle } from "@/components/blog/CaseStudyArticle";
import { ReadingPageShell } from "@/components/blog/ReadingPageShell";

export function generateStaticParams() {
  return getAllContentSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (study) {
    return (
      <ReadingPageShell>
        <CaseStudyArticle study={study} />
      </ReadingPageShell>
    );
  }

  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <ReadingPageShell>
      <BlogArticle post={post} />
    </ReadingPageShell>
  );
}
