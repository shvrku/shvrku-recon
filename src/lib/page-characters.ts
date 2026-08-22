/** Count visible characters across page copy (spaces stripped). */
export function pageCharacters(...parts: string[]) {
  return parts.join("").replace(/\s+/g, "").length;
}
