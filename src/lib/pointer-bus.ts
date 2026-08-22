import * as THREE from "three";

export type PointerSnapshot = {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  inside: boolean;
};

const uv = new THREE.Vector2(0.5, 0.5);
const insideRef = { current: false };
let snapshot: PointerSnapshot = {
  x: 0.5,
  y: 0.5,
  clientX: 0,
  clientY: 0,
  inside: false,
};
const listeners = new Set<() => void>();
let raf = 0;

const notify = () => {
  raf = 0;
  for (const listener of listeners) listener();
};

const scheduleNotify = () => {
  if (raf) return;
  raf = requestAnimationFrame(notify);
};

const updatePointer = (next: PointerSnapshot) => {
  snapshot = next;
  uv.set(next.x, next.y);
  insideRef.current = next.inside;
  scheduleNotify();
};

const toUv = (clientX: number, clientY: number): PointerSnapshot => {
  const w = Math.max(window.innerWidth, 1);
  const h = Math.max(window.innerHeight, 1);
  return {
    x: clientX / w,
    y: 1 - clientY / h,
    clientX,
    clientY,
    inside: true,
  };
};

const settle = () =>
  updatePointer({
    x: 0.5,
    y: 0.5,
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight / 2,
    inside: false,
  });

export function bindPointerBus() {
  const onMove = (e: PointerEvent) => updatePointer(toUv(e.clientX, e.clientY));
  const onLeave = () => settle();
  const onBlur = () => settle();
  const onVisibility = () => {
    if (document.hidden) settle();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

export const getPointerUv = () => uv;
export const getPointerInside = () => insideRef.current;
export const getPointerSnapshot = () => snapshot;
export const subscribePointer = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
