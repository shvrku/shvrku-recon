"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { portrait, projects } from "@/lib/site";
import { getDomTargets } from "@/lib/dom-targets";
import { getLenisScrollSnapshot } from "@/lib/scroll-bus";
import { getPointerSnapshot } from "@/lib/pointer-bus";
import { getPhotoRevealProgress } from "@/lib/photo-reveal";
import { DOM_SYNC_FRAG, DOM_SYNC_VERT } from "@/shaders/materials";
import { optimizedImageSrc, textureOptimizerWidth } from "@/lib/image";

function createCurlStrengthSampler() {
  let previousScrollY: number | null = null;
  let activity = 0;
  return (scrollY: number, delta: number) => {
    const dt = THREE.MathUtils.clamp(delta, 1 / 240, 0.1);
    const velocity =
      previousScrollY == null ? 0 : Math.abs(scrollY - previousScrollY) / dt;
    previousScrollY = scrollY;
    const target = THREE.MathUtils.clamp(velocity / 800, 0, 1);
    const tau = target > activity ? 0.025 : 0.175;
    const alpha = 1 - Math.exp(-dt / tau);
    activity += (target - activity) * alpha;
    return 0.14 * activity;
  };
}

type LayeredPhoto = {
  slug: string;
  image: string;
  hover: string;
  curlOnly?: boolean;
};

const layered: LayeredPhoto[] = [portrait, ...projects];

type Rect = { left: number; top: number; width: number; height: number };

export function ProjectLayer() {
  const { size, gl } = useThree();
  const curl = useMemo(() => createCurlStrengthSampler(), []);
  const loader = useMemo(() => new THREE.TextureLoader(), []);
  const textures = useRef<Record<string, { base: THREE.Texture; hover: THREE.Texture }>>(
    {},
  );
  const materials = useRef<THREE.ShaderMaterial[]>([]);
  const meshes = useRef<THREE.Mesh[]>([]);
  const uniformsList = useMemo(
    () =>
      layered.map(() => ({
        map: { value: null as THREE.Texture | null },
        mapHover: { value: null as THREE.Texture | null },
        uRect: { value: new THREE.Vector4(0, 0, 0, 0) },
        uHoverRevealProgress: { value: 0 },
        uDotPixelSize: { value: 10 },
        uViewportPx: { value: new THREE.Vector2(1, 1) },
        uCurlStrength: { value: 0 },
        uCurlOnly: { value: 0 },
        uRevealProgress: { value: 0 },
      })),
    [],
  );
  const rects = useRef<Record<string, Rect>>({});
  const hover = useRef<Record<string, number>>({});

  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    const configure = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.anisotropy = maxAniso;
    };

    layered.forEach((p) => {
      const width = textureOptimizerWidth(p.slug);
      const baseSrc = optimizedImageSrc(p.image, width);
      const hoverSrc =
        p.hover === p.image ? baseSrc : optimizedImageSrc(p.hover, width);
      const base = loader.load(baseSrc);
      configure(base);
      const hoverTex =
        hoverSrc === baseSrc
          ? base
          : (() => {
              const t = loader.load(hoverSrc);
              configure(t);
              return t;
            })();
      textures.current[p.slug] = { base, hover: hoverTex };
    });

    return () => {
      Object.values(textures.current).forEach((t) => {
        t.base.dispose();
        if (t.hover !== t.base) t.hover.dispose();
      });
      textures.current = {};
    };
  }, [gl, loader]);

  const geos = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
        3,
      ),
    );
    geo.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2),
    );
    return geo;
  }, []);

  useFrame((_, delta) => {
    const scroll = getLenisScrollSnapshot();
    const curlStrength = curl(scroll.scrollTop, delta);
    const pointer = getPointerSnapshot();
    const targets = getDomTargets();

    layered.forEach((p, index) => {
      const target = targets.get(p.slug);
      const mat = materials.current[index];
      const mesh = meshes.current[index];
      if (!mat || !mesh) return;

      const tex = textures.current[p.slug];
      if (tex) {
        mat.uniforms.map.value = tex.base;
        mat.uniforms.mapHover.value = tex.hover;
      }

      if (!target || !tex) {
        mesh.visible = false;
        return;
      }

      const r = target.el.getBoundingClientRect();
      const rect: Rect = {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      };
      rects.current[p.slug] = rect;

      if (rect.width < 2) {
        mesh.visible = false;
        return;
      }

      const far =
        rect.top > window.innerHeight + 400 || rect.top + rect.height < -400;
      if (far) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;

      const curlOnly = Boolean(p.curlOnly);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      if (!curlOnly) {
        const over =
          pointer.inside &&
          pointer.clientX >= rect.left &&
          pointer.clientX <= rect.left + rect.width &&
          pointer.clientY >= rect.top &&
          pointer.clientY <= rect.top + rect.height;
        const hp = hover.current[p.slug] ?? 0;
        let nextHover = THREE.MathUtils.damp(
          hp,
          over ? 1 : 0,
          over ? 8 : 5,
          delta,
        );
        if (nextHover > 0.98) nextHover = 1;
        if (nextHover < 0.02) nextHover = 0;
        hover.current[p.slug] = nextHover;
      } else {
        hover.current[p.slug] = 0;
      }

      const vw = Math.max(size.width, 1);
      const vh = Math.max(size.height, 1);
      const x = rect.left / vw;
      const y = 1 - (rect.top + rect.height) / vh;
      const rw = rect.width / vw;
      const rh = rect.height / vh;
      mat.uniforms.uRect.value.set(x, y, rw, rh);
      mat.uniforms.uHoverRevealProgress.value = hover.current[p.slug];
      mat.uniforms.uCurlStrength.value = reduced ? 0 : curlStrength;
      mat.uniforms.uCurlOnly.value = curlOnly ? 1 : 0;
      mat.uniforms.uRevealProgress.value = reduced
        ? 1
        : getPhotoRevealProgress(p.slug);
      mat.uniforms.uViewportPx.value.set(size.width, size.height);
    });
  });

  return (
    <>
      {layered.map((p, i) => (
        <mesh
          key={p.slug}
          ref={(el) => {
            if (el) meshes.current[i] = el;
          }}
          geometry={geos}
          frustumCulled={false}
          renderOrder={1}
        >
          <shaderMaterial
            ref={(el) => {
              if (el) materials.current[i] = el;
            }}
            vertexShader={DOM_SYNC_VERT}
            fragmentShader={DOM_SYNC_FRAG}
            uniforms={uniformsList[i]}
            transparent
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}
