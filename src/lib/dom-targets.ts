export type DomTarget = {
  el: HTMLElement;
  src?: string;
  hoverSrc?: string;
};

const targets = new Map<string, DomTarget>();
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) listener();
};

export function registerDomTarget(
  key: string,
  el: HTMLElement | null,
  extra?: Omit<DomTarget, "el">,
) {
  if (!el) {
    if (targets.delete(key)) emit();
    return;
  }
  targets.set(key, { el, ...extra });
  emit();
}

export function getDomTarget(key: string) {
  return targets.get(key);
}

export function getDomTargets() {
  return targets;
}

export function subscribeDomTargets(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
