import { isReadingPage } from "@/lib/routes";

/** Overlay fills — match reading-page pure black / light paper. */
export const OVERLAY_DARK = "#000000";
export const OVERLAY_LIGHT = "#fbfbfd";
/** Pick fade color from the page we're navigating to. */
export function overlayColorForPath(
  pathname: string,
  userTheme: "light" | "dark",
) {
  if (!isReadingPage(pathname)) return OVERLAY_DARK;
  return userTheme === "light" ? OVERLAY_LIGHT : OVERLAY_DARK;
}
