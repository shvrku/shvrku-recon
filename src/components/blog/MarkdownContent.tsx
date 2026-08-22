import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Element } from "hast";
import { BlogPhoto } from "@/components/media/BlogPhoto";

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
              <span className="prose__figure">
                <BlogPhoto src={src} alt={alt ?? ""} variant="inline" />
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
