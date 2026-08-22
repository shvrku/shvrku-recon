export type ProjectLayout = "spotlight" | "table";

/** spotlight only — full row vs ~75% width. */
export type SpotlightWidth = "full" | "wide";

/** When spotlightWidth is wide — which side the card sits on. */
export type SpotlightAlign = "left" | "right";

export type Project = {
  slug: string;
  title: string;
  year: string;
  kind: string;
  /**
   * spotlight — featured row (see spotlightWidth)
   * table — grid cell (see rowFill)
   */
  layout: ProjectLayout;
  /** When layout is spotlight: span the full row or ~75%. Defaults to full. */
  spotlightWidth?: SpotlightWidth;
  /** When spotlightWidth is wide: align to the left or right edge. Defaults to left. */
  spotlightAlign?: SpotlightAlign;
  /** When layout is table: pair spans half the row each (50%) vs a third (33%). */
  rowFill?: boolean;
  image: string;
  hover: string;
  external?: boolean;
};

export const portrait = {
  slug: "portrait",
  image: "/images/portrait.png",
  hover: "/images/portrait.png",
  /** Scroll curl only — no hover color reveal. */
  curlOnly: true,
};

export const site = {
  /** Short mark — hero wordmark, footer, copyright. */
  brand: "SHVRKU",
  /** Long mark — nav / chrome. */
  brandLong: "SHVRKU.RECON",
  domain: "shvrku.recon.asia",
  fullName: "Shvrku",
  role: "System Architect & Engineer",
  tagline: "Engineering systems. Designed with care.",
  taglineLines: ["Engineering systems.", "Designed with care."],
  headline: ["Bringing craft & taste", "to digital work."],
  bio: "I lead design engineering and AI exploration, shaping products where interface, systems, and model behavior meet. Outside commissioned work, I build tools that make teams faster without making them careless.",
  profileLead:
    "Steering agents to build experices, creating the next generation of digital products.",
  profileBody:
    "I'm curently at Hinthar working on their School Management System, and previously worked on my own personal projects to sharpen my skills and quality of work.",
  timezone: "Asia/Yangon",
  timezoneLabel: "YGN",
  weather: { lat: 16.8409, lon: 96.1735 },
  footerQuote: "Refuse to be underestimated.",
  /** Placeholder address — scramble animates into this fixed string. */
  email: "%^&*@gmail.com",
  year: 2026,
  socials: [
    { label: "Twitter/X", href: "https://x.com/shvrku" },
    { label: "GitHub", href: "https://github.com/shvrku" },
    { label: "Figma", href: "https://www.figma.com/@shvrku" },
  ],
};

/** Homepage work grid — visual/layout only. Links to `/blog/{slug}` when a write-up exists. */
export const projects: Project[] = [
  {
    slug: "hinthar-sms",
    title: "Hinthar School Management System",
    year: "2026-Present",
    kind: "Coding Project",
    layout: "spotlight",
    spotlightWidth: "wide",
    spotlightAlign: "right",
    image: "/images/project-hinthar-sms.png",
    hover: "/images/project-hinthar-sms.png",
  },
  {
    slug: "mono",
    title: "Mono",
    year: "2025",
    kind: "Coding Project",
    layout: "table",
    rowFill: true,
    image: "/images/project-mono.png",
    hover: "/images/project-mono-hover.png",
  },
  {
    slug: "shvrku",
    title: "SHVRKU",
    year: "2020-Present",
    kind: "Brand Identity",
    layout: "table",
    rowFill: true,
    image: "/og.png",
    hover: "/og.png",
  },
  {
    slug: "umbra",
    title: "Umbra",
    year: "2021",
    kind: "Coding Project",
    layout: "table",
    image: "/images/project-umbra.png",
    hover: "/images/project-umbra-hover.png",
  },
  {
    slug: "drift",
    title: "Drift",
    year: "2020-2022",
    kind: "Product",
    layout: "table",
    image: "/images/project-drift.png",
    hover: "/images/project-drift-hover.png",
  },
  {
    slug: "shore",
    title: "Shore",
    year: "2022",
    kind: "Identity",
    layout: "table",
    rowFill: true,
    image: "/images/project-shore.png",
    hover: "/images/project-shore-hover.png",
  },
  {
    slug: "lattice",
    title: "Lattice",
    year: "2018-2020",
    kind: "Product",
    layout: "table",
    rowFill: true,
    image: "/images/project-lattice.png",
    hover: "/images/project-lattice-hover.png",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null;
}

export function getProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

export function projectHref(slug: string) {
  return `/blog/${slug}`;
}
