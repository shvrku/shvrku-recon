import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Element } from "hast";
import { SiteImage } from "@/components/media/SiteImage";

type MarkdownContentProps = {
  content: string;
};

function paragraphHasOnlyImage(node: Element | undefined) {
  const child = node?.children?.[0];
  return (
    node?.children?.length === 1 &&
    child?.type === "element" &&
    child.tagName === "img"
  );
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, children, ...props }) => {
            if (paragraphHasOnlyImage(node as Element | undefined)) {
              return <>{children}</>;
            }
            return <p {...props}>{children}</p>;
          },
          img: ({ src, alt }) => {
            if (!src || typeof src !== "string") return null;
            return (
              <span className="prose__figure relative block aspect-[16/10] w-full overflow-hidden bg-[var(--bg-hero)]">
                <SiteImage
                  src={src}
                  alt={alt ?? ""}
                  fill
                  className="object-cover"
                  sizes="(min-width: 880px) 880px, 100vw"
                />
              </span>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              className="prose__link"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={
                href?.startsWith("http") ? "noopener noreferrer" : undefined
              }
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
