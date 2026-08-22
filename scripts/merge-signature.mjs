import fs from "fs";

/**
 * Merge + smooth mouse-drawn signature strokes.
 * Tunables:
 *   SAMPLE_STEP  — denser = more faithful (px-ish)
 *   CHAIKIN      — rounds corners (2–3 is usually enough)
 *   SIMPLIFY     — RDP epsilon; higher = fewer wiggles
 */

const SAMPLE_STEP = 2.0;
const CHAIKIN = 4;
const SIMPLIFY = 2.4;

const raw = fs.readFileSync("public/signature.svg", "utf8");
const paths = [...raw.matchAll(/d="([^"]+)"/g)].map((m) => m[1]);
const widths = [...raw.matchAll(/stroke-width="([^"]+)"/g)].map((m) =>
  parseFloat(m[1]),
);

let d = "";
for (const p of paths) {
  if (!d) {
    d = p;
    continue;
  }
  const rest = p.replace(/^M\s*[\d.,\s-]+/, "").trim();
  d += " " + rest;
}

const avgW = widths.reduce((a, b) => a + b, 0) / widths.length;

// ── path parse / sample ──────────────────────────────────────

function parseNums(s) {
  return [...s.matchAll(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)].map(Number);
}

/** Absolute cubic segments from M/C path. */
function toCubics(pathD) {
  const tokens = pathD.match(/[MmCcLl]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const cubics = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;

  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === "M" || cmd === "m") {
      const x = +tokens[i++];
      const y = +tokens[i++];
      if (cmd === "m") {
        cx += x;
        cy += y;
      } else {
        cx = x;
        cy = y;
      }
      startX = cx;
      startY = cy;
      while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
        const nx = +tokens[i++];
        const ny = +tokens[i++];
        if (cmd === "m") {
          cubics.push({
            x0: cx,
            y0: cy,
            x1: cx,
            y1: cy,
            x2: cx + nx,
            y2: cy + ny,
            x3: cx + nx,
            y3: cy + ny,
          });
          cx += nx;
          cy += ny;
        } else {
          cubics.push({
            x0: cx,
            y0: cy,
            x1: cx,
            y1: cy,
            x2: nx,
            y2: ny,
            x3: nx,
            y3: ny,
          });
          cx = nx;
          cy = ny;
        }
      }
    } else if (cmd === "C" || cmd === "c") {
      while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
        let x1 = +tokens[i++];
        let y1 = +tokens[i++];
        let x2 = +tokens[i++];
        let y2 = +tokens[i++];
        let x3 = +tokens[i++];
        let y3 = +tokens[i++];
        if (cmd === "c") {
          x1 += cx;
          y1 += cy;
          x2 += cx;
          y2 += cy;
          x3 += cx;
          y3 += cy;
        }
        cubics.push({ x0: cx, y0: cy, x1, y1, x2, y2, x3, y3 });
        cx = x3;
        cy = y3;
      }
    } else if (cmd === "L" || cmd === "l") {
      while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
        let x = +tokens[i++];
        let y = +tokens[i++];
        if (cmd === "l") {
          x += cx;
          y += cy;
        }
        cubics.push({
          x0: cx,
          y0: cy,
          x1: cx,
          y1: cy,
          x2: x,
          y2: y,
          x3: x,
          y3: y,
        });
        cx = x;
        cy = y;
      }
    } else if (cmd === "Z" || cmd === "z") {
      cubics.push({
        x0: cx,
        y0: cy,
        x1: cx,
        y1: cy,
        x2: startX,
        y2: startY,
        x3: startX,
        y3: startY,
      });
      cx = startX;
      cy = startY;
    } else {
      // Unexpected — skip numeric leftovers
      if (!/[A-Za-z]/.test(cmd)) continue;
    }
  }
  return cubics;
}

