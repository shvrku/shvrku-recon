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
  /** Matches project cards — see photoCurl. */
  curlScale: 1,
};

/** Shared scroll-curl tuning for homepage WebGL photos (portrait + projects). */
export const photoCurl = {
  maxStrength: 0.05,
  velocityDivisor: 1050,
} as const;

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
  headline: ["Gracefully designing", "digital experiences."],
  bio: "I lead design engineering and AI exploration, shaping products where interface, systems, and model behavior meet. Outside commissioned work, I build tools that make teams faster without making them careless.",
  profileLead:
    "Steering agents to build experices.",
  profileBody:
    "I'm currently at Hinthar working on their School Management System, and previously shipped shvrku-site under the SHVRKU identity.",
  timezone: "Asia/Yangon",
  timezoneLabel: "YGN",
  weather: { lat: 16.8409, lon: 96.1735 },
  footerQuote: "Refuse to be underestimated.",
  email: "shvrku@gmail.com",
  year: 2026,
  socials: [,
    { label: "GitHub", href: "https://github.com/shvrku" },,
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
    slug: "shvrku",
    title: "SHVRKU",
    year: "2020-Present",
    kind: "Brand Identity",
    layout: "table",
    rowFill: true,
    image: "/images/project-shvrku.png",
    hover: "/images/project-shvrku-hover.png",
  },
  {
    slug: "shvrku-site",
    title: "shvrku-site",
    year: "2024",
    kind: "Coding Project",
    layout: "table",
    rowFill: true,
    image: "/images/project-shvrku-site.png",
    hover: "/images/project-shvrku-site.png",
  },
  {
    slug: "shvrku-dashboard",
    title: "shvrku-dashboard",
    year: "2024",
    kind: "Coding Project",
    layout: "table",
    rowFill: true,
    image: "/images/project-shvrku-dashboard.png",
    hover: "/images/project-shvrku-dashboard.png",
  },
  {
    slug: "shvrku-home-v2",
    title: "shvrku Home V2",
    year: "2023",
    kind: "Coding Project",
    layout: "table",
    rowFill: true,
    image: "/images/project-shvrku-home-v2.png",
    hover: "/images/project-shvrku-home-v2.png",
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
