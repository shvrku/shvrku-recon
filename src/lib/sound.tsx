"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  tick: () => void;
};

const SoundContext = createContext<SoundContextValue>({
  enabled: false,
  toggle: () => {},
  tick: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const ensure = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const tick = useCallback(() => {
    if (!enabled) return;
    const ctx = ensure();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 880;
    gain.gain.value = 0.03;
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }, [enabled, ensure]);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      if (next) ensure();
      return next;
    });
  }, [ensure]);

  const value = useMemo(
    () => ({ enabled, toggle, tick }),
    [enabled, toggle, tick],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