function cubicPoint(c, t) {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x:
      uu * u * c.x0 +
      3 * uu * t * c.x1 +
      3 * u * tt * c.x2 +
      tt * t * c.x3,
    y:
      uu * u * c.y0 +
      3 * uu * t * c.y1 +
      3 * u * tt * c.y2 +
      tt * t * c.y3,
  };
}

function approxLen(c) {
  let len = 0;
  let prev = cubicPoint(c, 0);
  for (let i = 1; i <= 8; i++) {
    const p = cubicPoint(c, i / 8);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
}

function samplePath(cubics, step) {
  const pts = [];
  for (const c of cubics) {
    const len = Math.max(approxLen(c), step);
    const n = Math.max(1, Math.ceil(len / step));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push(cubicPoint(c, t));
    }
  }
  if (cubics.length) {
    const last = cubics[cubics.length - 1];
    pts.push({ x: last.x3, y: last.y3 });
  }
  return pts;
}

function chaikin(pts, iterations) {
  let cur = pts;
  for (let n = 0; n < iterations; n++) {
    if (cur.length < 3) break;
    const next = [cur[0]];
    for (let i = 0; i < cur.length - 1; i++) {
      const a = cur[i];
      const b = cur[i + 1];
      next.push({
        x: 0.75 * a.x + 0.25 * b.x,
        y: 0.75 * a.y + 0.25 * b.y,
      });
      next.push({
        x: 0.25 * a.x + 0.75 * b.x,
        y: 0.25 * a.y + 0.75 * b.y,
      });
    }
    next.push(cur[cur.length - 1]);
    cur = next;
  }
  return cur;
}

function rdp(pts, epsilon) {
  if (pts.length < 3) return pts;
  const first = pts[0];
  const last = pts[pts.length - 1];
  let maxDist = 0;
  let idx = 0;
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const den = dx * dx + dy * dy || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const t = ((p.x - first.x) * dx + (p.y - first.y) * dy) / den;
    const projX = first.x + t * dx;
    const projY = first.y + t * dy;
    const dist = Math.hypot(p.x - projX, p.y - projY);
    if (dist > maxDist) {
      maxDist = dist;
      idx = i;
    }
  }
  if (maxDist > epsilon) {
    const left = rdp(pts.slice(0, idx + 1), epsilon);
    const right = rdp(pts.slice(idx), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

/** Catmull-Rom → cubic Bezier SVG path */
function toSmoothPath(pts) {
  if (pts.length < 2) return "";
  const f = (n) => n.toFixed(2);
  let d = `M ${f(pts[0].x)},${f(pts[0].y)}`;
  if (pts.length === 2) {
    d += ` L ${f(pts[1].x)},${f(pts[1].y)}`;
    return d;
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    // centripetal-ish Catmull-Rom → Bezier (tension 1)
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return d;
}

const cubics = toCubics(d);
let pts = samplePath(cubics, SAMPLE_STEP);
pts = chaikin(pts, CHAIKIN);
pts = rdp(pts, SIMPLIFY);
// Soft second pass after simplify so corners stay soft
pts = chaikin(pts, 2);
const smoothD = toSmoothPath(pts);

const viewBox = "28 26 336 128";

fs.writeFileSync(
  "public/signature-clean.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">
  <path d="${smoothD}" stroke="currentColor" stroke-width="${avgW.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
);

fs.writeFileSync(
  "src/components/effects/signature-path.ts",
  `/** Merged + smoothed stroke from /public/signature.svg */\nexport const SIGNATURE_PATH = ${JSON.stringify(smoothD)};\n/** Full bounds of the ink including the end streak. */\nexport const SIGNATURE_VIEWBOX = ${JSON.stringify(viewBox)};\nexport const SIGNATURE_STROKE = ${avgW.toFixed(2)};\n`,
);

console.log({
  segments: paths.length,
  avgW,
  rawPts: samplePath(cubics, SAMPLE_STEP).length,
  smoothPts: pts.length,
  dChars: smoothD.length,
  tunables: { SAMPLE_STEP, CHAIKIN, SIMPLIFY },
});
