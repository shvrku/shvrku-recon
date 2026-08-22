const ISO_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

/** Parse `YYYY-MM-DD` (day/month may be unpadded). Returns null if invalid. */
export function parseBlogDate(iso: string): Date | null {
  const match = iso.trim().match(ISO_DATE);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function blogDateMs(iso: string): number {
  return parseBlogDate(iso)?.getTime() ?? 0;
}

export type BlogDateStyle = "long" | "short" | "footer";

const DATE_FORMAT: Record<BlogDateStyle, Intl.DateTimeFormatOptions> = {
  long: { month: "long", day: "numeric", year: "numeric" },
  short: { month: "short", day: "numeric", year: "numeric" },
  footer: { month: "short", day: "2-digit", year: "numeric" },
};

/** Format a blog ISO date; falls back to the raw string if not parseable. */
export function formatBlogDate(iso: string, style: BlogDateStyle = "long"): string {
  const date = parseBlogDate(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat("en-US", DATE_FORMAT[style]).format(date);
}
