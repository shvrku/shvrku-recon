"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE, gsap, gsapToPromise, prefersReducedMotion } from "@/lib/gsap";

export type BootStage =
  | "boot"
  | "fonts"
  | "dom"
  | "assets"
  | "atmosphere"
  | "ready"
  | "reveal";

type BootLog = { t: number; stage: string; detail?: string };

type BootApi = {
  ready: boolean;
  progress: number;
  stage: BootStage;
  logs: BootLog[];
  debug: boolean;
  log: (stage: string, detail?: string) => void;
};

const BootContext = createContext<BootApi>({
  ready: false,
  progress: 0,
  stage: "boot",
  logs: [],
  debug: false,
  log: () => {},
});

export const useBoot = () => useContext(BootContext);

/** One boot per tab session — reload resets, client navigations skip. */
let sessionBootFinished = false;

function waitForWindowLoad(timeoutMs: number) {
  if (document.readyState === "complete") return Promise.resolve();
  return Promise.race([
    new Promise<void>((resolve) => {
      window.addEventListener("load", () => resolve(), { once: true });
    }),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
  ]);
}

export function BootProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(sessionBootFinished);
  const [progress, setProgress] = useState(sessionBootFinished ? 1 : 0);
  const [stage, setStage] = useState<BootStage>(
    sessionBootFinished ? "reveal" : "boot",
  );
  const [logs, setLogs] = useState<BootLog[]>([]);
  const [debug, setDebug] = useState(false);
  const t0 = useRef(0);

  const log = useCallback((next: string, detail?: string) => {
    setLogs((prev) => [
      ...prev,
      { t: performance.now() - (t0.current || performance.now()), stage: next, detail },
    ]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setDebug((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
  if (sessionBootFinished) {
      setReady(true);
      setProgress(1);
      setStage("reveal");
      return;
    }

    t0.current = performance.now();
    setReady(false);
    setProgress(0);
    setStage("boot");
    setLogs([]);

    if (prefersReducedMotion()) {
      sessionBootFinished = true;
      setProgress(1);
      setStage("reveal");
      setReady(true);
      return;
    }

    const state = { p: 0 };
    let cancelled = false;

    const step = async (
      next: BootStage,
      target: number,
      detail?: string,
      work?: () => Promise<void>,
    ) => {
      if (cancelled) return;
      setStage(next);
      log(next, detail);
      await gsapToPromise(state, {
        p: target,
        duration: 0.35,
        ease: EASE.inOut,
        onUpdate: () => setProgress(state.p),
      });
      if (work) await work();
    };

    const run = async () => {
      await step("boot", 0.08, "boot sequence");
      if (cancelled) return;

      await step("fonts", 0.28, "document.fonts.ready", async () => {
        try {
          await Promise.race([
            document.fonts.ready,
            new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
          ]);
        } catch {
          /* ignore */
        }
      });
      if (cancelled) return;

      await step("dom", 0.48, "hydrate + layout");
      if (cancelled) return;

      await step("assets", 0.72, "window load", () => waitForWindowLoad(1800));
      if (cancelled) return;

      await step("atmosphere", 0.9, "warm-up");
      if (cancelled) return;

      await step("ready", 1, "boot complete");
      if (cancelled) return;

      setStage("reveal");
      log("reveal", "fade boot screen");
      await gsapToPromise(state, { p: 1, duration: 0.48, ease: EASE.out });

      if (!cancelled) {
        sessionBootFinished = true;
        setReady(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
      gsap.killTweensOf(state);
    };
  }, [log]);

  const value = useMemo(
    () => ({ ready, progress, stage, logs, debug, log }),
    [ready, progress, stage, logs, debug, log],
  );

  return <BootContext.Provider value={value}>{children}</BootContext.Provider>;
}
