"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBoot } from "@/lib/boot";
import { subscribeGsapTick } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/** Same glyph pool as haoqi.design ScrambleLines. */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=?/<>[]{}";

const LETTER_DELAY_MAX = 42;
const LETTER_DELAY_MIN = 10;
const SCRAMBLE_MAX = 160;
const SCRAMBLE_MIN = 64;
/** Cap on letter-cascade time so long lines finish quickly. */
const CASCADE_BUDGET_MS = 820;

function randChar() {
  return CHARS[(Math.random() * CHARS.length) | 0];
}

/** Longer copy → tighter stagger so decode time stays bounded. */
function timingForLength(length: number) {
  const n = Math.max(length, 1);
  const letterDelay = Math.round(
    Math.min(LETTER_DELAY_MAX, Math.max(LETTER_DELAY_MIN, CASCADE_BUDGET_MS / n)),
  );
  const scrambleMs = Math.round(
    Math.min(SCRAMBLE_MAX, Math.max(SCRAMBLE_MIN, letterDelay * 3.2)),
  );
  return { letterDelay, scrambleMs };
}

function WidthLockedChar({
  ch,
  show,
  opacity = 1,
}: {
  ch: string;
  show: string;
  opacity?: number;
}) {
  return (
    <span className="scramble__ch">
      <span className="scramble__ghost" aria-hidden="true">
        {ch}
      </span>
      <span
        className="scramble__live"
        style={{ opacity }}
        aria-hidden={show !== ch || opacity < 1}
      >
        {show}
      </span>
    </span>
  );
}

export function ScrambleText({
  text,
  as: Tag = "span",
  className,
  play = true,
  delay = 0,
  inView = false,
  waitBoot = true,
  reverse = false,
}: {
  text: string;
  as?: "span" | "button" | "a" | "p" | "h1" | "h2";
  className?: string;
  play?: boolean;
  /** Start delay in ms (Haoqi startDelayMs). */
  delay?: number;
  inView?: boolean;
  waitBoot?: boolean;
  reverse?: boolean;
}) {
  const { ready: bootReady } = useBoot();
  const gateOpen = waitBoot ? bootReady : true;
  const node = useRef<HTMLElement | null>(null);
  const startedAt = useRef(0);
  const armed = useRef(!inView);
  const [now, setNow] = useState(0);
  const [settled, setSettled] = useState(false);
  const [running, setRunning] = useState(false);

  const chars = useMemo(() => Array.from(text), [text]);
  const total = chars.length;
  const { letterDelay, scrambleMs } = useMemo(
    () => timingForLength(total),
    [total],
  );
  const duration =
    delay + (total > 0 ? (total - 1) * letterDelay : 0) + scrambleMs;

  useEffect(() => {
    startedAt.current = 0;
    setNow(0);
    setSettled(false);
    setRunning(false);
    armed.current = !inView;
  }, [text, inView]);

  useEffect(() => {
    if (!inView) {
      armed.current = true;
      return;
    }
    const el = node.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) armed.current = true;
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, text]);

  useEffect(() => {
    if (!play || !gateOpen || settled) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setSettled(true);
      setRunning(false);
      return;
    }

    const onTick = (t: number) => {
      if (!armed.current) return;
      if (!startedAt.current) {
        startedAt.current = t;
        setRunning(true);
      }
      setNow(t);
      if (t - startedAt.current >= duration) {
        setSettled(true);
        setRunning(false);
      }
    };

    return subscribeGsapTick(onTick);
  }, [text, play, delay, gateOpen, settled, duration]);

  const rawElapsed =
    running && startedAt.current ? now - startedAt.current - delay : -1;
  const active = settled || (running && rawElapsed >= 0);
  const elapsed = Math.max(0, rawElapsed);
  const hideShell = !active && !settled;

  // Settled: plain text (no per-char DOM). Pre-start: plain + opacity 0 (stable paint size).
  if (settled || !active) {
    return (
      <Tag
        className={cn("scramble", className)}
        style={hideShell ? { opacity: 0 } : undefined}
        ref={(el: HTMLElement | null) => {
          node.current = el;
        }}
      >
        {text}
      </Tag>
    );
  }

  let order = 0;
  const body = chars.map((ch, i) => {
    if (ch === "\n") {
      order += 1;
      return <br key={`br-${i}`} />;
    }

    const index = reverse ? total - 1 - order : order;
    order += 1;

    if (ch === " ") {
      return <span key={`sp-${i}`}> </span>;
    }

    const start = index * letterDelay;
    const end = start + scrambleMs;

    if (elapsed < start) {
      return <WidthLockedChar key={`ch-${i}`} ch={ch} show={ch} opacity={0} />;
    }
    if (elapsed < end) {
      return <WidthLockedChar key={`ch-${i}`} ch={ch} show={randChar()} />;
    }
    return <WidthLockedChar key={`ch-${i}`} ch={ch} show={ch} />;
  });

  return (
    <Tag
      className={cn("scramble", className)}
      ref={(el: HTMLElement | null) => {
        node.current = el;
      }}
    >
      {body}
    </Tag>
  );
}
