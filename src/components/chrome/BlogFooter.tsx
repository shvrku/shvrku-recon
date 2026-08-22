"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { formatBlogDate } from "@/lib/dates";
import { pageCharacters } from "@/lib/page-characters";
import { usePageTransition } from "@/lib/page-transition";
import { ScrambleText } from "./ScrambleText";

export type BlogMetaField = {
  label: string;
  value: string;
};

export { pageCharacters };

type BlogFooterProps = {
  /** ISO date `YYYY-MM-DD` → “Last Updated” */
  updated?: string;
  /** Visible character count → “Characters” */
  characters?: number;
  /** Extra rows after the built-in ones */
  extra?: BlogMetaField[];
  /** Full custom grid — skips updated/characters (Dimensions still appended unless omitted) */
  fields?: BlogMetaField[];
  /** Include live viewport size (default true) */
  showDimensions?: boolean;
  /** Skip scramble animation — use on markdown blog pages */
  plain?: boolean;
};

export function BlogFooter({
  updated,
  characters,
  extra = [],
  fields,
  showDimensions = true,
  plain = false,
}: BlogFooterProps) {
  const { navigate } = usePageTransition();
  const [size, setSize] = useState("—");

  useEffect(() => {
    const read = () => setSize(`${window.innerWidth}×${window.innerHeight}`);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const goHome = () => navigate("/");
  const goAbout = () => navigate("/about");
  const goBlog = () => navigate("/blog");

  const rows: BlogMetaField[] = fields
    ? [...fields]
    : [
        ...(updated
          ? [{ label: "Last Updated", value: formatBlogDate(updated, "footer") }]
          : []),
        ...(characters != null
          ? [
              {
                label: "Characters",
                value: characters.toLocaleString("en-US"),
              },
            ]
          : []),
        ...extra,
      ];

  if (showDimensions) {
    rows.splice(
      Math.min(1, rows.length),
      0,
      { label: "Dimensions", value: size },
    );
  }

  const linkClass =
    "hit-dash inline-block px-1 py-0.5 text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]";

  const MetaValue = ({ text }: { text: string }) =>
    plain ? (
      <span>{text}</span>
    ) : (
      <ScrambleText inView text={text} />
    );

  return (
    <footer
      data-blog-footer="true"
      className="mt-16 rounded-lg bg-[var(--card)] p-4 lg:p-5"
    >
      <div className="mb-4 font-sans text-base font-semibold tracking-tight">
        Metadata
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-3">
        {rows.map((field) => (
          <div key={field.label} className="flex flex-col gap-1.5">
            <dt className="font-sans text-sm font-semibold">{field.label}</dt>
            <dd className="font-mono text-sm tabular-nums text-[var(--fg-muted)]">
              <MetaValue text={field.value} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="my-5 border-t border-dashed border-[color:var(--line)]" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
        <div className="hidden font-sans text-sm font-semibold lg:block">
          Links
        </div>
        <div className="flex flex-col items-start gap-1 font-mono">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              goHome();
            }}
            className={linkClass}
          >
            Home
          </Link>
          <button
            type="button"
            onClick={goBlog}
            className={`${linkClass} text-left`}
          >
            Blog
          </button>
          <button
            type="button"
            onClick={goAbout}
            className={`${linkClass} text-left`}
          >
            About
          </button>
        </div>
        <div className="flex flex-col items-start gap-1 font-mono">
          {site.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
