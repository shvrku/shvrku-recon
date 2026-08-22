"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
const VERT = `
attribute vec2 a_pos;
varying vec2 vUv;
void main() {
  vUv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FIELD_FRAG = `
precision highp float;
uniform float uTime;
uniform float uAmplitude;
varying vec2 vUv;

void main() {
  vec2 c = 2.0 * vUv - 1.0;
  float t = uTime;
  float a = uAmplitude;

  c += a * 0.40 * sin(c.yx + vec2(1.2, 3.4) + t);
  c += a * 0.20 * sin(5.2 * c.yx + vec2(3.5, 0.4) + t);
  c += a * 0.30 * sin(3.5 * c.yx + vec2(1.2, 3.1) + t);
  c += a * 1.60 * sin(0.4 * c.yx + vec2(0.8, 2.4) + t);

  float L = length(c);
  float v = 0.0;
  for (int i = 0; i < 4; i++) {
    v = mix(v, float(i) / 3.0, cos(float(i) * L));
  }

  gl_FragColor = vec4(clamp(v, 0.0, 1.0), 0.0, 0.0, 1.0);
}
`;

const DOT_FRAG = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform sampler2D uFieldTex;
uniform vec2 uFieldRes;
uniform vec2 uResolution;
uniform float uPixelSize;
uniform float uContrast;
uniform float uBias;
uniform float uWaveTime;
uniform float uWaveFrequency;
uniform float uWaveAmplitude;
uniform float uDark;
uniform float uCrush;
uniform vec3 uFg;
uniform vec3 uDeep;
uniform vec3 uMist;
varying vec2 vUv;

float lumaToRadius(float luma, float pixelSize, float biasOffset) {
  float v = clamp((luma - 0.5 + uBias + biasOffset) * uContrast + 0.5, 0.0, 1.0);
  return v * pixelSize * 0.6 + pixelSize * 0.05;
}

void main() {
  vec2 pixelCoord = vUv * uResolution;
  vec2 baseCellIndex = floor(pixelCoord / uPixelSize);
  float minDist = 1.0e5;

  for (int dx = -1; dx <= 1; dx++) {
    for (int dy = -1; dy <= 1; dy++) {
      vec2 cellIndex = baseCellIndex + vec2(float(dx), float(dy));
      if (mod(cellIndex.x + cellIndex.y, 2.0) > 0.5) continue;
      vec2 cellCenter = (cellIndex + 0.5) * uPixelSize;
      vec2 fieldUv = (cellIndex + 0.5) / uFieldRes;
      float luma = texture2D(uFieldTex, fieldUv).r;
      float cellY = cellCenter.y / uResolution.y;
      float wavePhase = cellY * uWaveFrequency * 6.2831853 - uWaveTime;
      float waveBias = sin(wavePhase) * uWaveAmplitude;
      float dist = length(pixelCoord - cellCenter);
      float radius = lumaToRadius(luma, uPixelSize, waveBias);
      minDist = min(minDist, dist - radius);
    }
  }

  float aa = max(fwidth(minDist), 0.0001);
  float shape = 1.0 - smoothstep(-aa, aa, minDist);
  float field = texture2D(uFieldTex, vUv).r;
  // Hero only: crush the bottom into near-solid deep black for the wordmark.
  float bottom = (1.0 - smoothstep(0.02, 0.34, vUv.y)) * uCrush;
  float fieldLift = field * (1.0 - bottom * 0.92);
  vec3 liquid = mix(uDeep, uMist, smoothstep(0.16, 0.88, fieldLift));
  float smear = exp(-pow((vUv.y - 0.58) / 0.18, 2.0)) * 0.22 * (1.0 - bottom);
  liquid += vec3(0.16, 0.11, 0.07) * smear * uDark;
  float warmBand = exp(-pow((vUv.y - 0.54) / 0.13, 2.0)) * 0.10 * (1.0 - bottom);
  liquid += vec3(0.14, 0.09, 0.05) * warmBand * uDark;
  float dots = shape * (1.0 - bottom * 0.88);
  vec3 dotted = mix(liquid, uFg, dots);
  gl_FragColor = vec4(mix(dotted, uDeep, bottom * 0.82), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function program(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.bindAttribLocation(p, 0, "a_pos");
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

function makeGrainUrl(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 60 + Math.random() * 160;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

export function Atmosphere({
  className,
  crushBottom = true,
}: {
  className?: string;
  crushBottom?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const crushRef = useRef(crushBottom ? 1 : 0);
  crushRef.current = crushBottom ? 1 : 0;

  useEffect(() => {
    if (grainRef.current && !grainRef.current.style.backgroundImage) {
      grainRef.current.style.backgroundImage = `url(${makeGrainUrl()})`;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    gl.getExtension("OES_standard_derivatives");

    const fieldProg = program(gl, VERT, FIELD_FRAG);
    const dotProg = program(gl, VERT, DOT_FRAG);
    if (!fieldProg || !dotProg) return;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const fieldTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const fbo = gl.createFramebuffer();
    const pixelSize = 3;
    let fieldW = 1;
    let fieldH = 1;

    const loc = {
      fieldTime: gl.getUniformLocation(fieldProg, "uTime"),
      fieldAmp: gl.getUniformLocation(fieldProg, "uAmplitude"),
      fieldTex: gl.getUniformLocation(dotProg, "uFieldTex"),
      fieldRes: gl.getUniformLocation(dotProg, "uFieldRes"),
      res: gl.getUniformLocation(dotProg, "uResolution"),
      pixel: gl.getUniformLocation(dotProg, "uPixelSize"),
      contrast: gl.getUniformLocation(dotProg, "uContrast"),
      bias: gl.getUniformLocation(dotProg, "uBias"),
      waveTime: gl.getUniformLocation(dotProg, "uWaveTime"),
      waveFreq: gl.getUniformLocation(dotProg, "uWaveFrequency"),
      waveAmp: gl.getUniformLocation(dotProg, "uWaveAmplitude"),
      dark: gl.getUniformLocation(dotProg, "uDark"),
      crush: gl.getUniformLocation(dotProg, "uCrush"),
      fg: gl.getUniformLocation(dotProg, "uFg"),
      deep: gl.getUniformLocation(dotProg, "uDeep"),
      mist: gl.getUniformLocation(dotProg, "uMist"),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let alive = true;
    let visible = true;
    let time = 0;
    let last = performance.now();

    const bindQuad = (prog: WebGLProgram) => {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    };

    const resize = () => {
      const w = Math.max(2, canvas.clientWidth);
      const h = Math.max(2, canvas.clientHeight);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      fieldW = Math.max(2, Math.ceil(w / pixelSize) + 1);
      fieldH = Math.max(2, Math.ceil(h / pixelSize) + 1);
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        fieldW,
        fieldH,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        fieldTex,
        0,
      );
    };

    const draw = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const dt = Math.min(3, (now - last) / (1000 / 60));
      last = now;
      if (!reduced.matches) time += 0.0065 * dt;

      resize();

      bindQuad(fieldProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, fieldW, fieldH);
      gl.uniform1f(loc.fieldTime, time);
      gl.uniform1f(loc.fieldAmp, 1.45);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      bindQuad(dotProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.uniform1i(loc.fieldTex, 0);
      gl.uniform2f(loc.fieldRes, fieldW, fieldH);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.pixel, pixelSize);
      gl.uniform1f(loc.contrast, 0.95);
      gl.uniform1f(loc.bias, -0.22);
      gl.uniform1f(loc.waveTime, time);
      gl.uniform1f(loc.waveFreq, 3.6);
      gl.uniform1f(loc.waveAmp, 0.26);
      gl.uniform1f(loc.dark, 1);
      gl.uniform1f(loc.crush, crushRef.current);
      gl.uniform3f(loc.fg, 0.48, 0.45, 0.41);
      gl.uniform3f(loc.deep, 8.0 / 255.0, 8.0 / 255.0, 7.0 / 255.0);
      gl.uniform3f(loc.mist, 0.26, 0.22, 0.18);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const host = wrapRef.current;
    const io = host
      ? new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
          },
          { rootMargin: "10% 0px", threshold: 0 },
        )
      : null;
    if (host && io) io.observe(host);

    raf = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io?.disconnect();
      gl.deleteBuffer(quad);
      gl.deleteTexture(fieldTex);
      gl.deleteFramebuffer(fbo);
      gl.deleteProgram(fieldProg);
      gl.deleteProgram(dotProg);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      data-atmosphere
      className={cn(
        "hero-atmosphere pointer-events-none absolute inset-0 z-[1] overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div ref={grainRef} className="hero-grain" />
    </div>
  );
}
