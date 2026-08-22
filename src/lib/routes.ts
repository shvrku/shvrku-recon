/** Long-form reading routes — native scroll, no cursor / pointer chrome. */
export function isReadingPage(pathname: string) {
  return (
    pathname === "/about" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/")
  );
}

/** Bare live preview frames — no chrome, cursor, or project WebGL canvas. */
export function isLivePreviewPage(pathname: string) {
  return pathname === "/live-previews";
}

/** @deprecated Use isLivePreviewPage */
export function isOgPreviewPage(pathname: string) {
  return isLivePreviewPage(pathname);
}

export function isMinimalChromePage(pathname: string) {
  return isReadingPage(pathname) || isLivePreviewPage(pathname);
}
/** Reading routes only — homepage stays dark with no toggle. */
export function showThemeToggle(pathname: string) {
  return isReadingPage(pathname);
}