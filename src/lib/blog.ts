import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { blogDateMs } from "@/lib/dates";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  kind?: string;
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  content: string;
};

export type CaseStudyFrontmatter = BlogFrontmatter & {
  type: "case-study";
  year: string;
  role: string;
  /** Hero image on the case study page */
  image?: string;
};

export type CaseStudy = CaseStudyFrontmatter & {
  slug: string;
  content: string;
};

export type BlogIndexEntry = {
  slug: string;
  title: string;
  description: string;
  date: string;
  kind?: string;
  isCaseStudy: boolean;
};

function readRaw(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function isCaseStudyFile(raw: string) {
  const { data } = matter(raw);
  return (data as { type?: string }).type === "case-study";
}

function parseNote(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const fm = data as Partial<BlogFrontmatter & { type?: string }>;

  if (fm.type === "case-study") {
    throw new Error(`"${slug}" is a case study — use getCaseStudy() instead.`);
  }

  if (!fm.title || !fm.description || !fm.date) {
    throw new Error(
      `Blog post "${slug}" is missing required frontmatter (title, description, date).`,
    );
  }

  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    updated: fm.updated ?? fm.date,
    kind: fm.kind,
    content: content.trim(),
  };
}

function parseCaseStudy(slug: string, raw: string): CaseStudy {
  const { data, content } = matter(raw);
  const fm = data as Partial<CaseStudyFrontmatter>;

  if (fm.type !== "case-study") {
    throw new Error(`"${slug}" is not a case study.`);
  }

  if (
    !fm.title ||
    !fm.description ||
    !fm.date ||
    !fm.year ||
    !fm.role
  ) {
    throw new Error(
      `Case study "${slug}" is missing required frontmatter (title, description, date, year, role).`,
    );
  }

  return {
    slug,
    type: "case-study",
    title: fm.title,
    description: fm.description,
    date: fm.date,
    updated: fm.updated ?? fm.date,
    kind: fm.kind,
    year: fm.year,
    role: fm.role,
    image: fm.image,
    content: content.trim(),
  };
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .filter((slug) => {
      const raw = readRaw(slug);
      return raw != null && !isCaseStudyFile(raw);
    });
}

export function getCaseStudySlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .filter((slug) => {
      const raw = readRaw(slug);
      return raw != null && isCaseStudyFile(raw);
    });
}

export function getAllContentSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getBlogPost(slug: string): BlogPost | null {
  const raw = readRaw(slug);
  if (!raw || isCaseStudyFile(raw)) return null;
  return parseNote(slug, raw);
}

export function getCaseStudy(slug: string): CaseStudy | null {
  const raw = readRaw(slug);
  if (!raw || !isCaseStudyFile(raw)) return null;
  return parseCaseStudy(slug, raw);
}

export function getAllBlogPosts(): BlogPost[] {
  return getBlogSlugs()
    .map((slug) => getBlogPost(slug))
    .filter((post): post is BlogPost => post != null)
    .sort((a, b) => blogDateMs(b.date) - blogDateMs(a.date));
}

export function getAllCaseStudies(): CaseStudy[] {
  return getCaseStudySlugs()
    .map((slug) => getCaseStudy(slug))
    .filter((study): study is CaseStudy => study != null)
    .sort((a, b) => blogDateMs(b.date) - blogDateMs(a.date));
}

export function getAllBlogIndexEntries(): BlogIndexEntry[] {
  const notes: BlogIndexEntry[] = getAllBlogPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    kind: post.kind,
    isCaseStudy: false,
  }));

  const studies: BlogIndexEntry[] = getAllCaseStudies().map((study) => ({
    slug: study.slug,
    title: study.title,
    description: study.description,
    date: study.date,
    kind: study.kind,
    isCaseStudy: true,
  }));

  return [...notes, ...studies].sort(
    (a, b) => blogDateMs(b.date) - blogDateMs(a.date),
  );
}
